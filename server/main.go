package main

import (
	"log/slog"
	"net/http"
	"time"
)

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

func main() {
	server := newServer(Settings{
		turnDuration: 2 * time.Second,
		gridSize: 12,
	})
	go server.runGame()

	http.HandleFunc("/play", server.play)

	slog.Info("Started server")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		slog.Error("ListenAndServe failed", slog.String("error", err.Error()))
	}
}

