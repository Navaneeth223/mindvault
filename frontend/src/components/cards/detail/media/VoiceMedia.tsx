/**
 * Voice Media
 * ─────────────────────────────────────────────────────────────────────────────
 * Audio player with transcript
 */
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card } from '@/api/cards'

interface VoiceMediaProps {
  card: Card
}

export default function VoiceMedia({ card }: VoiceMediaProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyTranscript = async () => {
    if (card.transcript) {
      try {
        await navigator.clipboard.writeText(card.transcript)
        toast.success('Transcript copied')
      } catch (error) {
        toast.error('Failed to copy')
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-accent-amber/10 to-accent-amber/5 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent-amber/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent-amber" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-dark-text-primary">Voice Note</h3>
          <p className="text-xs text-dark-text-muted">
            {card.metadata?.language === 'ml' ? 'Malayalam' : 'English'}
          </p>
        </div>
      </div>

      {/* Waveform placeholder */}
      <div className="h-16 mb-4 flex items-end gap-1 justify-center">
        {Array.from({ length: 40 }).map((_, i) => {
          const height = Math.random() * 60 + 20
          const isActive = currentTime > 0 && (i / 40) < (currentTime / duration)
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-full transition-colors"
              style={{
                height: `${height}%`,
                backgroundColor: isActive ? '#f5a623' : 'rgba(245, 166, 35, 0.3)',
              }}
            />
          )
        })}
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src={card.file_url || undefined} preload="metadata" />

      {/* Controls */}
      <div className="space-y-3">
        {/* Seek bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-accent-amber/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-amber"
        />

        {/* Time + buttons */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-dark-text-muted">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-10)}
              className="p-2 rounded-lg hover:bg-accent-amber/10 transition-colors"
            >
              <SkipBack className="w-5 h-5 text-accent-amber" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-accent-amber hover:bg-accent-amber/90 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-dark-bg" />
              ) : (
                <Play className="w-5 h-5 text-dark-bg ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 rounded-lg hover:bg-accent-amber/10 transition-colors"
            >
              <SkipForward className="w-5 h-5 text-accent-amber" />
            </button>
          </div>

          <div className="w-20" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Transcript */}
      {card.transcript && (
        <div className="mt-6 pt-6 border-t border-accent-amber/20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-dark-text-muted">Transcript</p>
            <button
              onClick={handleCopyTranscript}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-accent-amber hover:bg-accent-amber/10 rounded-lg transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <div className="max-h-[200px] overflow-y-auto border border-accent-amber/20 rounded-xl p-3">
            <p className="text-sm text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
              {card.transcript}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
