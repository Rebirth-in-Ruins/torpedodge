package websockets

import (
	"log/slog"
	"net/http"

	"github.com/coder/websocket"
)

// HTTP endpoint to start watching the game.
func (s *Server) play(w http.ResponseWriter, r *http.Request) {
	// TODO: only localhost and torpedodge.resamvi.io
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify:   true,
	})
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		w.WriteHeader(http.StatusInternalServerError)
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

	client := &Client{
		id: int(s.counter.Load()),
		server: s, 
		conn: conn, 
		send: make(chan []byte, 1024), 
		spectator: spectator,
	}
	s.AddClient(client)

	s.counter.Add(1)

	go client.writeMessages()
	go client.readMessages()
}
