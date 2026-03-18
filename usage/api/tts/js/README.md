# Lokutor TTS (Raw WebSocket API - Node.js)

This example shows how to interact with the Lokutor TTS engine directly using **WebSockets** in Node.js, without the official SDK.

## Prerequisites
- **Node.js v18+**
- **Lokutor API Key**.

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
   node index.js
   ```

## Protocol Details
- **Endpoint**: `wss://api.lokutor.com/ws?api_key=YOUR_KEY`
- **Binary Response**: Raw audio data chunks (S16LE, 44.1kHz).
- **Text Response**: Protocol messages like `EOS` or `ERR:`.
