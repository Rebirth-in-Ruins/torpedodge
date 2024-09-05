package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/rebirth-in-ruins/torpedodge/server/game"
	"github.com/rebirth-in-ruins/torpedodge/server/websockets"
)

func main() {
	gameState := game.New(game.Settings{
		TurnDuration: 2 * time.Second,
		GridSize: 12,
		InventorySize: 2,
		BombRespawnTime: 3,
		StartHealth: 3,
	})

	server, mux := websockets.New(gameState)
	go server.StartGame()

	slog.Info("Started server")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		slog.Error("ListenAndServe failed", slog.String("error", err.Error()))
	}
}

