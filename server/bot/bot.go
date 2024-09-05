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

	for {
		// Receive next state
		var state game.GameStateResponse
		err = wsjson.Read(context.Background(), conn, &state)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%#v\n", state)

		// Process

		// Send action
		err = wsjson.Write(context.Background(), conn, "LEFT")
		if err != nil {
			panic(err)
		}
	}
}
