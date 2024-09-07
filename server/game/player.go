package game


type Player struct {
	ID int `json:"id"`

	// name tag
	Name string `json:"name"`

	// coordinates
	X int `json:"x"`
	Y int `json:"y"`
	Rotation Direction `json:"rotation"`

	// amount of lives
	Health int `json:"health"`

	// allowed  
	BombCount int `json:"bombCount"`

	// amount of turns until bomb is available
	BombRespawn int `json:"bombRespawn"`
}

func (p *Player) LoseHealth() {
	if p.Health == 0 {
		return
	}

	p.Health--
}

type Direction string

const (
	Left Direction = "LEFT"
	Right Direction = "RIGHT"
	Down Direction = "DOWN"
	Up Direction = "UP"
)
