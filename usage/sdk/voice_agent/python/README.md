# Lokutor Voice Agent (Python SDK)

This example shows how to build a full, two-way conversational AI agent using the Lokutor Python SDK.

## Prerequisites
- **Python 3.10+**
- A working **microphone** and **speakers** on your machine.
- **Lokutor API Key**.

## Quick Start

1. **Configure `.env`**:
   ```env
   LOKUTOR_API_KEY="your-api-key-here"
   ```

2. **Setup**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run**:
   ```bash
   python main.py
   ```

## How it works
- The `VoiceAgentClient` is a high-level orchestrator.
- It captures your audio (STT), sends it to an LLM, and streams back synthesized speech (TTS).
- It handles **VAD (Voice Activity Detection)** and **Barge-in** (interruptions) natively.
