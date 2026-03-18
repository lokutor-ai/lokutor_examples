import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const LOKUTOR_WS_URL = 'wss://api.lokutor.com/ws/agent';
const API_KEY = process.env.LOKUTOR_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: LOKUTOR_API_KEY is not set in YOUR .env file. The relay will not work.');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (clientWs) => {
    console.log('🔗 Client connected to Relay');

    const lokutorWs = new WebSocket(`${LOKUTOR_WS_URL}?api_key=${API_KEY}`);
    let binaryCount = 0;

    // Bridge [Lokutor -> Client]
    lokutorWs.on('message', (data, isBinary) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data, { binary: isBinary });
            
            if (!isBinary) {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.type === 'transcript' && msg.role === 'agent') {
                        console.log(`🤖 Agent: ${msg.data}`);
                    }
                } catch(e) {}
            }
        }
    });

    lokutorWs.on('open', () => {
        console.log('🚀 Established connection to Lokutor Cloud');
    });

    lokutorWs.on('error', (err) => {
        console.error('❌ Lokutor WebSocket Error:', err);
    });

    // Bridge [Client -> Lokutor]
    clientWs.on('message', (data, isBinary) => {
        if (lokutorWs.readyState === WebSocket.OPEN) {
            lokutorWs.send(data, { binary: isBinary });
            
            if (isBinary) {
                binaryCount++;
                // Log every 50 packets (~1 second of audio)
                if (binaryCount % 50 === 0) {
                    process.stdout.write('🎤'); 
                }
            }
        }
    });

    clientWs.on('close', () => {
        console.log('\n👋 Client disconnected');
        lokutorWs.close();
    });

    lokutorWs.on('close', () => {
        console.log('\n🛑 Lokutor closed the connection');
        clientWs.close();
    });
});

server.listen(PORT, () => {
    console.log(`\n✨ WEB RELAY INITIALIZED`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`🔒 API Keys are HIDDEN on the server`);
});
