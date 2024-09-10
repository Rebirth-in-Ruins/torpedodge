import websocket

gameserver_url = "ws://localhost:8080/play"
player_name = "PythonBot"

actions = ["LEFT", "BOMB", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP"]
i = 0

def on_message(ws, message):
    global i

    # Print Game State
    # print(message)

    # Decide on action
    action = actions[i % len(actions)]
    i+=1
    print(action)

    # Send to server
    ws.send(action)

def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print(close_msg)

def on_open(ws):
    ws.send("JOIN "+player_name+".py")

ws = websocket.WebSocketApp("ws://localhost:8080/play", on_open=on_open,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.run_forever()
