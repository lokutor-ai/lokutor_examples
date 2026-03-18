# 🦜 Lokutor Examples

Welcome to the **Lokutor Examples** repository! This repo provides dead-simple, ready-to-use examples for [Lokutor](https://docs.lokutor.com/), the lowest-latency conversational AI engine.

## 📂 Repository Structure

The examples are divided into two main tracks:

### 1. Core Usage ([usage/](./usage))
- **[SDK-driven](./usage/sdk)** (Recommended): Low-code integration using the high-level Lokutor libraries.
  - **[TTS Playback](./usage/sdk/tts)**: Real-time streaming Text-to-Speech directly to speakers.
  - **[Voice Agent](./usage/sdk/voice_agent)**: Full conversational AI loop with battery-included hardware management.
- **[API-driven (Raw)](./usage/api)**: Lower-level control using raw WebSockets directly.
  - **[TTS API](./usage/api/tts)**: Direct WebSocket request/response for audio chunks.
  - **[Voice Chat API](./usage/api/voice_agent)**: Manual orchestration of STT, LLM, and TTS events.

### 2. Integrations ([integrations/](./integrations))
- **[Telnyx](./integrations/telnyx)**: Inbound/outbound PSTN voice calls.
- **[Twilio](./integrations/twilio)**: SIP media streams and telephony.
- **[WhatsApp](./integrations/whatsapp)**: AI voice notes and audio replies.
- **[WebSocket Frontend](./integrations/websocket_frontend)**: The "Proxy Bridge" architecture for browser-based avatars (React/Vue/Vanilla).

---

## 🚀 Getting Started

Dependencies are consolidated at the repository root to ensure version parity.

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your LOKUTOR_API_KEY
```

### 2. Install Dependencies
```bash
# Python
pip install -r requirements.txt

# Node.js
npm install
```

---

## 🏗️ Production Architecture & Security

The examples in the `usage/` folder are primarily **Backend scripts**. They use your internal `LOKUTOR_API_KEY`, which must **NEVER** be exposed to a browser or client.

### Building for the Browser?
If you are building a web-based AI assistant, you should use a **Relay (Proxy Bridge)**:
1. **Frontend**: Captures audio and sends it to your server via WebSocket.
2. **Backend**: Proxies that audio to Lokutor securely using the SDK or API.
3. **Synthesis**: The AI voice is returned to your server, then forwarded to the browser.

👉 **See the [Web Relay Demonstration](./usage/sdk/voice_agent/web_relay)** for the simplest production-ready proxy implementation.
👉 **See the [Advanced Frontend Integration](./integrations/websocket_frontend)** for pairing with visual avatars.

---

## 📄 License
This repository is licensed under the MIT License.
