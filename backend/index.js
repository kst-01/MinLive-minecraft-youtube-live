const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
// const mongoose = require('mongoose'); // Uncomment if you want MongoDB

const itemMap = require('./minecraft-items.json');
const mobMap  = require('./minecraft-mobs.json');
const processedMessages = new Set();
const mobVotes        = {};
const chatLog         = [];    // ← store recent chat messages
const itemLog         = [];    // ← store recent item gives

const USE_YOUTUBE = false; // Set to true to enable YouTube integration

// ─── MONGODB SETUP (future option) ────────────────────────────────────
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/minlive', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// ─── EXPRESS SETUP ───────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// 1. Channel Stats (stub or fetch from YouTube API)
app.get('/api/channel', (_req, res) => {
  res.json({
    name:        'RDSRandomizedStreams',
    subscribers: 11,
    views:       837
  });
});

// 2. Live Chat Log
app.get('/api/chat-log', (_req, res) => {
  res.json(chatLog.slice(-50)); // last 50 messages
});

// 3. Items Given
app.get('/api/item-log', (_req, res) => {
  res.json(itemLog.slice(-20));
});

// 4. Mob Votes
app.get('/api/mob-votes', (_req, res) => {
  res.json(mobVotes);
});

// 5. Gamemode Toggle
app.post('/api/gamemode', (req, res) => {
  const { mode } = req.body;              // e.g. 'creative'
  sendCommand(`/gamemode ${mode} @s`);
  return res.json({ success: true, mode });
});

// Create HTTP server and Socket.IO instance
const API_PORT = 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected to Socket.IO');
  
  // Send initial data
  //socket.emit('chatUpdate', chatLog.slice(-50));
  socket.emit('itemUpdate', itemLog.slice(-20));
  socket.emit('mobVotesUpdate', mobVotes);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected from Socket.IO');
  });
});

// Start HTTP server on port 5000
httpServer.listen(API_PORT, () =>
  console.log(`🚀 Express API running on http://localhost:${API_PORT}`)
);

// ─── WEBSOCKET & YouTube LOGIC ─────────────────────────────────

const wss = new WebSocket.Server({ port: 3001 });
let minecraftClient = null;

wss.on('connection', ws => {
  minecraftClient = ws;
  console.log('🟢 Minecraft connected');

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      if (msg.header?.eventName === 'PlayerMessage') {
        console.log(`💬 Minecraft Chat: ${msg.body.message}`);
      }
    } catch (err) {
      console.error('❌ Error parsing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Minecraft disconnected');
    minecraftClient = null;
  });
});

// ─── YOUTUBE OAUTH & CHAT LISTENING ─────────────────────────────

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('🔗 Authorize this app by visiting this URL:\n', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('🔑 Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      callback(oAuth2Client);
    });
  });
}

function getLiveChatId(auth) {
  const youtube = google.youtube('v3');
  youtube.liveBroadcasts.list({
    auth,
    part: 'snippet',
    mine: true
  }, (err, res) => {
    if (err) return console.error('❌ API error:', err);
    const liveChatId = res.data.items[0]?.snippet?.liveChatId;
    if (!liveChatId) return console.log('⚠️ No live broadcast found.');
    listenToChat(auth, liveChatId);
  });
}

function listenToChat(auth, liveChatId) {
  const youtube = google.youtube('v3');
  setInterval(() => {
    youtube.liveChatMessages.list({
      auth,
      liveChatId,
      part: 'snippet,authorDetails'
    }, (err, res) => {
      if (err) return console.error('❌ Chat error:', err);
      res.data.items.forEach(msg => {
        if (processedMessages.has(msg.id)) return;
        processedMessages.add(msg.id);

        const text = msg.snippet.textMessageDetails.messageText;
        const user = msg.authorDetails.displayName;
        const time = new Date().toLocaleTimeString();

        // ───> Push into chat log and emit update
        chatLog.push({ user, text, time });
        //io.emit('chatUpdate', chatLog.slice(-50));
        io.emit('chatMessage', { user, text, time }); // ✅ Real-time push for frontend

        handleChatMessage(text);
      });
    });
  }, 5000);
}

function sendCommand(command) {
  if (!minecraftClient || minecraftClient.readyState !== WebSocket.OPEN) {
    console.error('❌ Minecraft not connected');
    return;
  }
  const cmd = {
    body: { origin: { type: 'player' }, commandLine: command, version: 1 },
    header: { requestId: uuidv4(), messagePurpose: 'commandRequest',
              messageType: 'commandRequest', version: 1 }
  };
  minecraftClient.send(JSON.stringify(cmd));
  console.log(`✅ Sent to Minecraft: ${command}`);
}

function handleChatMessage(text) {
  const lowerText = text.toLowerCase();

  // ─── Item giving
  Object.keys(itemMap).forEach(key => {
    const rx = new RegExp(`\\b${key}\\b`);
    if (rx.test(lowerText)) {
      sendCommand(`/give @s ${itemMap[key]} 1`);
      itemLog.push({ item: itemMap[key], time: new Date().toLocaleTimeString() });
      //io.emit('itemUpdate', itemLog.slice(-20));
    }
  });

  // ─── Mob voting
  Object.keys(mobMap).forEach(mob => {
    const rx = new RegExp(`\\b${mob}\\b`);
    if (rx.test(lowerText)) {
      mobVotes[mob] = (mobVotes[mob] || 0) + 1;
      if (mobVotes[mob] >= 2) {
        sendCommand(`/summon ${mobMap[mob]}`);
        mobVotes[mob] = 0;
      }
      io.emit('mobVotesUpdate', mobVotes);
    }
  });
}

// ─── Start YouTube or Terminal Chat Mode ────────────────────────
if (USE_YOUTUBE) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.error('❌ Missing credentials.json');
    authorize(JSON.parse(content), getLiveChatId);
  });
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🧪 Terminal Chat Mode: Type a message below to simulate YouTube chat');

  rl.on('line', (input) => {
    const user = "TerminalUser";
    const text = input.trim();
    const time = new Date().toLocaleTimeString();

    if (!text) return;

    const message = { user, text, time };

    chatLog.push(message);
    io.emit('chatMessage', message); // ✅ Keep this

    handleChatMessage(text);         // ✅ Keep this
  });


}

console.log('📡 YouTube & WS listeners running (WS on 3000)');