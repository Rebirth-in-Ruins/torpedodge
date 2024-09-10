package game


type Loot struct {
	ID int `json:"id"`

	// decides what texture is used
	Type string `json:"type"`

	// how much score it grants when picked up
	Value int `json:"value"`

	X int `json:"x"`
	Y int `json:"y"`
}
