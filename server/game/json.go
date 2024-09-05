package game

import "encoding/json"

type GameStateResponse struct {
	Players []Player `json:"players"`
}

func (g *State) JSON() []byte {
	players := make([]Player, 0)

	g.players.Range(func(key any, value any) bool {
		player, ok := value.(*Player)
		if !ok {
			panic("JSON: conversion failed") // TODO: don't panic
		}

		players = append(players, *player)
		return true
	})

	response := GameStateResponse{
		Players: players,
	}

	b, err := json.Marshal(response)
	if err != nil {
		panic(err) // TODO: Should not happen
	}

	return b
}
