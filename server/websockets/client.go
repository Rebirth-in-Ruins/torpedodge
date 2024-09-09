package websockets

import (
	"context"
	"log/slog"
	"strings"
	"time"

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

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

// Reads incoming messages sent from client's websocket connection
func (c *Client) readMessages() {
	// TODO: Ping/Pongs for heartbeats to check if still connected
	for {
		_, buf, err := c.conn.Read(context.Background())
		if err != nil {
			slog.Error("disconnecting client", slog.String("name", c.name), slog.String("error", err.Error()))
			c.conn.Close(websocket.StatusAbnormalClosure, err.Error())
			return
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
	// Regularly do ping/pongs as heartbeat
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.conn.Close(websocket.StatusNormalClosure, "")
		slog.Info("disonnecting write pipe of client", slog.String("name", c.name))

		// TODO: Delete on Read or write pipeline?
		if !c.spectator {
			c.server.state.RemovePlayer(c.id)
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
				panic(err) // TODO:
			}
		case <-ticker.C:
			// TODO: Do ping pongs
		}
	}
}

func (c *Client) disconnect() {
	c.conn.Close(websocket.StatusNormalClosure, "You died!")
	slog.Info("disonnecting client due to game", slog.String("name", c.name))
}
