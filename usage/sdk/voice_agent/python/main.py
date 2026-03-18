import os
import platform
from dotenv import load_dotenv, find_dotenv
from lokutor import VoiceAgentClient, VoiceStyle, Language

# Load API key from root .env
load_dotenv(find_dotenv())
api_key = os.getenv("LOKUTOR_API_KEY")
IS_MAC = platform.system() == "Darwin"

def main():
    if not api_key:
        print("Error: Please set LOKUTOR_API_KEY in your .env file.")
        return

    print("🎙  Starting Lokutor Voice Agent...")
    print("💡 Press Ctrl+C to end the conversation.")
    
    # Initialize high-level Voice Agent Client
    # This automatically orchestrates STT, LLM, and TTS.
    client = VoiceAgentClient(
        api_key=api_key,
        prompt="You are a helpful and natural conversational AI assistant.",
        voice=VoiceStyle.F2,
        language=Language.ENGLISH,
        # tools=[weather_tool] # Un-comment to enable function calling
    )
    
    # Define tool handlers as properties on the client instance
    # client.on_tool_call = lambda name, args: print(f"🛠️ Tool call: {name}")

    try:
        # start_conversation() handles local microphone capture and 
        # audio playback using the SDK's built-in processing pipeline.
        client.start_conversation()
    except KeyboardInterrupt:
        print("\n👋 Disconnecting...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if "PortAudio" in str(e):
            print("💡 Tip: Ensure your Microphone is connected and has system permissions.")
    finally:
        client.disconnect()

if __name__ == "__main__":
    main()
