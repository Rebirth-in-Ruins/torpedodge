package protocol

import (
	"fmt"
	"strings"
)

// strings sent over a websocket get parsed to one of these messages
type Message any

type (
	// client wants to join
	Join struct{
		Name string
	}

	// client wants to move in direction
	Move struct{
		Direction string
	}

	// client wants to move in direction
	// TODO: Maybe add field Direction as well
	// TODO: this should be immediate and not locked to the next turn :/
	Bomb struct{}

	// client wants to leave
	Quit struct{}

	// client's message was not understood
	Unknown struct{
		Raw string
	}
)


func (j Join) String() string {
	return fmt.Sprintf("JOIN(%v)", j.Name)
}

func (m Move) String() string {
	return fmt.Sprintf("MOVE(%v)", m.Direction)
}

func (b Bomb) String() string {
	return fmt.Sprintf("BOMB")
}

func (u Unknown) String() string {
	return fmt.Sprintf("UNKNOWN(%v)", u.Raw)
}

func Parse(str string) Message {
	// TODO: stop with the prefix
	switch {
	case strings.HasPrefix(str, "JOIN "):
		return Join{Name: str[5:]}
	case strings.HasPrefix(str, "QUIT"):
		return Quit{}
	case strings.HasPrefix(str, "LEFT"):
		return Move{Direction: "LEFT"}
	case strings.HasPrefix(str, "RIGHT"):
		return Move{Direction: "RIGHT"}
	case strings.HasPrefix(str, "UP"):
		return Move{Direction: "UP"}
	case strings.HasPrefix(str, "DOWN"):
		return Move{Direction: "DOWN"}
	case strings.HasPrefix(str, "BOMB"):
		return Bomb{}
	default:
		return Unknown{Raw: str}
	}
}
