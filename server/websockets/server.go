package websockets

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/rebirth-in-ruins/torpedodge/server/game"
)

// Server maintains the set of active clients and broadcasts messages to the
// clients.
type Server struct {
	sync.Mutex

	// connected clients.
	clients map[int]*Client

	state *game.Game

	// incremented and used to assign IDs to clients
	counter atomic.Uint64

	// basic auth for restricted endpoints
	username string
	password string
}

func New(state *game.Game, username, password string) (*Server, *http.ServeMux) {
	server := &Server{
		Mutex:    sync.Mutex{},
		clients:  make(map[int]*Client),
		state:    state,
		counter:  atomic.Uint64{},
		username: username,
		password: password,
	}
	server.counter.Add(1) // 0 is reserved as ID for airstrikes

	mux := http.NewServeMux()
	mux.HandleFunc("/play", server.play)
	mux.HandleFunc("/lock", server.lock)
	mux.HandleFunc("/pause", server.pause)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	return server, mux
}

func (s *Server) AddClient(client *Client) {
	s.Lock()
	defer s.Unlock()
	s.clients[client.id] = client
}

func (s *Server) StartGame() {
	ticker := time.NewTicker(s.state.Settings.TurnDuration)

	for {
		// If no players and no spectators, don't run the game
		if len(s.clients) == 0 {
			continue
		}

		select {
		case <- ticker.C:
			s.state.RunSimulation()

			message := s.state.JSON(true)

			s.Lock()
			for _, client := range s.clients {
				select {
				case client.send <- message:
				default:
					// Sometimes the read pipe of spectators is still open
					// even if they closed the the browser which is detected
					// and cleaned up in here.
					slog.Info("write to closed channel occurred")
					close(client.send)
					delete(s.clients, client.id)
				}
			}
			s.Unlock()

		case inputs := <-s.state.Change:
			b, err := json.Marshal(inputs)
			if err != nil {
				slog.Error(err.Error())
			}

			for _, client := range s.clients {
				// This data is only for spectators
				if !client.spectator {
					continue
				}

				select {
				case client.send <- b:
				default:
					slog.Info("write to closed channel occurred")
					close(client.send)
					delete(s.clients, client.id)
				}
			}

		// Game tells server to disconnect a player that has died
		case id := <-s.state.Disconnect:
			client := s.clients[id]
			client.disconnect()
		}
	}
}
