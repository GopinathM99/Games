import requests
import json
import os
from dotenv import load_dotenv
import pyaudio
import wave

# Load environment variables
load_dotenv()

# Your Deepgram API key
API_KEY = os.getenv("DEEPGRAM_API_KEY")

# The API endpoint for Deepgram's transcription service
url = "https://api.deepgram.com/v1/listen?model=general&language=en-US&punctuate=true&diarize=false"

# Headers for the API request
headers = {
    "Authorization": f"Token {API_KEY}",
    "Content-Type": "audio/wav"
}

def record_audio(filename="recording.wav", duration=5, sample_rate=44100, channels=1, chunk=1024):
    print("Recording...")
    audio = pyaudio.PyAudio()
    stream = audio.open(format=pyaudio.paInt16, channels=channels,
                        rate=sample_rate, input=True,
                        frames_per_buffer=chunk)
    
    frames = []
    for _ in range(0, int(sample_rate / chunk * duration)):
        data = stream.read(chunk)
        frames.append(data)
    
    print("Finished recording.")
    
    stream.stop_stream()
    stream.close()
    audio.terminate()
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(frames))
    
    return filename

def transcribe_audio(filename):
    with open(filename, 'rb') as audio:
        response = requests.post(url, data=audio, headers=headers)

    if response.status_code == 200:
        result = json.loads(response.text)
        transcript = result['results']['channels'][0]['alternatives'][0]['transcript']
        return transcript
    else:
        return f"Error: {response.status_code} - {response.text}"

if __name__ == "__main__":
    audio_file = record_audio(duration=10)  # Record for 10 seconds
    transcript = transcribe_audio(audio_file)
    print("Transcription:", transcript)