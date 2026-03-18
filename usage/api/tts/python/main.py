import json
import os
import websocket
import pyaudio
import platform
from dotenv import load_dotenv, find_dotenv

# Load API key from root .env
load_dotenv(find_dotenv())
api_key = os.getenv("LOKUTOR_API_KEY")

IS_MAC = platform.system() == "Darwin"

# Global PyAudio stream configuration
p = pyaudio.PyAudio()

# NOTE: Mac hardware requires Stereo (2 channels) even for Mono streams.
output_channels = 2 if IS_MAC else 1
stream = p.open(format=pyaudio.paInt16, channels=output_channels, rate=24000, output=True)

def on_message(ws, message):
    import base64
    audio_chunk = None

    if isinstance(message, str):
        # Handle metadata/control messages first
        if message == 'EOS':
            print("\n✅ Synthesis complete.")
            if stream:
                stream.stop_stream()
                stream.close()
            p.terminate()
            ws.close()
            return
        elif message.startswith('ERR:'):
            print(f"\n❌ Error: {message}")
            ws.close()
            return
        
        # Try parsing JSON for base64 audio data
        try:
            import json
            event = json.loads(message)
            if event.get("type") == "audio":
                audio_chunk = base64.b64decode(event["data"])
        except:
            pass
    else:
        # Binary audio data received directly
        audio_chunk = message

    # --- Speaker Output Loop ---
    if audio_chunk and stream:
        if IS_MAC:
            # Up-mix Mono to Stereo for Mac hardware compatibility
            stereo_message = bytearray()
            GAIN_BOOST = 1.5
            for i in range(0, len(audio_chunk), 2):
                if i + 1 >= len(audio_chunk): break
                sample = int.from_bytes(audio_chunk[i:i+2], byteorder='little', signed=True)
                sample = max(-32768, min(32767, int(sample * GAIN_BOOST)))
                sample_bytes = sample.to_bytes(2, byteorder='little', signed=True)
                stereo_message.extend(sample_bytes)
                stereo_message.extend(sample_bytes)
            stream.write(bytes(stereo_message))
        else:
            stream.write(audio_chunk)
        print(f"Received {len(audio_chunk)} bytes of audio chunk", end="\r")

def on_error(ws, error):
    print(f"WebSocket Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("### WebSocket Closed ###")

def on_open(ws):
    print("🚀 Connected to Lokutor API")
    # Send synthesis request (v1.0 Versa model)
    request = {
        "text": "Hello, this is a test of the raw Lokutor WebSocket API without using any SDK.",
        "voice": "M1",
        "lang": "en",
        "speed": 1.0,
        "version": "versa-1.0"
    }
    ws.send(json.dumps(request))

def main():
    if not api_key:
        print("Error: Please set LOKUTOR_API_KEY in your .env file.")
        return

    # Connect directly to the Lokutor WebSocket endpoint
    ws_url = f"wss://api.lokutor.com/ws?api_key={api_key}"
    
    ws = websocket.WebSocketApp(
        ws_url,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=on_open
    )
    
    ws.run_forever()

if __name__ == "__main__":
    main()
