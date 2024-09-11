// Package main implements a bot that circles around and drops a bomb occasionally.
package main

import (
	"context"
	"log"
	"log/slog"
	"math/rand/v2"
	"os"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/rebirth-in-ruins/torpedodge/server/game"
)

const (
	// urlStr = "wss://gameserver.resamvi.io/play"
	urlStr = "ws://localhost:8080/play"
)

var (
	directions = []string{"LEFT", "BOMBLEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP"}

	name = []string{
		"Ella Atkinson",
		"Duke Krueger",
		"Kamari Solis",
		"Ronin Santana",
		"Myra Fuller",
		"Andre Montes",
		"Roselyn Frederick",
		"Kase Gregory",
		"Alaya Herman",
		"Juelz Frost",
		"Paula Reyna",
		"Reginald Kirby",
		"Skyla Holt",
		"Niko Garrison",
		"Cadence Graham",
	}
)

func main() {
	conn, _, err := websocket.Dial(context.Background(), urlStr, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.CloseNow()

	// Join as player
	name := name[rand.IntN(len(name))]
	err = wsjson.Write(context.Background(), conn, "JOIN "+name)
	if err != nil {
		log.Fatal(err)
	}

	i := 0

	for {
		// RECEIVE NEXT STATE
		var state game.GameStateResponse
		err = wsjson.Read(context.Background(), conn, &state)
		if err != nil {
			os.Exit(1)
		}

		// Sail in a circle
		action := directions[i % len(directions)]

		slog.Info(action)

		// SEND ACTION
		err = wsjson.Write(context.Background(), conn, action)
		if err != nil {
			log.Fatal(err)
		}

		i++
	}
}
