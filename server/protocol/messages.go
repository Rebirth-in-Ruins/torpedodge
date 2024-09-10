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
		Team string
	}

	// client wants to move in direction
	Move struct{
		Direction string
	}

	// client wants to drop a bomb
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

func (b Quit) String() string {
	return fmt.Sprintf("QUIT")
}

func (u Unknown) String() string {
	return fmt.Sprintf("UNKNOWN(%v)", u.Raw)
}

func Parse(str string) Message {
	if strings.HasPrefix(str, "JOIN ") {
		name, team := parseName(str)
		return Join{Name: name, Team: team}
	}

	switch str {
	case "QUIT":
		return Quit{}
	case "LEFT":
		return Move{Direction: "LEFT"}
	case "RIGHT":
		return Move{Direction: "RIGHT"}
	case "UP":
		return Move{Direction: "UP"}
	case "DOWN":
		return Move{Direction: "DOWN"}
	case "BOMB":
		return Bomb{}
	default:
		return Unknown{Raw: str}
	}
}

// The team is decided by their suffix
// like .py, .go, .js, .rs
func parseName(input string) (name string, team string) {

	noprefix := input[5:] // Remove "JOIN " prefix

	nosuffix := noprefix[:len(noprefix)-3] // remove ".xx" suffix

	switch {
	case strings.HasSuffix(noprefix, ".go"):
		return nosuffix, "golang"
	case strings.HasSuffix(noprefix, ".js"):
		return nosuffix, "javascript"
	case strings.HasSuffix(noprefix, ".rs"):
		return nosuffix, "rust"
	case strings.HasSuffix(noprefix, ".kt"):
		return nosuffix, "kotlin"
	case strings.HasSuffix(noprefix, ".py"):
		return nosuffix, "python"
	}

	return noprefix, "none"
}
