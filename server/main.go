package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/lmittmann/tint"

	"github.com/rebirth-in-ruins/torpedodge/server/game"
	"github.com/rebirth-in-ruins/torpedodge/server/websockets"
)

func main() {
	gameState := game.New(game.Settings{
		TurnDuration:        2 * time.Second,
		GridSize:            12,
		InventorySize:       2,
		BombRespawnTime:     3,
		StartHealth:         3,
		AirstrikeFuseLength: 3,
		BombFuseLength:      3,
		DeathTime:           3,
	})

	server, mux := websockets.New(gameState, os.Getenv("USER"), os.Getenv("PASS"))
	go server.StartGame()

	slog.SetDefault(slog.New(
		tint.NewHandler(os.Stderr, &tint.Options{
			Level:      slog.LevelInfo,
			TimeFormat: time.Kitchen,
		}),
	))
  
	slog.Info("Started server")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		slog.Error("ListenAndServe failed", slog.String("error", err.Error()))
	}
}

