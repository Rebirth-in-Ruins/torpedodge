package websockets

import (
	"log/slog"
	"net/http"

	"github.com/coder/websocket"
)

// HTTP endpoint to start watching the game.
func (s *Server) play(w http.ResponseWriter, r *http.Request) {
	// Determine if client wants to spectate
	spectator := false

	spectates := r.URL.Query().Get("spectate")
	if spectates != "" {
		spectator = true
		slog.Info("spectator connected")
	} else {
		slog.Info("player connected")
	}

	// Don't allow new players if room is locked
	if s.state.Settings.Locked && !spectator {
		slog.Warn("entry denied for new player")
		w.WriteHeader(http.StatusLocked)
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify:   true,
	})
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		w.WriteHeader(http.StatusInternalServerError)
		return
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


func (s *Server) lock(w http.ResponseWriter, r *http.Request) {
	username, password, ok := r.BasicAuth()
	if !ok || username != s.username || password != s.password {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	s.state.LockRoom()
}

func (s *Server) pause(w http.ResponseWriter, r *http.Request) {
	username, password, ok := r.BasicAuth()
	if !ok || username != s.username || password != s.password {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	s.state.PauseGame()
}
