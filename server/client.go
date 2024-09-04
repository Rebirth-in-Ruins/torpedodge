package main

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/gorilla/websocket"
)

// Client is created for each websocket connection.
// Is a middleman between the websocket connection and the hub.
// TODO: Client to player?
type Client struct {
	server *Server

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// client that does not respond with inputs
	spectator bool
}


// player's websocket connection -> client.readPump -> hub
// TODO: rename read
func (c *Client) readPump() {
	defer func() {
		c.conn.Close()
	}()

	// Ping/Pongs for heartbeats to check if still connected
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				slog.Error("reading message failed", slog.String("error", err.Error()))
			}
			break
		}

		fmt.Println(string(message))

		// TODO: Sanitize?
		// message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		// TODO: Save for game server
		// c.server.broadcast <- message
	}
}


// hub -> client.writePump -> player's websocket connection
func (c *Client) writePump() {
	// Regularly do ping/pongs as heartbeat
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			// TODO: What if deadlines are exceeded?
			// c.conn.SetWriteDeadline(time.Now().Add(writeWait))

			if !ok {
				// The hub closed the channel because someone unregistered
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			// TODO: What if deadlines are reached
			// c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

