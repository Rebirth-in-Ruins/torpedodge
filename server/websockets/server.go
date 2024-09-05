package websockets

import (
	"net/http"
	"time"

	"github.com/rebirth-in-ruins/torpedodge/server/game"
)

// Server maintains the set of active clients and broadcasts messages to the
// clients.
type Server struct {
	// connected clients.
	clients map[int]*Client

	state *game.State

	// incremented and used to assign IDs to clients
	counter int
}

func New(state *game.State) (*Server, *http.ServeMux) {
	server := &Server{
		clients:    make(map[int]*Client),
		state: state,
		counter: 0,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/play", server.play)

	return server, mux
}

func (s *Server) StartGame() {
	ticker := time.NewTicker(s.state.Settings.TurnDuration)

	for {
		select {
		case <- ticker.C:
			s.state.RunSimulation()

			message := s.state.JSON()

			for _, client := range s.clients {
				select {
				case client.send <- message:
				default:
					panic("broadcast to closed channel occurred")
					// close(client.send)
					// delete(s.clients, client.id)
				}
			}
		}
	}
}
