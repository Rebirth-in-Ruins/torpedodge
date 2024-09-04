package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// Server maintains the set of active clients and broadcasts messages to the
// clients.
type Server struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	settings Settings
	state GameState
}

type Settings struct {
	turnDuration time.Duration
}

func newServer(settings Settings) *Server {
	return &Server{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		clients:    make(map[*Client]bool),

		settings: settings,
		state: GameState{
			Players: []Player{
				{ X: 3, Y: 3},
			},
		},
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: only localhost and torpedodge.resamvi.io
	},
}

// HTTP endpoint to start watching the game.
func (h *Server) spectateHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		return
	}

	client := &Client{server: h, conn: conn, send: make(chan []byte, 1024), spectator: true} // TODO: Maybe a channel of game states
	client.server.register <- client

	go client.writePump()
	go client.readPump()
}

// HTTP endpoint to start playing the game.
func (h *Server) joinHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		return
	}

	client := &Client{server: h, conn: conn, send: make(chan []byte, 1024)} // TODO: Maybe a channel of game states
	client.server.register <- client

	// TODO: Specate doesn't need read pump
	go client.writePump()
	go client.readPump()
}

type GameState struct {
	Players []Player `json:"players"`
}

type Player struct {
	X int
	Y int
}

func (s *Server) runSimulation() GameState {
	slog.Info("simulation executed")

	return GameState{
		Players: []Player{
			{ X: 3, Y: 3},
		},
	}
}

func (s *Server) run() {
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
					fmt.Println("broadcast to closed channel occurred")
					close(client.send)
					delete(s.clients, client)
				}
			}

		// User joined
		case client := <-s.register:
			s.clients[client] = true
			slog.Info("client joined")
		}
	}
}
