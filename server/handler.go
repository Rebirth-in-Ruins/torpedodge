package main

import (
	"log/slog"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: only localhost and torpedodge.resamvi.io
	},
}

// HTTP endpoint to start watching the game.
func (s *Server) play(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		return
	}

	// Don't listen to messages from spectators
	spectator := false

	spectates := r.URL.Query().Get("spectate")
	if spectates != "" {
		spectator = true
		slog.Info("spectator connected")
	} else {
		slog.Info("player connected")
	}

	client := &Client{server: s, conn: conn, send: make(chan []byte, 1024), spectator: spectator}
	s.clients[client] = true

	go client.writeMessages()
	go client.readMessages()
}
