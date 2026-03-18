# Lokutor TTS (Python SDK Example)

This example demonstrates how to synthesize real-time streaming audio using the Lokutor Python SDK.

## Capabilities

- **Ultra-Low Latency**: Sub-70ms Time-To-First-Byte (TTFB) via streaming binary chunks.
- **Voice Variety**: Access a wide range of realistic voice styles (F1, F2, M1, etc.).
- **Global Support**: 50+ languages with native accent accuracy.
- **Custom Sink**: Use `on_audio` to pipe audio to speakers, buffers, or files.
- **Lip-Syncing**: Support for Viseme data to animate digital avatars.

## Setup

1.  **Configure `.env`**: Set your `LOKUTOR_API_KEY` in the root `.env` file.
2.  **Dependencies**: Install root requirements: `pip install -r requirements.txt`.

## Running

```bash
python main.py
```

## How It Works
The script initializes the `TTSClient` and calls `synthesize`. With `play=True` and `block=True`, the SDK automatically handles local playback through your hardware while blocking the terminal until the sentence is complete.

For more complex implementations, check the **Integration** folder.
