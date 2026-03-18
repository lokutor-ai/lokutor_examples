# Lokutor Voice Agent (JavaScript/Node.js SDK)

This example shows how to build a full, two-way conversational AI agent using the Lokutor JavaScript SDK in Node.js.

## Prerequisites
- **Node.js v18+**
- A working **microphone** and **speakers** on your machine.
- **Lokutor API Key**.
- *(Optional)*: `sox` for microphone recording:
  ```bash
  # macOS
  brew install sox
  # Linux
  sudo apt-get install sox libsox-fmt-all libasound2-dev
  ```

## Quick Start

1. **Configure `.env`**:
   ```env
   LOKUTOR_API_KEY="your-api-key-here"
   ```

2. **Setup**:
   ```bash
   npm install
   ```

3. **Run**:
   ```bash
   npm start
   ```

## How it works
- The `VoiceAgentClient` is a high-level orchestrator.
- **Input**: We use `node-record-lpcm16` for microphone capture and stream chunks via `client.sendAudio()`.
- **Output**: We capture the audio response stream via `client.onAudio()` and pipe it into a system `Speaker`.
- It handles **VAD (Voice Activity Detection)** and **Barge-in** (interruptions) natively through the Lokutor server.
