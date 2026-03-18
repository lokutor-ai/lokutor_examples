import Speaker from 'speaker';
import os from 'os';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();
const IS_MAC = os.platform() === 'darwin';

const apiKey = process.env.LOKUTOR_API_KEY;
if (!apiKey) {
    console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
    process.exit(1);
}

// 🔊 Setup Speaker Playback (Output)
// NOTE: Mac hardware requires Stereo (2 channels) even for Mono streams.
const speaker = new Speaker({
    channels: IS_MAC ? 2 : 1, 
    bitDepth: 16,
    sampleRate: 44100,
});

// Connect to the raw Lokutor WebSocket endpoint
const wsUrl = `wss://api.lokutor.com/ws?api_key=${apiKey}`;
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('🚀 Connected to Lokutor API');
    
    // Send synthesis request
    const request = {
        text: "Hello, this is a test of the raw Lokutor WebSocket API using Node.js.",
        voice: "M1",
        lang: "en",
        speed: 1.0,
        version: "versa-1.0"
    };
    
    ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
    let inputBuffer = null;
    
    // Determine if input is raw binary or a string/JSON
    if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
        inputBuffer = Buffer.from(data);
    } else {
        const message = data.toString();
        
        // Handle metadata/control messages first
        if (message === 'EOS') {
            console.log('\n✅ Synthesis complete');
            speaker?.end();
            ws.close();
            return;
        } else if (message.startsWith('ERR:')) {
            console.error('\n❌ Error:', message);
            ws.close();
            return;
        }

        // Try parsing JSON for {type: 'audio', data: 'base64'}
        try {
            const event = JSON.parse(message);
            if (event.type === 'audio') {
                inputBuffer = Buffer.from(event.data, 'base64');
            }
        } catch (e) {
            // Not JSON or unhandled text, ignore
            return;
        }
    }

    // --- Speaker Output Logic ---
    if (inputBuffer && speaker) {
        if (IS_MAC) {
            // Binary audio data received - up-mix to Stereo ONLY for Mac
            const outputBuffer = Buffer.alloc(inputBuffer.length * 2);
            const GAIN_BOOST = 1.5; // Prevent distortion

            for (let i = 0; i < inputBuffer.length; i += 2) {
                if (i + 1 >= inputBuffer.length) break;
                let sample = inputBuffer.readInt16LE(i);
                sample = Math.max(-32768, Math.min(32767, Math.floor(sample * GAIN_BOOST)));

                outputBuffer.writeInt16LE(sample, i * 2);     // Left
                outputBuffer.writeInt16LE(sample, i * 2 + 2); // Right
            }
            speaker.write(outputBuffer);
        } else {
            // Play raw Mono on Windows/Linux
            speaker.write(inputBuffer);
        }
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
});

ws.on('close', () => {
    console.log('### Connection Closed ###');
});
