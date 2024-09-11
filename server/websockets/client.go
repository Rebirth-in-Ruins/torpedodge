package websockets

import (
	"context"
	"log/slog"
	"strings"

	"github.com/coder/websocket"
	"github.com/rebirth-in-ruins/torpedodge/server/protocol"
)

// Client is created for each websocket connection.
// Is a middleman between the websocket connection and the hub.
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

// Reads incoming messages sent from client's websocket connection
func (c *Client) readMessages() {
	defer func() {
		c.conn.Close(websocket.StatusAbnormalClosure, "not responsive")
		slog.Debug("disconnecting read pipe of client", slog.String("name", c.name))
	}()

	for {
		_, buf, err := c.conn.Read(context.Background())
		if err != nil {
			return // Occurs when websocket connection closed
		}

		message := sanitize(buf)
		event := protocol.Parse(message)

		// Associate the client with the player's name as well (helps for logging purposes)
		if payload, ok := event.(protocol.Join); ok {
			c.name = payload.Name
		}

		c.server.state.StoreInput(c.id, event)
	}
}

func sanitize(msg []byte) string {
	str := string(msg)

	str = strings.ReplaceAll(str, `"`, ``) // remove quotes, if someone sends json string
	str = strings.TrimSpace(str) // no newlines
	str = str[:min(len(str),25)] // Max message length is 25 (a name can only be 20 chars long because of 'JOIN '-prefix)

	return str
}


// server -> client.writeMessages -> player's websocket connection
func (c *Client) writeMessages() {
	defer func() {
		c.conn.Close(websocket.StatusNormalClosure, "not responsive")
		slog.Info("disonnecting write pipe of client", slog.String("name", c.name))

		if !c.spectator {
			c.server.state.RemovePlayer(c.id)
		}
	}()

	// Send spectators the game state instantly so they can render it
	if c.spectator {
		c.send <- c.server.state.JSON(true)
	}

	for {
		select {
		case message := <-c.send:
			err := c.conn.Write(context.Background(), websocket.MessageText, message)
			if err != nil {
				return // Occurs when websocket connection closed
			}
		}
	}
}

func (c *Client) disconnect() {
	c.conn.Close(websocket.StatusNormalClosure, "You died!")
	slog.Info("disonnecting client due to game", slog.String("name", c.name))
}
