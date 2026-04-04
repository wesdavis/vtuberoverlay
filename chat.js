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

    // --- The Auto-Responder for Voice Instructions ---
    // We use .toLowerCase() so it works if they type !VOICES or !Voices
    if (message.toLowerCase() === '!voices') {
        
        // This makes your bot type a message directly into your Twitch chat
        const helpText = "Change your TTS voice by typing '!voice name' before your message! Available voices: Brian (UK Male), Justin (US Male), Salli (US Female), Amy (UK Female).";
        
        client.say(channel, helpText).catch(err => {
            console.error("Failed to send help message:", err);
        });
        
        console.log("Sent voice instructions to chat.");
    }

    // Check if the message starts with !title
    if (message.startsWith('!title ')) {
        
        // Fail-safe check: Is the person typing the Broadcaster OR your exact username?
        // NOTE: Change 'your_twitch_username' to your actual Twitch name in all lowercase!
        const isBroadcaster = (tags.badges && tags.badges.broadcaster === '1') || (tags.username === 'your_twitch_username');

        if (isBroadcaster) {
            const newGoal = message.replace('!title ', '');
            
            const goalData = {
                type: 'UPDATE_GOAL',
                text: newGoal
            };

            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(goalData));
                console.log(`Goal updated to: ${newGoal}`);
            }
        }
    }

});

console.log("Chat Listener is active and bridged!");