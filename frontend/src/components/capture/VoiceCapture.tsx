/**
 * Voice Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Voice recording with waveform, transcription, and Manglish translation.
 *
 * Three modes:
 *  English   → records + transcribes in English
 *  Malayalam → records + transcribes in Malayalam script
 *  Manglish  → records in Malayalam, auto-translates to English meaning
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Pause, Play, Trash2, Languages, Loader2 } from 'lucide-react'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useSpeechRecognition, SpeechLanguage } from '@/utils/speechRecognition'
import { translateMalayalamToEnglish } from '@/utils/manglishTranslator'
import WaveformVisualiser, { IdleWaveform } from './WaveformVisualiser'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface VoiceCaptureProps {
  onSave: (data: { audioBlob: Blob; transcript: string; title: string; language: string }) => void
  onCancel: () => void
}

type CaptureMode = 'en-US' | 'ml-IN' | 'manglish'

const MODES: { value: CaptureMode; flag: string; label: string; sublabel: string }[] = [
  { value: 'en-US',     flag: '🇬🇧', label: 'English',   sublabel: 'Speak & transcribe in English' },
  { value: 'ml-IN',     flag: '🇮🇳', label: 'Malayalam', sublabel: 'Speak & transcribe in Malayalam' },
  { value: 'manglish',  flag: '🔄', label: 'Manglish',  sublabel: 'Speak Malayalam → get English' },
]

export default function VoiceCapture({ onSave, onCancel }: VoiceCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>('en-US')
  const [title, setTitle] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const lastTranslatedRef = useRef('')   // tracks what we've already translated

  const {
    isRecording, isPaused, duration, audioBlob, waveformData,
    error: recorderError,
    startRecording, stopRecording, pauseRecording, resumeRecording, clearRecording,
  } = useVoiceRecorder()

  const {
    transcript, interimTranscript, isListening, isSupported: speechSupported,
    error: speechError,
    start: startSpeech, stop: stopSpeech, reset: resetSpeech,
  } = useSpeechRecognition()

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ── Auto-translate new Malayalam words in Manglish mode ──────────────────
  useEffect(() => {
    if (mode !== 'manglish') return
    if (!transcript) return

    // Only translate the newly added portion
    const newPart = transcript.slice(lastTranslatedRef.current.length).trim()
    if (!newPart) return

    // Debounce: wait 1.5s of silence before translating
    const timer = setTimeout(async () => {
      setIsTranslating(true)
      try {
        const translated = await translateMalayalamToEnglish(newPart)
        setTranslatedText(prev => prev ? `${prev} ${translated}` : translated)
        lastTranslatedRef.current = transcript
      } finally {
        setIsTranslating(false)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [transcript, mode])

  // ── Auto-generate title ───────────────────────────────────────────────────
  useEffect(() => {
    if (title) return
    const source = mode === 'manglish' ? translatedText : transcript
    if (source) {
      setTitle(source.trim().split(' ').slice(0, 8).join(' '))
    }
  }, [transcript, translatedText, mode, title])

  // ── Speech language to use ────────────────────────────────────────────────
  const speechLang: SpeechLanguage = mode === 'en-US' ? 'en-US' : 'ml-IN'

  const handleRecord = async () => {
    if (!isRecording) {
      await startRecording()
      if (speechSupported) startSpeech(speechLang)
    } else if (isPaused) {
      resumeRecording()
      if (speechSupported) startSpeech(speechLang)
    } else {
      pauseRecording()
      stopSpeech()
    }
  }

  const handleStop = () => { stopRecording(); stopSpeech() }

  const handleClear = () => {
    clearRecording(); resetSpeech()
    setTitle(''); setTranslatedText('')
    lastTranslatedRef.current = ''
  }

  const handleSave = () => {
    if (!audioBlob) return
    const finalTranscript = mode === 'manglish' ? translatedText : transcript
    onSave({
      audioBlob,
      transcript: finalTranscript.trim(),
      title: title || 'Voice Note',
      language: mode === 'en-US' ? 'en' : 'ml',
    })
  }

  const canSave = audioBlob && title.trim().length > 0

  // ── Displayed text ────────────────────────────────────────────────────────
  const displayTranscript = mode === 'manglish' ? translatedText : transcript
  const displayInterim   = mode === 'manglish' ? '' : interimTranscript
  const showTranscriptBox = displayTranscript || displayInterim || isListening || isTranslating

  return (
    <div className="space-y-5">

      {/* ── Mode Selector ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => { if (!isRecording) setMode(m.value) }}
              disabled={isRecording}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all duration-200 text-center
                ${mode === m.value
                  ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                  : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-xl">{m.flag}</span>
              <span className="text-xs font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
        {/* Mode description */}
        <p className="mt-2 text-xs text-dark-text-muted text-center">
          {MODES.find(m => m.value === mode)?.sublabel}
        </p>
        {mode === 'manglish' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 px-3 py-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl"
          >
            <Languages className="w-4 h-4 text-accent-cyan flex-shrink-0" />
            <p className="text-xs text-accent-cyan">
              Speak naturally in Malayalam — your words will be translated to English automatically.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Waveform ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-accent-amber/10 to-accent-amber/5 rounded-2xl p-6 border border-accent-amber/20">
        {isRecording || audioBlob
          ? <WaveformVisualiser data={waveformData} isRecording={isRecording && !isPaused} height={80} />
          : <IdleWaveform height={80} />
        }
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-mono text-dark-text-primary">
          {formatDuration(duration)}
        </div>

        <div className="flex items-center gap-3">
          {/* Trash / Pause-Resume */}
          {audioBlob ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="p-4 rounded-2xl bg-dark-elevated border border-dark-border hover:border-accent-red/50 transition-colors">
              <Trash2 className="w-5 h-5 text-accent-red" />
            </motion.button>
          ) : isRecording ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleRecord}
              className="p-4 rounded-2xl bg-dark-elevated border border-dark-border hover:border-accent-amber/50 transition-colors">
              {isPaused
                ? <Play  className="w-5 h-5 text-accent-amber" />
                : <Pause className="w-5 h-5 text-accent-amber" />}
            </motion.button>
          ) : null}

          {/* Big record button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRecord}
            disabled={!!audioBlob}
            className={`relative p-6 rounded-full transition-all duration-300
              ${isRecording && !isPaused
                ? 'bg-accent-amber shadow-glow animate-pulse-glow'
                : 'bg-accent-amber/20 hover:bg-accent-amber/30'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-8 h-8 text-accent-amber" />
            {isRecording && !isPaused && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-accent-amber"
                animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Stop */}
          {isRecording && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="p-4 rounded-2xl bg-dark-elevated border border-dark-border hover:border-accent-red/50 transition-colors">
              <Square className="w-5 h-5 text-accent-red fill-accent-red" />
            </motion.button>
          )}
        </div>

        {isRecording && !isPaused && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-accent-amber">
            {mode === 'manglish' ? 'Recording in Malayalam...' : 'Recording...'}
          </motion.p>
        )}
        {isPaused && <p className="text-sm text-dark-text-muted">Paused</p>}
      </div>

      {/* ── Transcript / Translation box ──────────────────────────────────── */}
      <AnimatePresence>
        {showTranscriptBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-dark-text-secondary">
              {mode === 'manglish' ? (
                <>
                  <Languages className="w-4 h-4 text-accent-cyan" />
                  English Translation
                  {isTranslating && (
                    <span className="flex items-center gap-1 text-accent-cyan text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> translating...
                    </span>
                  )}
                </>
              ) : (
                <>
                  Transcript
                  {isListening && <span className="text-accent-cyan text-xs">(listening...)</span>}
                </>
              )}
            </label>

            {/* Raw Malayalam (Manglish mode only) */}
            {mode === 'manglish' && transcript && (
              <div className="px-3 py-2 bg-dark-bg/50 border border-dark-border/50 rounded-xl">
                <p className="text-xs text-dark-text-muted">
                  <span className="font-medium text-dark-text-secondary">Malayalam: </span>
                  {transcript}
                  {interimTranscript && <span className="opacity-60 italic"> {interimTranscript}</span>}
                </p>
              </div>
            )}

            {/* Main output box */}
            <div className="min-h-[100px] p-4 bg-dark-elevated border border-dark-border rounded-2xl">
              {displayTranscript ? (
                <p className="text-dark-text-primary whitespace-pre-wrap leading-relaxed">
                  {displayTranscript}
                  {displayInterim && (
                    <span className="text-dark-text-muted italic"> {displayInterim}</span>
                  )}
                </p>
              ) : (
                <p className="text-dark-text-muted italic text-sm">
                  {mode === 'manglish'
                    ? 'Start speaking in Malayalam — English translation will appear here...'
                    : 'Start speaking...'}
                </p>
              )}
            </div>

            {!speechSupported && (
              <p className="text-xs text-accent-amber">
                Speech recognition not supported in this browser. Use Chrome for best results.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Errors ────────────────────────────────────────────────────────── */}
      {(recorderError || speechError) && (
        <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl">
          <p className="text-sm text-accent-red">{recorderError || speechError}</p>
        </div>
      )}

      {/* ── Title (after recording) ───────────────────────────────────────── */}
      {audioBlob && (
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">Title</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Voice note title..."
            required
          />
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Save Voice Note
        </Button>
      </div>
    </div>
  )
}
