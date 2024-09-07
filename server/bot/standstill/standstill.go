// Package main implements a bot that just stands still and does nothing.
package main

import (
	"context"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

const (
	urlStr = "ws://localhost:8080/play"
)

func main() {
	conn, _, err := websocket.Dial(context.Background(), urlStr, nil)
	if err != nil {
		panic(err)
	}
	defer conn.CloseNow()

	// Join as player
	err = wsjson.Write(context.Background(), conn, "JOIN SleepBot")
	if err != nil {
		panic(err)
	}

	select {}
}
