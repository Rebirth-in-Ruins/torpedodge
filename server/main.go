package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/lmittmann/tint"

	"github.com/rebirth-in-ruins/torpedodge/server/game"
	"github.com/rebirth-in-ruins/torpedodge/server/websockets"
)

type Config struct {
	DatabaseURL string `env:"URL" env-default:"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"`
	Username string `env:"USER" env-default:"torpedodge"`
	Password string `env:"PASS" env-default:"torpedodge"`
}

func main() {
	var cfg Config
	err := cleanenv.ReadEnv(&cfg)
	if err != nil {
		log.Fatal(err)
	}

	gameState, err := game.New(cfg.DatabaseURL, game.Settings{
		TurnDuration:        2 * time.Second,
		GridSize:            12,
		InventorySize:       2,
		BombRespawnTime:     3,
		StartHealth:         3,
		AirstrikeFuseLength: 3,
		BombFuseLength:      3,
		DeathTime:           3,
	})
	if err != nil {
		log.Fatal(err)
	}

	server, mux := websockets.New(gameState, cfg.Username, cfg.Password)
	go server.StartGame()

	slog.SetDefault(slog.New(
		tint.NewHandler(os.Stderr, &tint.Options{
			Level:      slog.LevelInfo,
			TimeFormat: time.Stamp,
		}),
	))
  
	slog.Info("Started server")

	err = http.ListenAndServe(":8080", mux)
	if err != nil {
		slog.Error("ListenAndServe failed", slog.String("error", err.Error()))
	}
}

