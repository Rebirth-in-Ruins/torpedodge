package game

type Explosion struct {
	ID int `json:"id"`
	X int `json:"x"`
	Y int `json:"y"`

	// explosions coming from a player's bomb have this set
	PlayerID int `json:"playerId"`
}
