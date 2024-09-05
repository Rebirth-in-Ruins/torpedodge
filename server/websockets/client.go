package websockets

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/rebirth-in-ruins/torpedodge/server/protocol"
)

// Client is created for each websocket connection.
// Is a middleman between the websocket connection and the hub.
// TODO: Client to player?
type Client struct {
	id int
	name string // for human-readable logging

	server *Server

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// client that does not respond with inputs
	spectator bool
}

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

// Reads incoming messages sent from client's websocket connection
func (c *Client) readMessages() {
	defer func() {
		slog.Info("disonnecting read pipe of client", slog.String("name", c.name))
		c.conn.Close(websocket.StatusNormalClosure, "")
	}()

	// TODO: Ping/Pongs for heartbeats to check if still connected

	for {
		var message string
		err := wsjson.Read(context.Background(), c.conn, &message)
		if err != nil && strings.Contains(err.Error(), "failed to get reader") {
			slog.Error("could not read message", slog.String("error", err.Error()))
			return
		} else if err != nil {
			panic(err)
		}

		event := protocol.Parse(message)

		// Give the client the sent name as well (name helps for logging purposes)
		if payload, ok := event.(protocol.Join); ok {
			c.name = payload.Name
		}

		c.server.state.StoreInput(c.id, event)
	}
}


// server -> client.writeMessages -> player's websocket connection
func (c *Client) writeMessages() {
	// Regularly do ping/pongs as heartbeat
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.conn.Close(websocket.StatusNormalClosure, "")
		slog.Info("disonnecting write pipe of client", slog.String("name", c.name))

		// TODO: Delete on Read or write pipeline?
		if !c.spectator {
			c.server.state.PlayerLeaves(c.id)
		}
	}()

	// Send spectators the game state instantly so they can render it
	if c.spectator {
		c.send <- c.server.state.JSON()
	}

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				// "The hub closed the channel because someone unregistered"
				panic("This happened")
			}
			
			err := c.conn.Write(context.Background(), websocket.MessageText, message)
			if err != nil && strings.Contains(err.Error(), "use of closed network connection"){
				slog.Error("could not write message", slog.String("error", err.Error()))
				return
			} else if err != nil && strings.Contains(err.Error(), "failed to flush") {
				slog.Error("could not write message", slog.String("error", err.Error()))
				return
			} else if err != nil {
				panic(err)
			}
		case <-ticker.C:
			// TODO: Do ping pongs
		}
	}
}

