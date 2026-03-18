import os
import signal
import sys
from dotenv import load_dotenv, find_dotenv
from lokutor import VoiceAgentClient, VoiceStyle, Language

# Load API key from root .env
load_dotenv(find_dotenv())
api_key = os.getenv("LOKUTOR_API_KEY")

def main():
    if not api_key:
        print("Error: Please set LOKUTOR_API_KEY in your .env file.")
        return

    print("🎙  Starting Lokutor Voice Agent...")
    print("💡 Press Ctrl+C to end the conversation.")
    
    # Initialize high-level Voice Agent Client
    # Prompt is now optional (defaults to natural conversational AI)
    client = VoiceAgentClient(
        api_key=api_key,
        prompt="You are a helpful and natural conversational AI assistant.",
        voice=VoiceStyle.F2,    
        language=Language.ENGLISH,
        # tools=[tool_name] # Un-comment to enable function calling
    )
    
    # Define tool handlers as properties on the client instance
    # client.on_tool_call = lambda name, args: print(f"🛠️ Tool call: {name}")

    try:
        # start_conversation() now has fixed 'block' logic 
        # and joined playback thread to prevent premature exits.
        client.start_conversation()
    except Exception as e:
        print(f"\n❌ Execution Error: {e}")
    finally:
        client.disconnect()

if __name__ == "__main__":
    main()
