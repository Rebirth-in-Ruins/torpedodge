// Package main implements a bot that circles around and drops a bomb occasionally.
package main

import (
	"context"
	"fmt"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/rebirth-in-ruins/torpedodge/server/game"
)

const (
	urlStr = "ws://localhost:8080/play"
)

var (
	directions = []string{"LEFT", "BOMB", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP"}
)

func main() {
	conn, _, err := websocket.Dial(context.Background(), urlStr, nil)
	if err != nil {
		panic(err)
	}
	defer conn.CloseNow()

	// Join as player
	err = wsjson.Write(context.Background(), conn, "JOIN JulienBot")
	if err != nil {
		panic(err)
	}

	i := 0

	for {
		// RECEIVE NEXT STATE
		var state game.GameStateResponse
		err = wsjson.Read(context.Background(), conn, &state)
		if err != nil {
			panic(err)
		}

		// Sail in a circle
		action := directions[i % len(directions)]

		fmt.Println(action)

		// SEND ACTION
		err = wsjson.Write(context.Background(), conn, action)
		if err != nil {
			panic(err)
		}

		i++
	}
}
