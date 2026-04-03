const WebSocket = require('ws');

// Create a local server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // When Chrome sends the volume, instantly broadcast it to OBS
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

console.log("Invisible bridge running on ws://localhost:8080");