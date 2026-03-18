import os
from dotenv import load_dotenv, find_dotenv
from lokutor import TTSClient, VoiceStyle, Language

# Load API key from root .env
load_dotenv(find_dotenv())
api_key = os.getenv("LOKUTOR_API_KEY")

if not api_key:
    # Error handled: ensure LOKUTOR_API_KEY is defined in the root .env
    print("Error: Please set LOKUTOR_API_KEY in your .env file.")
    exit(1)

def main():
    # 💾 Tip: To save to a file, simply write the bytes to disk:
    # with open('out.wav', 'wb') as f: f.write(audio_data)

    print("📢 Initializing Lokutor TTS Client...")
    
    # Initialize high-level SDK client
    client = TTSClient(api_key=api_key)
    
    text = "Hello! This is a real-time streaming test of the Lokutor standalone text-to-speech engine."
    print(f"Synthesizing: '{text}'")
    
    # Emits audio directly to system speakers using the SDK's built-in processing.
    # client.synthesize(...) supports:
    # - speed: number (0.5 to 2.0)
    # - visemes: bool (Get lipsync data)
    # - version: str (Lock to a specific model version)
    client.synthesize(
        text=text,
        voice=VoiceStyle.F2,
        language=Language.ENGLISH,
        # speed=1.1,         # Uncomment for faster speech
        # visemes=True,      # Uncomment for lipsync data
        # on_visemes=lambda v: print(f"Viseme: {v}"),
        play=True,
        block=True
    )
    
    print("✅ Finished playback.")

if __name__ == "__main__":
    main()
