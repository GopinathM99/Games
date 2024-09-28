import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Your Deepgram API key
API_KEY = os.getenv("DEEPGRAM_API_KEY")

# The API endpoint for Deepgram's transcription service
url = "https://api.deepgram.com/v1/listen?model=general&language=en-US&punctuate=true&diarize=false"

# Headers for the API request
headers = {
    "Authorization": f"Token {API_KEY}",
    "Content-Type": "application/json"
}

# The audio file you want to transcribe
audio_url = "https://static.deepgram.com/examples/Bueller-Life-moves-pretty-fast.wav"

# The payload for the API request
payload = {
    "url": audio_url
}

def transcribe_audio():
    # Make the API call
    response = requests.post(url, json=payload, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        result = json.loads(response.text)
        
        # Extract the transcript
        transcript = result['results']['channels'][0]['alternatives'][0]['transcript']
        
        return transcript
    else:
        return f"Error: {response.status_code} - {response.text}"

if __name__ == "__main__":
    transcript = transcribe_audio()
    print("Transcription:", transcript)