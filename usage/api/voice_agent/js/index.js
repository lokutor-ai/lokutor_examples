import WebSocket from 'ws';
import recorder from 'node-record-lpcm16';
import Speaker from 'speaker';
import * as dotenv from 'dotenv';
import os from 'os';

dotenv.config();
const IS_MAC = os.platform() === 'darwin';

const apiKey = process.env.LOKUTOR_API_KEY;
const MIC_SAMPLE_RATE = 16000;
const SPEAKER_SAMPLE_RATE = 44100;

if (!apiKey) {
    console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
    process.exit(1);
}

// Connect to the raw Lokutor Voice Chat endpoint
const wsUrl = `wss://api.lokutor.com/ws/agent?api_key=${apiKey}`;
const ws = new WebSocket(wsUrl);

// 🔊 Setup Speaker Playback (Output)
// Mac hardware typically requires Stereo (2 channels) at 44.1kHz.
const speakerConfig = {
    channels: IS_MAC ? 2 : 1, 
    bitDepth: 16,
    sampleRate: SPEAKER_SAMPLE_RATE,
};
let speaker = new Speaker(speakerConfig);

ws.on('open', () => {
    console.log('🚀 Connected to Lokutor Voice Chat API');
    
    // 1. Send initialization configuration
    ws.send(JSON.stringify({ type: 'prompt', data: 'You are a helpful and natural conversational AI assistant.' }));
    ws.send(JSON.stringify({ type: 'voice', data: 'F1' }));
    ws.send(JSON.stringify({ type: 'language', data: 'en' }));

    // 2. Start microphone recording (Source)
    console.log('🎙 Microphone Active. Start speaking...');
    const mic = recorder.record({
        sampleRate: MIC_SAMPLE_RATE,
        channels: 1,
        threshold: 0,
    });

    mic.stream().on('data', (chunk) => {
        // Send raw PCM audio chunks from microphone to Lokutor over WebSocket
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
    });

    process.on('SIGINT', () => {
        console.log('\n👋 Goodbye!');
        mic.stop();
        ws.close();
        process.exit(0);
    });
});

ws.on('message', (data, isBinary) => {
    let audioChunk = null;
    
    if (isBinary) {
        // Audio is sent as raw binary frame
        audioChunk = Buffer.from(data);
    } else {
        // Handle JSON events
        try {
            const event = JSON.parse(data.toString());
            
            if (event.type === 'audio') {
                audioChunk = Buffer.from(event.data, 'base64');
            } else if (event.type === 'status') {
                process.stdout.write(` [${event.data.toUpperCase()}] `);
                
                // ⚡ INTELLIGENT BARGE-IN: If interrupted, we could flush but Speaker is hard to clear.
                // At minimum, we stop sending previous stream chunks to prevent ghost voices.
                if (event.data === 'interrupted') {
                    // console.log(' (Interrupted)');
                }
            } else if (event.type === 'transcript') {
                console.log(`\n${event.role?.toUpperCase() || 'AGENT'}: ${event.data}`);
            } else if (event.type === 'error') {
                console.error('\n❌ Error:', event.data);
            }
        } catch (e) {
            // Not JSON - ignore
        }
    }

    // --- Speaker Output Logic ---
    if (audioChunk && speaker) {
        if (IS_MAC) {
            // Up-mix Mono to Stereo for Mac hardware compatibility
            // The server already sends 44.1kHz, so we duplicate each sample across L/R channels.
            const outputBuffer = Buffer.alloc(audioChunk.length * 2);

            for (let i = 0; i < audioChunk.length; i += 2) {
                if (i + 1 >= audioChunk.length) break;
                const sample = audioChunk.readInt16LE(i);

                outputBuffer.writeInt16LE(sample, i * 2);     // Left Channel
                outputBuffer.writeInt16LE(sample, i * 2 + 2); // Right Channel
            }
            speaker.write(outputBuffer);
        } else {
            // Play raw Mono on Windows/Linux
            speaker.write(audioChunk);
        }
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
});

ws.on('close', () => {
    console.log('\n### Connection Closed ###');
});
