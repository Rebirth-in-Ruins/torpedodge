package game

import "time"

type Settings struct {
	// time until inputs are evaluated and game state is updated
	TurnDuration time.Duration `json:"turnDuration"`

	// size of the map
	GridSize int `json:"gridSize"`

	// how many bombs can be stored at once
	InventorySize int `json:"inventorySize"`

	// how many turns it takes before a player can get another bomb
	BombRespawnTime int `json:"bombRespawnTime"`

	// how many lives the player has 
	StartHealth int `json:"startHealth"`
}

