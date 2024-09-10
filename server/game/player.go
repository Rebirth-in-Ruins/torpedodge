package game


type Player struct {
	ID int `json:"id"`

	// name tag
	Name string `json:"name"`

	// coordinates
	X int `json:"x"`
	Y int `json:"y"`
	Rotation Direction `json:"rotation"`

	// determines under which flag the player sails
	Team string `json:"team"`

	// points gained
	Score int `json:"score"`

	// amount of lives
	Health int `json:"health"`

	// bombs in inventory that can be dropped
	BombCount int `json:"bombCount"`

	// amount of turns until bomb is available
	BombRespawn int `json:"bombRespawn"`

	// remaining turns until the player gets disconnected
	deathTimer int
}

func (p *Player) LoseHealth() {
	if p.Health == 0 {
		return
	}

	p.Health--
}

func (p *Player) IsDead() bool {
	return p.Health <= 0
}

type Direction string

const (
	Left Direction = "LEFT"
	Right Direction = "RIGHT"
	Down Direction = "DOWN"
	Up Direction = "UP"
)
