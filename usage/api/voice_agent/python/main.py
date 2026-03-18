import json
import os
import websocket
import threading
import pyaudio
import platform
from dotenv import load_dotenv, find_dotenv

# Load API key from root .env
load_dotenv(find_dotenv())
api_key = os.getenv("LOKUTOR_API_KEY")

IS_MAC = platform.system() == "Darwin"

# Global audio objects for callback access
p = None
output_stream = None

# Audio Config
INPUT_RATE = 16000
OUTPUT_RATE = 44100
CHANNELS = 1
FORMAT = pyaudio.paInt16
CHUNK_SIZE = 2048 # Smaller chunks for lower latency

def on_message(ws, message):
    import base64
    audio_data = None

    if isinstance(message, str):
        # JSON message handling (Events)
        msg_json = json.loads(message)
        msg_type = msg_json.get("type")
        
        if msg_type == "status":
            print(f"[{msg_json['data'].upper()}]", end=" ", flush=True)
        elif msg_type == "transcript":
            role = msg_json.get("role", "system")
            print(f"\n{role.capitalize()}: {msg_json['data']}")
        elif msg_type == "audio":
            # 🔊 Case A: Audio is sent as Base64 in JSON
            audio_data = base64.b64decode(msg_json["data"])
        elif msg_type == "error":
            print(f"\n❌ Error: {msg_json['data']}")
    else:
        # 🔊 Case B: Audio is sent as raw binary frame
        audio_data = message

    # --- Speaker Output Loop ---
    if audio_data and output_stream:
        if IS_MAC:
            # Up-mix Mono(24k) to Stereo(44.1k/48k) for Mac hardware
            # We duplicate each sample twice (2x Rate) to fill the 44.1k buffer faster
            stereo_message = bytearray()
            GAIN_BOOST = 1.5
            for i in range(0, len(audio_data), 2):
                if i + 1 >= len(audio_data): break
                sample = int.from_bytes(audio_data[i:i+2], byteorder='little', signed=True)
                sample = max(-32768, min(32767, int(sample * GAIN_BOOST)))
                sample_bytes = sample.to_bytes(2, byteorder='little', signed=True)
                
                # Write to L/R twice each (2x samples = 48kHz output)
                for _ in range(2):
                    stereo_message.extend(sample_bytes) # Left
                    stereo_message.extend(sample_bytes) # Right
            output_stream.write(bytes(stereo_message))
        else:
            output_stream.write(audio_data)

def on_error(ws, error):
    print(f"\nWebSocket Error: {error}")

def on_close(ws, status, msg):
    print("\n### Connection Closed ###")

def on_open(ws):
    print("🚀 Connected to Lokutor Voice Chat API")
    
    # 1. Initialization sequence
    ws.send(json.dumps({"type": "prompt", "data": "You are a helpful and natural conversational AI assistant."}))
    ws.send(json.dumps({"type": "voice", "data": "F1"}))
    ws.send(json.dumps({"type": "language", "data": "en"}))
    
    # 2. Start audio capture thread (Microphone -> Lokutor)
    def mic_stream():
        print("🎙 Microphone Active. Start speaking...")
        input_stream = p.open(format=FORMAT, channels=CHANNELS, rate=INPUT_RATE, input=True, frames_per_buffer=CHUNK_SIZE)
        try:
            while True:
                data = input_stream.read(CHUNK_SIZE, exception_on_overflow=False)
                ws.send(data, opcode=websocket.ABNF.OPCODE_BINARY)
        except Exception as e:
            print(f"\nMic Error: {e}")
        finally:
            input_stream.stop_stream()
            input_stream.close()

    threading.Thread(target=mic_stream, daemon=True).start()

def main():
    if not api_key:
        print("Error: Please set LOKUTOR_API_KEY in your .env file.")
        return

    global p, output_stream
    p = pyaudio.PyAudio()
    
    # Mac hardware requires Stereo (2 channels) for these streams.
    output_rate = OUTPUT_RATE
    output_channels = 2 if IS_MAC else 1
    output_stream = p.open(format=FORMAT, channels=output_channels, rate=output_rate, output=True)

    ws_url = f"wss://api.lokutor.com/ws/agent?api_key={api_key}"
    
    ws = websocket.WebSocketApp(
        ws_url,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=on_open
    )
    
    try:
        ws.run_forever()
    except KeyboardInterrupt:
        ws.close()
    finally:
        output_stream.stop_stream()
        output_stream.close()
        p.terminate()

if __name__ == "__main__":
    main()
