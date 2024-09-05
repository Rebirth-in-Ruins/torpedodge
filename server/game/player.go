package game


type Player struct {
	ID int `json:"id"`

	// name tag
	Name string `json:"name"`

	// coordinates
	X int `json:"x"`
	Y int `json:"y"`

	// amount of lives
	Health int `json:"health"`

	// allowed  
	BombCount int `json:"bombCount"`

	// amount of turns until bomb is available
	BombRespawn int `json:"bombRespawn"`
}
