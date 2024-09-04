package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/rebirth-in-ruins/torpedodge/server/math"
)

// Server maintains the set of active clients and broadcasts messages to the
// clients.
type Server struct {
	// connected clients.
	clients map[*Client]bool

	settings Settings
	state GameState
}

type Settings struct {
	turnDuration time.Duration
	gridSize int
}

func newServer(settings Settings) *Server {
	return &Server{
		clients:    make(map[*Client]bool),

		settings: settings,
		state: GameState{
			Players: []Player{
				{ X: 3, Y: 3},
			},
		},
	}
}

type GameState struct {
	Players []Player `json:"players"`

	playerPositions [][]*Player
}

type Player struct {
	X int
	Y int
}

func (s *Server) runSimulation() GameState {
	slog.Info("simulation executed")

	p := math.NewGrid[Player](s.settings.gridSize)
	p[3][3] = &Player{X: 3, Y: 3}

	math.PrintGrid(p)

	return GameState{
		Players:         []Player{{X: 3, Y: 3}},
		playerPositions: p,
	}
}

func (s *Server) runGame() {
	ticker := time.NewTicker(s.settings.turnDuration)

	for {
		select {
		case <- ticker.C:
			s.state = s.runSimulation() // TODO: pass collected inputs in here

			message, err := json.Marshal(s.state)
			if err != nil {
				panic(err) // TODO:
			}

			for client := range s.clients {
				select {
				case client.send <- message:
				default:
					panic("broadcast to closed channel occurred")
					close(client.send)
					delete(s.clients, client)
				}
			}
		}
	}
}
