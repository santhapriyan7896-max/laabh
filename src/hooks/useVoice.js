import { useState } from 'react'

export function useVoice(onResult, onError) {
  const [listening, setListening] = useState(false)

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      onError('Voice not supported. Use Chrome browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ta-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = (e) => { setListening(false); onError(e.error) }
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
    }

    recognition.start()
  }

  return { listening, startListening }
}