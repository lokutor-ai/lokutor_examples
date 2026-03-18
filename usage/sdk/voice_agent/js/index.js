import { VoiceAgentClient } from '@lokutor/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Lokutor Voice Agent - Simplest Approach (v2.0+)
 * 
 * Demonstrates the 'Managed' session which handles microphone,
 * speaker, and binary stream orchestration automatically.
 */
async function main() {
    const apiKey = process.env.LOKUTOR_API_KEY;
    if (!apiKey) {
        console.error("Error: Please set LOKUTOR_API_KEY in your .env file.");
        process.exit(1);
    }

    console.log("🎙 Starting Lokutor Voice Agent (Managed Mode)...");
    console.log("💡 Speak naturally. AI will listen and respond.");
    console.log("💡 Press Ctrl+C to end.");

    const client = new VoiceAgentClient({ apiKey });

    // New Event API
    client.on('transcription', (text) => console.log('👤 You:', text));
    client.on('response', (text) => console.log('🤖 AI:', text));
    client.on('status', (status) => {
        if (status === 'interrupted') console.log('⚡ [Barge-in]');
    });
    client.on('ttfb', (ms) => console.log(`📡 Latency: ${ms}ms`));
    client.on('error', (err) => console.error('❌ Error:', err));

    // The "Golden Path" - handles connect, mic, and speaker
    // In Node.js, this uses an internal optimized driver.
    const session = await client.startManaged();

    if (!session) {
        console.error("❌ Failed to start session.");
        return;
    }

    process.on('SIGINT', () => {
        console.log("\n👋 Session ended.");
        client.disconnect();
        process.exit(0);
    });
}

main().catch((err) => {
    console.error("Critical Failure:", err);
    process.exit(1);
});
