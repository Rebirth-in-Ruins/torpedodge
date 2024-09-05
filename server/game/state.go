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

	players map[int]*Player
	inputs map[int]Input

	playerPositions [][]*Player
	Settings Settings
}

func New(settings Settings) *State {
	// TODO: We might not need sync.Maps at all...
	return &State{
		players: make(map[int]*Player),
		inputs: make(map[int]Input, 0),

		playerPositions: datastr.NewGrid[Player](settings.GridSize),
		Settings: settings,
	}
}


func (g *State) RunSimulation() {
	g.Lock()
	defer g.Unlock()

	slog.Info("-- Simulation Start --")
	defer slog.Info("-- Simulation End --")

	// Sort inputs by time we received them
	inputs := slices.Collect(maps.Values(g.inputs))
	slices.SortFunc(inputs, func(a Input, b Input) int {
		return a.time.Compare(b.time)
	})

	// Apply inputs and check for collision
	for _, input := range inputs {
		if payload, ok := input.message.(protocol.Move); ok {
			g.playerMoves(input.id, payload.Direction)
		}
	}

	// Let new players join after everything is safe
	for _, input := range inputs {
		if payload, ok := input.message.(protocol.Join); ok {
			g.playerJoins(input.id, payload.Name)
		}
	}
	slog.Info("current inputs", slog.String("inputs", fmt.Sprintf("%v", inputs)))

	// Prepare next round
	clear(g.inputs)
}

func (g *State) playerJoins(id int, name string) {
	// Find free space
	var x, y int
	for {
		x = rand.IntN(g.Settings.GridSize)
		y = rand.IntN(g.Settings.GridSize)

		// Retry TODO: Inefficient
		if g.playerPositions[x][y] != nil {
			continue
		}

		break
	}
	player := &Player{
		ID: id,
		Name:        name,
		X:           x,
		Y:           y,
		Health:      g.Settings.StartHealth,
		BombCount:   g.Settings.InventorySize,
		BombRespawn: 0,
	}

	g.playerPositions[x][y] = player
	g.players[id] = player

	slog.Info("player joined", slog.String("name", player.Name))
}

// A websocket client will report that a player has left because their connection is gone.
func (g *State) PlayerLeaves(id int) {
	g.Lock()
	defer g.Unlock()

	player, ok := g.players[id]
	if !ok {
		panic("could not get player") // TODO:
	}

	g.playerPositions[player.X][player.Y] = nil
}

func (g *State) playerMoves(id int, direction protocol.Direction) {
	player, ok := g.players[id]
	if !ok {
		panic("could not get player") // TODO:
	}

	newX := player.X
	newY := player.Y

	switch(direction) {
	case protocol.Left:
		newX -= 1
	case protocol.Right:
		newX += 1
	case protocol.Up:
		newY += 1
	case protocol.Down:
		newY -= 1
	}

	if g.isOutOfBounds(newX, newY) {
		return
	}

	g.playerPositions[player.X][player.Y] = nil
	g.playerPositions[newX][newY] = player
	player.X = newX
	player.Y = newY

	g.players[id] = player // TODO: Is this even necessary?
}

func (g *State) isOutOfBounds(x int, y int) bool {
	horizontal := x < 0 || g.Settings.GridSize <= x
	vertical := y < 0 || g.Settings.GridSize <= y

	return horizontal || vertical;
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

