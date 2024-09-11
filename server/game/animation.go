package game

// the server can tell clients of any
// fancy events that occured in the game that could play an animation on a tile
// that are completely cosmetic (i.e. not like for example an explosion)
//
// (e.g. player joined, player died)
type Animation struct {
	// Name of the animation that should be played
	Name string `json:"name"`
	X int `json:"x"`
	Y int `json:"y"`
}
