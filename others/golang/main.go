// Package main implements a bot that circles around and drops a bomb occasionally.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/rebirth-in-ruins/torpedodge-clients/inputs"
)

const (
	gameserverURL = "ws://localhost:8080/play"
	playerName = "GolangBot"
)

var (
	directions = []string{"LEFT", "BOMB", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP"}
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

func run() error {
	conn, _, err := websocket.Dial(context.Background(), gameserverURL, nil)
	if err != nil {
		return fmt.Errorf("could not dial server: %w (url: %v)", err, gameserverURL)
	}
	defer conn.CloseNow()

	// Send initial JOIN message with your name
	err = wsjson.Read(context.Background(), conn, "JOIN "+playerName+".go")
	if err != nil {
		return fmt.Errorf("could not join server: %w", err)
	}

	i := 0

	for {
		// RECEIVE NEXT STATE
		var state inputs.GameState
		err := wsjson.Read(context.Background(), conn, state)
		if err != nil {
			return fmt.Errorf("could not read from conn: %w", err)
		}

		// Sail in a circle
		action := directions[i % len(directions)]
		slog.Info(action)

		// SEND ACTION
		err = wsjson.Write(context.Background(), conn, action)
		if err != nil {
			return fmt.Errorf("could not send next action: %w", err)
		}

		i++
	}
}
