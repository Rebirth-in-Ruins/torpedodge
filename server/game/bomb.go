package game

type Bomb struct {
	ID int `json:"id"`
	PlayerID int `json:"playerId"`
	X int `json:"x"`
	Y int `json:"y"`
	FuseCount int `json:"fuseCount"`
}

func (b Bomb) Detonated() bool {
	return b.FuseCount <= 0
}
