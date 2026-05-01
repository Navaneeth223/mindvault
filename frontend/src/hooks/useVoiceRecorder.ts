/**
 * Voice Recorder Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete implementation with MediaRecorder + Web Audio API for waveform
 */
import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  waveformData: number[]
  error: string | null
}

interface VoiceRecorderActions {
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
}

type UseVoiceRecorder = VoiceRecorderState & VoiceRecorderActions

export function useVoiceRecorder(): UseVoiceRecorder {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>(Array(40).fill(0))
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current)
      waveformIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      chunksRef.current = []

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Determine supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ]
      const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type))

      if (!mimeType) {
        throw new Error('No supported audio format found')
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      mediaRecorderRef.current = mediaRecorder

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setIsRecording(false)
        setIsPaused(false)
        cleanup()
      }

      // Start recording with 250ms timeslice
      mediaRecorder.start(250)
      setIsRecording(true)

      // Setup Web Audio API for waveform visualization
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      // Start waveform sampling
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      waveformIntervalRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray)

        // Sample 40 evenly-spaced points
        const samples: number[] = []
        const step = Math.floor(bufferLength / 40)

        for (let i = 0; i < 40; i++) {
          const index = i * step
          const byte = dataArray[index]
          // Normalize: (byte - 128) / 128, then absolute value
          const normalized = Math.abs((byte - 128) / 128)
          samples.push(normalized)
        }

        setWaveformData(samples)
      }, 80)
    } catch (err: any) {
      console.error('Recording error:', err)
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError('Failed to start recording. Please try again.')
      }
      cleanup()
    }
  }, [cleanup])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [isRecording])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [isRecording, isPaused])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
  }, [isRecording, isPaused])

  // Clear recording
  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setWaveformData(Array(40).fill(0))
    setError(null)
    chunksRef.current = []
  }, [audioUrl])

  // Cleanup on unmount — stops all media and clears all intervals
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      // Stop all media tracks
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      // Close audio context
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
      audioContextRef.current = null
      analyserRef.current = null
      // Clear all intervals
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current)
        waveformIntervalRef.current = null
      }
      // Revoke object URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, []) // empty deps — runs only on unmount

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    waveformData,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  }
}
