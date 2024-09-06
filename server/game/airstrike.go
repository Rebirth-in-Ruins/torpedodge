package game

type Airstrike struct {
	ID int `json:"id"`
	X int `json:"x"`
	Y int `json:"y"`
	FuseCount int `json:"fuseCount"`
}

func (a Airstrike) Detonated() bool {
	return a.FuseCount <= 0
}
