# Lokutor Voice Agent

The Voice Agent is an orchestrated client that handles the entire conversational loop: **Microphone -> Speech-To-Text -> LLM -> Text-To-Speech -> Speaker**.

## Capabilities

- **Full-Duplex Audio**: Low-latency simultaneous input and output.
- **Native Barge-In**: The AI immediately stops speaking the moment it detects your voice.
- **Natural Turn-Taking**: Handles pauses and interruptions without confusing the agent.
- **Orchestrated Latency**: The client manages the synchronization between STT and TTS to minimize delay.

## Requirements

### External Tools
- **Sox**: Required for microphone capture in Node.js.
  - Mac: `brew install sox`
  - Linux: `sudo apt-get install sox`
  - Windows: [Download Sox EXE](http://sox.sourceforge.net/)

## Running

### Python
```bash
python python/main.py
```

### Node.js
```bash
node js/index.js
```

## Implementation Note

The SDK handles hardware orchestration automatically:
- **Python**: Uses `PyAudio` and the internal processing pipeline.
- **Node.js (v2.0+)**: Use `client.startManaged()` for zero-boilerplate microphone and speaker management. The SDK handles internal resampling and Mono-to-Stereo up-mixing for cross-platform compatibility (especially macOS).

