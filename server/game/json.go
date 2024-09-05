package game

import (
	"encoding/json"
	"maps"
	"slices"
)

type GameStateResponse struct {
	Players []*Player `json:"players"`
	Settings Settings `json:"settings"`
}

func (g *State) JSON() []byte {
	g.Lock()
	players := slices.Collect(maps.Values(g.players))
	g.Unlock()

	response := GameStateResponse{
		Players: players,
		Settings: g.Settings,
	}

	b, err := json.Marshal(response)
	if err != nil {
		panic(err) // TODO: Should not happen
	}

	return b
}
