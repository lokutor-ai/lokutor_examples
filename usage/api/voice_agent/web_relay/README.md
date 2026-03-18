# Lokutor Voice Agent - Web Relay Example

This example demonstrates how to integrate the Lokutor Voice Agent into a **Web Application** using a secure **Backend Relay** architecture.

## 🏗️ Architecture: Why use a Relay?

In a production environment, you should **never** expose your `LOKUTOR_API_KEY` in the frontend (browser). If you do, anyone can inspect your source code, steal your key, and use your credits.

### The Flow:
1.  **Frontend (Browser)**: Captures your microphone, converts audio to 16kHz PCM, and sends it to **your backend** via a local WebSocket.
2.  **Backend (Node.js Relay)**: Holds the secret API key. It connects to **Lokutor Cloud** and "pipes" the audio data back and forth between the user and the AI.
3.  **Security**: The user's browser only knows about your server (`localhost:3000`), not the secret Lokutor credentials.

## 🚀 How to Run

1.  **Environment**: Ensure you have a `.env` file in the project root with your key:
    ```env
    LOKUTOR_API_KEY=your_secret_key_here
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start the Server**:
    ```bash
    node usage/api/voice_agent/web_relay/server.mjs
    ```
4.  **Open in Browser**: Navigate to [http://localhost:3000](http://localhost:3000)
5.  **Talk**: Click "Start Conversation" and speak naturally!

## 💡 Key Features of this Example

### 1. Zero-Gap Audio Scheduling
Browsers often stutter when playing back raw binary chunks. This example uses a **time-based scheduler** in `public/client.js` that pre-buffers audio on the `AudioContext` timeline for seamless, human-like speech.

### 2. Intelligent Barge-in (Interruption)
If you start talking while the AI is still speaking, the client immediately detects the `interrupted` status from Lokutor and **kills the audio queue**. This allows for a natural, fast-paced conversation where you can cut the AI off anytime.

### 3. Visual Volume Feedback
The central "Voice Orb" isn't just an animation—it scales its size based on the actual volume of your microphone, providing immediate visual confirmation that the AI can "hear" you.

---
*Note: This example uses raw WebSockets for the relay. For a version using the official Lokutor SDK on the backend, see the [usage/sdk/voice_agent/web_relay](../../../sdk/voice_agent/web_relay) folder.*

