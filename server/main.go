package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

func main() {
	hub := newHub()
	go hub.run()

	http.HandleFunc("/spectate", hub.spectate)

	slog.Info("Started server")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		slog.Error("ListenAndServe failed", slog.String("error", err.Error()))
	}
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// Client is created for each websocket connection.
// Is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

var upgrader = websocket.Upgrader{
	// ReadBufferSize:  1024,
	// WriteBufferSize: 1024,
}

// HTTP Endpoint to start watching the game.
func (h *Hub) spectate(w http.ResponseWriter, r *http.Request) {
	// Upgrade connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Info("failed to upgrade", slog.String("error", err.Error()))
		return
	}

	client := &Client{hub: h, conn: conn, send: make(chan []byte, 256)} // TODO: Maybe a channel of game states
	client.hub.register <- client

	// TODO: Specate doesn't need read pump

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

// player's websocket connection -> client.readPump -> hub
// TODO: rename read
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
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

		// TODO: Sanitize?
		// message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		c.hub.broadcast <- message
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
				// The hub closed the channel. TODO: Why?
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

func (h *Hub) run() {
	for {
		select {
		// User joined
		case client := <-h.register:
			h.clients[client] = true

		// User left
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}

		// Message to all
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
