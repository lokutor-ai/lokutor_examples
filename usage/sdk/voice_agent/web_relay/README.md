# Lokutor Voice Agent - SDK Web Relay Example

This example demonstrates how to integrate the Lokutor Voice Agent into a **Web Application** using the official **Lokutor SDK** (`@lokutor/sdk`) on the backend.

## 🏗️ Architecture: Why use the SDK?

While the `api/web_relay` example uses raw WebSockets, this version uses the **Lokutor SDK**, which is the recommended way to build production-level voice experiences.

### Benefits of the SDK in a Relay:
*   **Event-Driven**: You get clean callbacks like `onTranscription` and `onResponse`, perfect for logging conversations to your database.
*   **Consistency**: The SDK manages the handshake, timeouts, and protocol versions for you.
*   **Scalability**: Built-in support for multiple voice agents and custom configuration.

### The Flow:
1.  **Frontend (Browser)**: Same high-performance UI, capturing mic and scheduling audio.
2.  **Backend (Node.js SDK)**: Uses `VoiceAgentClient` to connect securely to Lokutor with your API key.
3.  **Communication**: The backend subscribes to SDK events and forwards them to the browser over its own WebSocket session.

## 🚀 How to Run

1.  **Environment**: Ensure you have `LOKUTOR_API_KEY` in your `.env`.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start the SDK Relay Server**:
    ```bash
    node usage/sdk/voice_agent/web_relay/server.mjs
    ```
4.  **Open in Browser**: Navigate to [http://localhost:3001](http://localhost:3001) (default for this version).

## 💡 Key Design Tip

In this SDK version, the **backend can "listen" to the conversation**. This is useful for:
*   **Security Filtering**: Checking user transcripts before they reach the LLM.
*   **Data Archiving**: Storing the user's transcript or AI's reply in your own database as it happens.
*   **Session Management**: Attaching user IDs or session metadata before the connection is established.

---
*Note: This example uses the same frontend as the standard [api/web_relay](../../../api/voice_agent/web_relay) to ensure consistency.*

