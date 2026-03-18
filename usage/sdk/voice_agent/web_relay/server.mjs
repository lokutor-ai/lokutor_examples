import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { VoiceAgentClient } from '@lokutor/sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001; 
const API_KEY = process.env.LOKUTOR_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: LOKUTOR_API_KEY not set.');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', async (browserWs) => {
    console.log('🔗 Browser Client connected (SDK Relay)');

    // 1. Initialize the official Lokutor SDK client (Managed setup)
    const lokutorClient = new VoiceAgentClient({ apiKey: API_KEY });

    // Using the new Event Emitter API for all SDK events
    lokutorClient.on('transcription', (text) => {
        browserWs.send(JSON.stringify({ type: 'transcript', role: 'user', data: text }));
    });

    lokutorClient.on('response', (text) => {
        browserWs.send(JSON.stringify({ type: 'transcript', role: 'agent', data: text }));
    });

    lokutorClient.on('audio', (data) => {
        if (browserWs.readyState === WebSocket.OPEN) {
            browserWs.send(data); // Send as binary chunk directly to browser
        }
    });

    lokutorClient.on('status', (status) => {
        browserWs.send(JSON.stringify({ type: 'status', data: status }));
        console.log(`📡 Status: ${status}`);
    });

    lokutorClient.on('ttfb', (ms) => {
        console.log(`⏱️ TTFB: ${ms}ms`);
    });

    const connected = await lokutorClient.connect();
    if (!connected) {
        console.error('❌ SDK failed to connect to Lokutor Cloud.');
        browserWs.close();
        return;
    }

    // 3. Handle messages coming from Browser -> Backend
    browserWs.on('message', (data, isBinary) => {
        if (isBinary) {
            // Forward raw PCM audio from browser directly to the SDK
            lokutorClient.sendAudio(Buffer.from(data));
        } else {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'prompt') {
                    // Update session prompt if supported
                    // lokutorClient.setPrompt(msg.data); 
                }
            } catch(e) {}
        }
    });

    browserWs.on('close', () => {
        console.log('👋 Browser disconnected');
        lokutorClient.disconnect();
    });
});

server.listen(PORT, () => {
    console.log(`\n✨ SDK-BASED WEB RELAY RUNNING (v2.0)`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`📦 Using official @lokutor/sdk`);
});
