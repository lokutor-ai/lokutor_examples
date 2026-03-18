import { TTSClient, VoiceStyle } from '@lokutor/sdk';
import * as dotenv from 'dotenv';
import Speaker from 'speaker';
import os from 'os';

dotenv.config();
const IS_MAC = os.platform() === 'darwin';

/**
 * Minimal Example: Standalone Text-to-Speech in Node.js
 * 
 * Demonstrates streaming audio from Lokutor API and piping it 
 * directly to your system speakers.
 */
async function main() {
    const apiKey = process.env.LOKUTOR_API_KEY;
    if (!apiKey) {
        console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
        process.exit(1);
    }

    const client = new TTSClient({ apiKey });
    
    // 🔊 Setup Speaker Playback (Output)
    // NOTE: Mac hardware requires Stereo (2 channels) even for Mono streams.
    const speaker = new Speaker({
        channels: IS_MAC ? 2 : 1, 
        bitDepth: 16,
        sampleRate: 44100,
    });

    const textToSay = 'Hello world, this is a real-time streaming test of Lokutor TTS in Node.js.';
    console.log(`🎙  Synthesizing: "${textToSay}"`);

    // Stream handler logic
    let streamActive = true;
    let silenceTimer;

    const stopPlayback = () => {
        if (!streamActive) return;
        streamActive = false;
        speaker.end();
        console.log("✅ Finished playback.");
        process.exit(0);
    };

    // Begin synthesis
    client.synthesize({
        text: textToSay,
        voice: VoiceStyle.F1,
        // speed: 1.1,         // Increase speed for faster playback
        // visemes: true,      // Set to true to receive lipsync data
        // onVisemes: (v) => console.log('Viseme:', v),
        onAudio: (data) => {
            const inputBuffer = Buffer.from(data);
            
            if (IS_MAC) {
                // Binary audio data received - up-mix to Stereo ONLY for Mac
                const outputBuffer = Buffer.alloc(inputBuffer.length * 2);
                for (let i = 0; i < inputBuffer.length; i += 2) {
                    if (i + 1 >= inputBuffer.length) break;
                    const sample = inputBuffer.readInt16LE(i);
                    outputBuffer.writeInt16LE(sample, i * 2);     // Left
                    outputBuffer.writeInt16LE(sample, i * 2 + 2); // Right
                }
                speaker.write(outputBuffer);
            } else {
                // Windows/Linux/Other: Play raw Mono stream directly
                speaker.write(inputBuffer);
            }
            
            // 💾 Tip: To save to a file, simply pipe chunks to a WriteStream:
            // fs.appendFileSync('output.wav', chunk);
            
            // Watchdog: detect the end of audio data flow
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(stopPlayback, 2000);
        }
    });
}

main().catch(console.error);
