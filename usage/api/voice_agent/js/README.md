# Lokutor Voice Agent (Raw WebSocket API - Node.js)

This example shows how to build a voice-first conversational experience in Node.js by manually managing chunks and metadata over a raw WebSocket.

## Prerequisites
- **Node.js v18+**
- Working **microphone** and **speakers**.
- **Lokutor API Key**.
- *(Required)*: `sox` or similar for recorded audio capture:
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

## Protocol Steps
1. **Initiate**: Open `wss://api.lokutor.com/voice-chat?api_key=...`
2. **Config**: Send JSON messages for `prompt`, `voice`, and `language`.
3. **Stream Up (Mic)**: Capture and send raw PCM S16LE chunks as binary.
4. **Handle Down (AI)**:
   - Listen for JSON to update UI (transcripts, statuses).
   - Listen for binary and write directly to your speaker buffer.
