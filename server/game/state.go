package game

import (
	"fmt"
	"log/slog"
	"maps"
	"slices"
	"sync"
	"time"

	"math/rand/v2"

	"github.com/rebirth-in-ruins/torpedodge/server/datastr"
	"github.com/rebirth-in-ruins/torpedodge/server/protocol"
)

// TODO: Maybe just "Game" might be the better name
type State struct {
	sync.Mutex

	// entities on the battlefield
	players map[int]*Player
	airstrikes map[int]*Airstrike
	explosions map[int]*Explosion
	bombs map[int]*Bomb

	// input of every player
	inputs map[int]Input

	// give IDs to airstrikes
	counter int

	// entities placed on a coordinate system
	playerPositions [][]*Player
	airstrikePositions [][]*Airstrike
	explosionPositions [][]*Explosion
	bombPositions [][]*Bomb

	// game settings
	Settings Settings
}

func (g *State) RunSimulation() {
	g.Lock()
	defer g.Unlock()

	slog.Info("-- Simulation Start --")

	// Sort inputs by time we received them
	inputs := slices.Collect(maps.Values(g.inputs))
	slices.SortFunc(inputs, func(a Input, b Input) int {
		return a.time.Compare(b.time)
	})

	// Apply inputs and check for collision
	for _, input := range inputs {
		switch payload := input.message.(type) {
		case protocol.Move:
			g.movePlayer(input.id, Direction(payload.Direction))
		case protocol.Bomb:
			g.spawnBomb(input.id)
		}

	}

	// Remove explosions from previous turn
	clear(g.explosions)
	g.explosionPositions = datastr.NewGrid[Explosion](g.Settings.GridSize)

	// Shorten the fuse / detonate airstrikes
	for _, airstrike := range g.airstrikes {
		airstrike.FuseCount -= 1
		if airstrike.Detonated() {
			g.removeAirstrike(airstrike)
		}
	}

	// Shorten the fuse / detonate bombs
	for _, bomb := range g.bombs {
		bomb.FuseCount -= 1
		if bomb.Detonated() {
			g.removeBomb(bomb)
		}
	}

	// Find players that were hit by explosion

	// Drop bombs the player placed


	// Drop more airstrikes
	g.spawnAirstrike()

	// Let new players join after everything is safe
	for _, input := range inputs {
		if payload, ok := input.message.(protocol.Join); ok {
			g.spawnPlayer(input.id, payload.Name)
		}
	}
	slog.Info("current inputs", slog.String("inputs", fmt.Sprintf("%v", inputs)))

	// Prepare next round
	clear(g.inputs)
}

// spawnPlayer places the player entity for a client at a random tile
func (g *State) spawnPlayer(id int, name string) {
	x, y := g.getFreeRandomTile()

	player := &Player{
		ID: id,
		Name:        name,
		X:           x,
		Y:           y,
		Rotation:    Left,
		Health:      g.Settings.StartHealth,
		BombCount:   g.Settings.InventorySize,
		BombRespawn: 0,
	}

	g.playerPositions[x][y] = player
	g.players[id] = player

	slog.Info("player joined", slog.String("name", player.Name))
}


// spawnBomb starts a new count down to explosion at a player's position
func (g *State) spawnBomb(id int) {
	player, ok := g.players[id]
	if !ok {
		panic("could not find player") // TODO:
	}

	bomb := &Bomb{
		ID:        g.newID(),
		PlayerID: id,
		X:         player.X,
		Y:         player.Y,
		FuseCount: g.Settings.BombFuseLength,
	}

	g.bombPositions[player.X][player.Y] = bomb
	g.bombs[bomb.ID] = bomb

	slog.Info("bomb dropped", slog.Int("id", bomb.ID), slog.String("player", player.Name))
}

// spawnAirstrike starts a new count down to explosion at a random tile
func (g *State) spawnAirstrike() {
	x, y := g.getFreeRandomTile()

	airstrike := &Airstrike{
		ID: g.newID(),
		X:         x,
		Y:         y,
		FuseCount: g.Settings.AirstrikeFuseLength,
	}

	g.airstrikePositions[x][y] = airstrike
	g.airstrikes[airstrike.ID] = airstrike

	slog.Debug("airstrike spawned", slog.Int("x", airstrike.X), slog.Int("y", airstrike.Y))
}

// spawnExplosion adds the entity at the location.
// Helps with detecting if players were hit
func (g *State) spawnExplosion(x int, y int) {
	explosion := &Explosion{
		ID: g.newID(),
		X:         x,
		Y:         y,
	}

	g.explosionPositions[x][y] = explosion
	g.explosions[explosion.ID] = explosion

	slog.Debug("explosion spawned", slog.Int("x", explosion.X), slog.Int("y", explosion.Y))
}

// A websocket client will report that a player has left because their connection is gone.
func (g *State) RemovePlayer(id int) {
	g.Lock()
	defer g.Unlock()

	player, ok := g.players[id]
	if !ok {
		panic("could not get player") // TODO:
	}
	delete(g.players, id)

	g.playerPositions[player.X][player.Y] = nil
}

// removeAirstrike removes the entity and replaces it 
// with explosions at the location
func (g *State) removeAirstrike(airstrike *Airstrike) {
	delete(g.airstrikes, airstrike.ID)
	g.airstrikePositions[airstrike.X][airstrike.Y] = nil

	// Spawn explosions at the place where the airstrike detonated
	for i := 0; i < g.Settings.GridSize; i++ {
		g.spawnExplosion(airstrike.X, i);
		g.spawnExplosion(i, airstrike.Y);
	}
}

// removeBomb removes the entity and replaces it 
// with explosions at the location
func (g *State) removeBomb(bomb *Bomb) {
	delete(g.bombs, bomb.ID)
	g.bombPositions[bomb.X][bomb.Y] = nil

	// Spawn explosions at the place where the bomb detonated
	for i := 0; i < g.Settings.GridSize; i++ {
		g.spawnExplosion(bomb.X, i);
		g.spawnExplosion(i, bomb.Y);
	}
}

// movePlayer changes the position
func (g *State) movePlayer(id int, direction Direction) {
	player, ok := g.players[id]
	if !ok {
		panic("could not get player") // TODO:
	}

	newX := player.X
	newY := player.Y

	switch(direction) {
	case Left:
		newX -= 1
	case Right:
		newX += 1
	case Up:
		newY -= 1
	case Down:
		newY += 1
	}


	// Don't leave map
	if g.isOutOfBounds(newX, newY) {
		return
	}

	// Don't collide with other players
	neighbour := g.playerPositions[newX][newY]
	if neighbour != nil {
		return
	}

	g.playerPositions[player.X][player.Y] = nil
	g.playerPositions[newX][newY] = player
	player.X = newX
	player.Y = newY
	player.Rotation = direction

	// g.players[id] = player // TODO: Is this even necessary?
}

// newID hands out a new unique ID for spawning new entities
func (g *State) newID() int {
	result := g.counter
	g.counter++
	return result
}

// isOutOfBounds keeps players from moving out of the map.
func (g *State) isOutOfBounds(x int, y int) bool {
	horizontal := x < 0 || g.Settings.GridSize <= x
	vertical := y < 0 || g.Settings.GridSize <= y

	return horizontal || vertical;
}

// getFreeRandomTile helps in finding a spawn location for entites.
func (g *State) getFreeRandomTile() (int, int) {
	var x, y int
	for {
		x = rand.IntN(g.Settings.GridSize)
		y = rand.IntN(g.Settings.GridSize)

		// Retry TODO: Inefficient
		if g.playerPositions[x][y] != nil || g.airstrikePositions[x][y] != nil {
			continue
		}

		return x, y
	}
}

type Input struct {
	id int
	message protocol.Message
	time time.Time
}

// TODO: Some messages should be evaluated immediately and the state should be sent to spectators (like join, direction known)
// Needs to be thread-safe.
func (g *State) StoreInput(id int, message protocol.Message) {
	g.Lock()
	defer g.Unlock()

	g.inputs[id] = Input{id: id, message: message, time: time.Now()}
}

// New starts a fresh game state.
func New(settings Settings) *State {
	return &State{
		Mutex:              sync.Mutex{},
		players:            make(map[int]*Player),
		airstrikes:         make(map[int]*Airstrike),
		explosions:         make(map[int]*Explosion),
		bombs:              make(map[int]*Bomb),
		inputs:             make(map[int]Input),

		counter:            0,
		playerPositions:    datastr.NewGrid[Player](settings.GridSize),
		airstrikePositions: datastr.NewGrid[Airstrike](settings.GridSize),
		explosionPositions: datastr.NewGrid[Explosion](settings.GridSize),
		bombPositions: datastr.NewGrid[Bomb](settings.GridSize),

		Settings:           settings,
	}
}

