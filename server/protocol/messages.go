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
		Direction string
	}
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
		return Move{Direction: "LEFT"}
	case strings.HasPrefix(str, "RIGHT"):
		return Move{Direction: "RIGHT"}
	case strings.HasPrefix(str, "UP"):
		return Move{Direction: "UP"}
	case strings.HasPrefix(str, "DOWN"):
		return Move{Direction: "DOWN"}
	default:
		return Unknown{Raw: str}
	}
}
