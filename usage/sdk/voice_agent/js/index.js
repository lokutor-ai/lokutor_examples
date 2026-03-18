import { VoiceAgentClient, AUDIO_CONFIG } from '@lokutor/sdk';
import recorder from 'node-record-lpcm16';
import Speaker from 'speaker';
import * as dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const IS_MAC = os.platform() === 'darwin';

/**
 * Lokutor Voice Agent Client (Node.js)
 * 
 * Demonstrates a high-performance conversational loop.
 */
async function main() {
    const apiKey = process.env.LOKUTOR_API_KEY;
    if (!apiKey) {
        console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
        process.exit(1);
    }

    console.log("🎙  Starting Lokutor Voice Agent...");
    console.log("💡 Speak naturally. The AI will listen and respond in real-time.");
    console.log("💡 Press Ctrl+C to end the session.");

    const client = new VoiceAgentClient({
        apiKey,
        prompt: 'You are a helpful and natural conversational AI assistant.',
        
        // 🛠️ Tools: Add custom capabilities here
        // tools: [{ name: 'get_weather', description: 'Get city weather', parameters: { ... } }],
        
        // 👄 Visemes: Set to true to receive lip-sync data for avatars
        visemes: false,

        onTranscription: (text) => console.log('👤 You:', text),
        onResponse: (text) => console.log('🤖 AI:', text),
        onStatus: (status) => {
            if (status === 'interrupted') console.log('⚡ [Barge-in detected]');
            // if (status === 'tool_call') console.log('🛠️ AI is using a tool...');
        },
        onVisemes: (data) => {
            // console.log('👄 Lip-Sync Data:', data);
        }
    });

    // client.on('tool_call', (tool) => { ... execute your logic ... });

    const connected = await client.connect();
    if (!connected) {
        console.error("❌ Connection failed.");
        return;
    }

    // 🎙  1. Microphone Setup (16kHz Mono)
    const mic = recorder.record({
        sampleRate: 16000,
        channels: 1,
        recorder: 'sox',
    });

    mic.stream().on('data', (chunk) => client.sendAudio(chunk));
    mic.stream().on('error', (err) => {
        console.error('❌ Mic Error:', err);
        process.exit(1);
    });

    // 🔊 Setup Speaker Playback (Output)
    // NOTE: Mac hardware requires Stereo (2 channels) even for Mono streams.
    const speaker = new Speaker({
        channels: IS_MAC ? 2 : 1, 
        bitDepth: 16,
        sampleRate: 24000,
    });

    speaker.on('error', (err) => console.error('🔊 Speaker Error:', err.message));

    client.onAudio((data) => {
        // Data is Uint8Array from SDK, convert to Node Buffer
        const inputBuffer = Buffer.from(data);
        
        if (IS_MAC) {
            // Binary audio data received - up-mix to Stereo ONLY for Mac
            const outputBuffer = Buffer.alloc(inputBuffer.length * 2);
            const GAIN_BOOST = 2.5;

            for (let i = 0; i < inputBuffer.length; i += 2) {
                if (i + 1 >= inputBuffer.length) break;
                let sample = inputBuffer.readInt16LE(i);
                sample = Math.max(-32768, Math.min(32767, Math.floor(sample * GAIN_BOOST)));

                outputBuffer.writeInt16LE(sample, i * 2);     // Left
                outputBuffer.writeInt16LE(sample, i * 2 + 2); // Right
            }
            speaker.write(outputBuffer);
        } else {
            // Windows/Linux/Other: Play raw Mono stream directly
            speaker.write(inputBuffer);
        }
    });

    process.on('SIGINT', () => {
        console.log("\n👋 Session ended.");
        mic.stop();
        client.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);
