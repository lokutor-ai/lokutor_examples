# Lokutor TTS (Raw WebSocket API)

This example shows how to interact with the Lokutor TTS engine directly using **WebSockets**, bypassing the official SDK.

## Prerequisites
- **Python 3.10+**
- **Lokutor API Key**.

## Quick Start

1. **Configure `.env`**:
   ```env
   LOKUTOR_API_KEY="your-api-key-here"
   ```

2. **Setup**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run**:
   ```bash
   python main.py
   ```

## Protocol Details
- **Endpoint**: `wss://api.lokutor.com/ws?api_key=YOUR_KEY`
- **Request**: Send a JSON string with `text`, `voice`, `lang`, and `version`.
- **Response**:
  - **Binary**: Raw audio chunks (S16LE, 44100Hz).
  - **String**: Status messages like `EOS` (End of Stream) or `ERR:...`.
