# 🦜 Lokutor Examples

Welcome to the **Lokutor Examples** repository! This repo provides dead-simple, ready-to-use examples for [Lokutor](https://docs.lokutor.com/), implemented in both **Python** and **JavaScript/TypeScript**.

## 📂 Repository Structure

The repo is divided into two tracks:

### 1. Core Usage (`usage/`)
- **`sdk/`**: Using the high-level SDK (e.g. `TTSClient`, `VoiceAgentClient`).
  - `tts/`: Real-time streaming Text-to-Speech playback.
  - `voice_agent/`: Full conversational AI loop (STT -> LLM -> TTS).
- **`api/`**: Bypassing the SDK to use raw WebSockets directly.
  - `tts/`: Raw WebSocket TTS request/response.
  - `voice_agent/`: Manually orchestrating voice-chat events and chunks.

### 2. Integrations (`integrations/`)
- **`telnyx/`**: Bridge Lokutor to inbound/outbound PSTN voice calls via Telnyx.
- **`twilio/`**: SIP media streams via Twilio.
- **`whatsapp/`**: Voice notes and audio replies via WhatsApp.
- **`websocket_frontend/`**: Pairing with browserfrontends/avatars.

---

## 🚀 Getting Started (Setup Once)

Instead of cluttering the folders, we consolidate dependencies at the repository root.

### 1. Configure `.env`
Copy the template and paste your **Lokutor API Key**:
```bash
cp .env.example .env
```

### 2. Install Dependencies

**For Python:**
```bash
# Recommended: use a venv in the root
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**For Node.js:**
```bash
npm install
```

---

## 🏃 Running Examples

Once you have installed the root dependencies, you can run any individual example:

### From the Root Folder

**Python Examples:**
```bash
# General format: python <path-to-main.py>
python usage/sdk/tts/python/main.py
```

**Node.js Examples:**
```bash
# General format: node <path-to-index.js>
node usage/api/tts/js/index.js
```

### From an Example Folder
Alternatively, you can `cd` into any leaf folder. The provided scripts automatically search upwards for your `.env` and dependencies.

---

## 🏗️ Production Architecture & Security

### Where does this code live?
The examples in the `usage/` folder are **Backend scripts**. They use your master `LOKUTOR_API_KEY`, which must **NEVER** be exposed in a browser or client-side app.

### How to build a Browser-Based Voice Chat?
In a real production environment, you should use a **Proxy Bridge** architecture:
1. **Frontend (Browser)**: Captures Microphone audio (via Web Audio API) and sends it to **Your Backend** via a WebSocket.
2. **Backend (Server)**: Securely authenticates the user, then proxies the audio stream to **Lokutor** using your API key.
3. **Synthesis**: Lokutor sends the AI voice back to your Backend, which forwards it to the Browser for playback.

👉 **See the [WebSocket Frontend Integration](integrations/websocket_frontend/)** for a complete, working demonstration of this architecture.

---

## 🧠 Design Philosophy

- **Zero Clutter**: Clean, single-file scripts without redundant boilerplate like local `package.json` files.
- **Copy-Pasteability**: Even with root dependencies, each script is self-contained and easily portable to your own project.
- **Documentation Parity**: Mapped directly to what you see at [docs.lokutor.com](https://docs.lokutor.com/).

## 📄 License
This repository is licensed under the MIT License.
