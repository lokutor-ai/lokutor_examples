# Lokutor TTS (Node.js SDK Example)

This implementation shows how to use the Lokutor JavaScript SDK in a Node.js console application.

## Capabilities

- **Streaming Binary Data**: Recieve PCM chunks over WebSocket for immediate playback.
- **Adaptive Bitrate**: Highly optimized for low-bandwidth environments.
- **Emotional Range**: Diverse voice styles mapping to different use cases.
- **Node-to-Hardware Piping**: Demonstrates redirecting SDK output to the `speaker` library.
- **Viseme Data**: Access phoneme timestamps for perfect avatar lipsync.

## Setup

1.  **Configure `.env`**: Ensure `LOKUTOR_API_KEY` is set at the root of the project.
2.  **Dependencies**: Run `npm install` at the root.

## Running

```bash
node index.js
```

## Implementation Detail
In Node.js, we utilize the `onAudio` callback to receive binary data and write it directly to a local speaker sink. Because synthesis is often faster than real-time playback, this example includes a "Silence Guard" to detect the end of the audio flow and gracefully close the speaker.

Refer to the [Lokutor JS Docs](https://docs.lokutor.com/sdks/javascript/introduction) for browser-based examples.
