/**
 * Speech Recognition Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Web Speech API wrapper with Malayalam support
 */
import { useState, useEffect, useCallback, useRef } from 'react'

export type SpeechLanguage = 'en-US' | 'ml-IN' | 'manglish'

interface SpeechRecognitionHook {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  start: (language: SpeechLanguage) => void
  stop: () => void
  reset: () => void
}

// Check browser support
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<SpeechLanguage>('en-US')

  const recognitionRef = useRef<any>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isSupported = !!SpeechRecognition

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [isSupported])

  // Start recognition
  const start = useCallback(
    (language: SpeechLanguage) => {
      if (!isSupported || !recognitionRef.current) {
        setError('Speech recognition is not supported in this browser')
        return
      }

      // Check for Malayalam support warning
      if (language === 'ml-IN') {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        if (!isChrome) {
          setError('Malayalam recognition works best in Chrome browser')
        }
      }

      setError(null)
      setCurrentLanguage(language)
      recognitionRef.current.lang = language

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let interimText = ''
        let finalText = transcript

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript

          if (result.isFinal) {
            finalText += (finalText ? ' ' : '') + text
          } else {
            interimText += text
          }
        }

        setTranscript(finalText)
        setInterimTranscript(interimText)
      }

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)

        switch (event.error) {
          case 'network':
            setError('No internet connection for speech recognition')
            break
          case 'not-allowed':
            setError('Microphone permission denied')
            setIsListening(false)
            break
          case 'no-speech':
            // Silently restart after 5 seconds
            if (isListening) {
              restartTimeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isListening) {
                  try {
                    recognitionRef.current.start()
                  } catch (e) {
                    // Already started, ignore
                  }
                }
              }, 5000)
            }
            break
          case 'aborted':
            // User stopped, don't show error
            break
          default:
            setError(`Recognition error: ${event.error}`)
        }
      }

      // Handle end (restart if still listening)
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Automatically restart to keep continuous recognition
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('Failed to restart recognition:', e)
            setIsListening(false)
          }
        }
      }

      // Start recognition
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          // Already started, ignore
        } else {
          setError('Failed to start speech recognition')
          console.error(e)
        }
      }
    },
    [isSupported, transcript, isListening]
  )

  // Stop recognition
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
    }
  }, [])

  // Reset transcript
  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    start,
    stop,
    reset,
  }
}
