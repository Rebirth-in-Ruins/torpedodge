package protocol

import (
	"fmt"
	"strings"
)

type Message any

type (
	Join struct{
		Name string
	}

	Unknown struct{
		Raw string
	}

	Move struct{
		Direction Direction
	}
)

type Direction string

const (
	Left Direction = "LEFT"
	Right Direction = "RIGHT"
	Down Direction = "DOWN"
	Up Direction = "UP"
)

func (j Join) String() string {
	return fmt.Sprintf("JOIN(%v)", j.Name)
}

func (u Unknown) String() string {
	return fmt.Sprintf("UNKNOWN(%v)", u.Raw)
}

func Parse(str string) Message {
	switch {
	case strings.HasPrefix(str, "JOIN "):
		return Join{Name: str[5:]}
	case strings.HasPrefix(str, "LEFT"):
		return Move{Direction: Left}
	case strings.HasPrefix(str, "RIGHT"):
		return Move{Direction: Right}
	case strings.HasPrefix(str, "UP"):
		return Move{Direction: Up}
	case strings.HasPrefix(str, "DOWN"):
		return Move{Direction: Down}
	default:
		return Unknown{Raw: str}
	}
}
