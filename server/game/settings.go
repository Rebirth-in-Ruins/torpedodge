package game

import "time"

type Settings struct {
	// time until inputs are evaluated and game state is updated
	TurnDuration time.Duration

	// size of the map
	GridSize int

	// how many bombs can be stored at once
	InventorySize int

	// how many turns it takes before a player can get another bomb
	BombRespawnTime int

	// how many lives the player has 
	StartHealth int
}

