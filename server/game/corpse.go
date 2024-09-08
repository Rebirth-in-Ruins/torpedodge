package game


type Corpse struct {
	ID int `json:"id"`

	// name tag
	Name string `json:"name"`

	// coordinates
	X int `json:"x"`
	Y int `json:"y"`
	Rotation Direction `json:"rotation"`

	// remaining turns until the corpse sinks and disappears
	DeathTimer int `json:"deathTimer`
}


func (c *Corpse) IsDead() bool {
	return c.DeathTimer <= 0
}
