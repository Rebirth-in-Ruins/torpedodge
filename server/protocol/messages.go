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
	default:
		return Unknown{Raw: str}
	}
}
