package game

import (
	"encoding/json"
)

type GameStateResponse struct {
	Players []Player `json:"players"`
	Airstrikes []Airstrike `json:"airstrikes"`
	Explosions []Explosion `json:"explosions"`
	Bombs []Bomb `json:"bombs"`
	Settings Settings `json:"settings"`
}

func (g *State) JSON() []byte {
	g.Lock()
	defer g.Unlock()

	// Players
	players := make([]Player, 0)
	for _, player := range g.players {
		players = append(players, *player)
	}

	// Airstrikes
	airstrikes := make([]Airstrike, 0)
	for _, airstrike := range g.airstrikes {
		airstrikes = append(airstrikes, *airstrike)
	}

	// Explosions
	explosions := make([]Explosion, 0)
	for _, explosion := range g.explosions {
		explosions = append(explosions, *explosion)
	}

	// Bombs
	bombs := make([]Bomb, 0)
	for _, bomb := range g.bombs {
		bombs = append(bombs, *bomb)
	}

	response := GameStateResponse{
		Players:    players,
		Airstrikes: airstrikes,
		Explosions: explosions,
		Bombs:      bombs,
		Settings:   g.Settings,
	}

	b, err := json.Marshal(response)
	if err != nil {
		panic(err) // TODO: Should not happen
	}

	return b
}
