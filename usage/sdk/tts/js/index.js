import { TTSClient, VoiceStyle } from '@lokutor/sdk';
import * as dotenv from 'dotenv';
import Speaker from 'speaker';
import os from 'os';

dotenv.config();
const IS_MAC = os.platform() === 'darwin';

/**
 * Lokutor TTS - Simplest Approach (v2.0+)
 * 
 * Demonstrates streaming audio with the new deterministic Promise 
 * resolution and TTFB latency tracking.
 */
async function main() {
    const apiKey = process.env.LOKUTOR_API_KEY;
    if (!apiKey) {
        console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
        process.exit(1);
    }

    const client = new TTSClient({ apiKey });
    
    // 🔊 Setup Speaker Playback (Output)
    const speaker = new Speaker({
        channels: IS_MAC ? 2 : 1, 
        bitDepth: 16,
        sampleRate: 44100,
    });

    const textToSay = 'Hello world, this is a real-time streaming test of Lokutor TTS in Node.js.';
    console.log(`🎙  Synthesizing: "${textToSay}"`);

    // The synthesize() method now returns a Promise that 
    // resolves reliably when the server sends the EOS signal.
    await client.synthesize({
        text: textToSay,
        voice: VoiceStyle.F1,
        
        onTTFB: (ms) => console.log(`📡 Time to First Byte: ${ms}ms`),
        
        onAudio: (data) => {
            const inputBuffer = Buffer.from(data);
            
            if (IS_MAC) {
                // Up-mix to Stereo for Mac compatibility
                const outputBuffer = Buffer.alloc(inputBuffer.length * 2);
                for (let i = 0; i < inputBuffer.length; i += 2) {
                    if (i + 1 >= inputBuffer.length) break;
                    const sample = inputBuffer.readInt16LE(i);
                    outputBuffer.writeInt16LE(sample, i * 2);     
                    outputBuffer.writeInt16LE(sample, i * 2 + 2); 
                }
                speaker.write(outputBuffer);
            } else {
                speaker.write(inputBuffer);
            }
        }
    });

    console.log("✅ Finished playback.");
    process.exit(0);
}

main().catch(console.error);
