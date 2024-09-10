import WebSocket from 'ws';

const gameserverUrl = 'ws://localhost:8080/play'
const playerName = 'JavaScriptBot'

const ws = new WebSocket(gameserverUrl);

ws.on('error', console.error);

// Send initial JOIN message with your name
ws.on('open', function open() {
  ws.send('JOIN ' + playerName + '.js');
});

ws.on('close', function close(_, reason) {
    console.log(reason.toString());
    process.exit(1);
})

let i = 0;
let directions = ["LEFT", "BOMB", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP"];

ws.on('message', function message(data) {
    // RECEIVE NEXT STATE
    const obj = JSON.parse(data.toString());

    // Sail in a circle
    let action = directions[i % directions.length];
    console.log(action)
    i++

    ws.send(action);
});
