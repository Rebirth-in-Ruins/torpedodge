package websockets

import (
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

	state *game.State

	// incremented and used to assign IDs to clients
	counter atomic.Uint64
}

func New(state *game.State) (*Server, *http.ServeMux) {
	server := &Server{
		Mutex:   sync.Mutex{},
		clients: make(map[int]*Client),
		state:   state,
		counter: atomic.Uint64{},
	}
	server.counter.Add(1) // 0 is reserved as ID for airstrikes

	mux := http.NewServeMux()
	mux.HandleFunc("/play", server.play)

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
		select {
		case <- ticker.C:
			s.state.RunSimulation()

			message := s.state.JSON()

			s.Lock()
			for _, client := range s.clients {
				select {
				case client.send <- message:
				default:
					// TODO: I can't explain why this occurs but it's necessary
					// TODO: do we delete clients from the map?
					slog.Info("broadcast to closed channel occurred")
					close(client.send)
					delete(s.clients, client.id)
				}
			}
			s.Unlock()
		case id := <-s.state.Disconnect:
			client := s.clients[id]
			client.disconnect()
		}
	}
}
