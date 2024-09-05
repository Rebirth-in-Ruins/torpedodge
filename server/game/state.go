package game

import (
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/rebirth-in-ruins/torpedodge/server/datastr"
	"github.com/rebirth-in-ruins/torpedodge/server/protocol"
	"math/rand/v2"
)

type State struct {
	players sync.Map
	inputs sync.Map

	playerPositions [][]*Player
	Settings Settings
}

func New(settings Settings) *State {
	// TODO: We might not need sync.Maps at all...
	return &State{
		players: sync.Map{},
		inputs: sync.Map{},

		playerPositions: datastr.NewGrid[Player](settings.GridSize),
		Settings: settings,
	}
}


func (g *State) RunSimulation() {
	slog.Info("-- Simulation Start --")
	defer slog.Info("-- Simulation End --")

	// Sort inputs by time we received them
	inputs := datastr.ToSlice[Input](&g.inputs)
	slog.Info("current inputs", slog.String("inputs", fmt.Sprintf("%v", inputs)))

	// Apply inputs and check for collision

	// Let new players join after everything is safe
	for _, input := range inputs {
		if payload, ok := input.message.(protocol.Join); ok {
			g.playerJoins(input.id, payload.Name)
		}
	}

	// Prepare next round
	g.inputs.Clear()
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
	g.players.Store(id, player)

	slog.Info("player joined", slog.String("name", player.Name))
}

// A websocket client will report that a player has left because their connection is gone.
func (g *State) PlayerLeaves(id int) {
	value, ok := g.players.Load(id)
	if !ok {
		panic("could not get player") // TODO:
	}
	g.players.Delete(id)

	player := value.(*Player)
	g.playerPositions[player.X][player.Y] = nil
}

type Input struct {
	id int
	message protocol.Message
	time time.Time
}

// TODO: Some messages should be evaluated immediately and the state should be sent to spectators (like join, direction known)
// Needs to be thread-safe.
func (g *State) StoreInput(id int, message protocol.Message) {
	// TODO: Use slice and mutexes to simplify?
	g.inputs.Store(id, Input{id: id, message: message, time: time.Now()})
}

