# Lokutor Voice Agent (Raw API - Python)

This example demonstrates how to build a full voice conversational loop by manually managing the WebSocket connection, without relying on the Lokutor SDK.

## Prerequisites
- **Python 3.10+**
- Working **microphone** and **speakers**.
- **Lokutor API Key**.
- *(Linux)*: `libasound2-dev` or `portaudio19-dev` might be required for `pyaudio`.

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

## Protocol Steps
1. **Connect**: Open `wss://api.lokutor.com/voice-chat?api_key=...`
2. **Initialize**: Send JSON configurations for `prompt`, `voice`, and `language`.
3. **Stream Audio (Up)**: Capture your mic (PCM S16LE, 44.1kHz) and send it as binary chunks over the socket.
4. **Handle UI (Down)**: Listen for JSON messages (`status`, `transcript`) to update your interface.
5. **Stream Audio (Down)**: Listen for binary chunks and write them directly to your speaker buffer.
