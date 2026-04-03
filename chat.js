const tmi = require('tmi.js');
const WebSocket = require('ws');

// 1. Connect to your existing WebSocket bridge
const ws = new WebSocket('ws://localhost:8080');

// 2. Configure the Twitch connection
const client = new tmi.Client({
    channels: [ 'mooshdad' ] // Replace with your Twitch name
});

client.connect();

// 3. When a message arrives in Twitch chat...
client.on('message', (channel, tags, message, self) => {
    if (self) return;

    // ADD THIS LINE: It will print every chat message to your terminal
    console.log(`New message from ${tags['display-name']}: ${message}`);

    const chatData = {
        type: 'CHAT_MSG',
        user: tags['display-name'],
        color: tags['color'] || '#ffffff',
        text: message
    };

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(chatData));
        // ADD THIS LINE: Confirms the message was sent to the bridge
        console.log("Sent to bridge!");
    }
});

console.log("Chat Listener is active and bridged!");