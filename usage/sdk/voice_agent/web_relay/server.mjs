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

const PORT = 3001; // Using 3001 to avoid conflicts
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

    // 1. Initialize the official Lokutor SDK client
    const lokutorClient = new VoiceAgentClient({
        apiKey: API_KEY,
        prompt: 'You are a helpful and polite AI assistant.',
        
        onTranscription: (text) => {
            // Forward user's transcription to the browser
            browserWs.send(JSON.stringify({ type: 'transcript', role: 'user', data: text }));
        },
        onResponse: (text) => {
            // Forward AI's response to the browser
            browserWs.send(JSON.stringify({ type: 'transcript', role: 'agent', data: text }));
        },
        onStatus: (status) => {
            // Forward status (listening/speaking/interrupted)
            browserWs.send(JSON.stringify({ type: 'status', data: status }));
            console.log(`📡 Status: ${status}`);
        }
    });

    // 2. Handle audio coming from Lokutor -> Browser
    lokutorClient.onAudio((data) => {
        if (browserWs.readyState === WebSocket.OPEN) {
            browserWs.send(data); // Send as binary chunk
        }
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
            // Browser sent raw PCM audio (16kHz mono)
            lokutorClient.sendAudio(Buffer.from(data));
        } else {
            // Browser sent JSON (config updates, etc.)
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'prompt') {
                    // Update the prompt on-the-fly if supported by your version
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
    console.log(`\n✨ SDK-BASED WEB RELAY RUNNING`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`📦 Using official @lokutor/sdk`);
});
