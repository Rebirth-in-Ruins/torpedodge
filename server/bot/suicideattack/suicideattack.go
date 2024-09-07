// Package main implements a bot that tries to place bombs to hit players and
// doesn't care about taking damage.
package main

import (
	"context"
	"errors"
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
	conn, _, err := websocket.Dial(context.Background(), urlStr, nil)
	if err != nil {
		panic(err)
	}
	defer conn.CloseNow()

	// Join as player
	err = wsjson.Write(context.Background(), conn, "JOIN KillerBot")
	if err != nil {
		panic(err)
	}

    i := 0

    var targetID int

    for {
        // RECEIVE NEXT STATE
        var state game.GameStateResponse
        err = wsjson.Read(context.Background(), conn, &state)
        if err != nil {
            panic(err)
        }

        action := directions[i % len(directions)] // Default action: just circle around

        // Get target
        myTarget, err := getTarget(state, targetID)
        if err != nil {
            // Find new target
            if len(state.Players) == 0 {
                targetID = -1
            } else {
                targetID = state.Players[0].ID
            }
        }

        // Try to reach target
        myShip := getMyself(state)


        // Try to align with him horizontally/vertically
        xDiff := myShip.X - myTarget.X
        yDiff := myShip.Y - myTarget.Y

        if xDiff < yDiff {
            if xDiff < 0 {
                action = "RIGHT"
            } else {
                action = "LEFT"
            }
        } else {
            if yDiff < 0 {
                action = "DOWN"
            } else {
                action = "UP"
            }
        }

        // Drop bomb if bomb can reach him
        if myShip.X == myTarget.X || myShip.Y == myTarget.Y {
            action = "BOMB"
        } 

        fmt.Println(action)

        // SEND ACTION
        err = wsjson.Write(context.Background(), conn, action)
        if err != nil {
            panic(err)
        }

        i++
    }
}

func getMyself(state game.GameStateResponse) game.Player {
    for _, player := range state.Players {
        if player.Name == "KillerBot" {
            return player
        }
    }

    return game.Player{}
}

func getTarget(state game.GameStateResponse, id int) (game.Player, error) {
    for _, player := range state.Players {
        if player.ID == id {
            return player, nil
        }
    }

    return game.Player{}, errors.New("target not found")
}
