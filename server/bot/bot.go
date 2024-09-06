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
	directions = []string{"LEFT", "DOWN", "RIGHT", "UP"}
)

func main() {
	conn, _, err := websocket.Dial(context.Background(), "ws://localhost:8080/play", nil)
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
		fmt.Printf("%#v\n", state)

		// PROCESS
		// Sail in a circle
		action := directions[i % 4]

		// SEND ACTION
		err = wsjson.Write(context.Background(), conn, action)
		if err != nil {
			panic(err)
		}

		i++
	}
}
