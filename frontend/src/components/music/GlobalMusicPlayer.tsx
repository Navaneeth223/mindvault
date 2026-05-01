/**
 * Global Music Player
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent bottom player. Collapsed (64px) or expanded (280px).
 * Audio engine: HTML5 Audio via useRef.
 */
import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SkipBack, SkipForward, Play, Pause, Volume2,
  Shuffle, Repeat, Repeat1, ChevronUp, ChevronDown, Music2,
} from 'lucide-react'
import { usePlayerStore, useCurrentTrack } from '@/store/playerStore'

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function GlobalMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const track = useCurrentTrack()
  const {
    isPlaying, currentTime, duration, volume, isShuffle, repeatMode, isExpanded,
    pause, resume, next, prev, seek, setCurrentTime, setDuration, setVolume,
    toggleShuffle, toggleRepeat, toggleExpanded,
  } = usePlayerStore()

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume

    const audio = audioRef.current
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => next()

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
  }, [])

  // Sync track source
  useEffect(() => {
    if (!audioRef.current || !track) return
    const audioUrl = track.metadata?.audio_url || track.file_url
    if (!audioUrl) return
    audioRef.current.src = audioUrl
    if (isPlaying) audioRef.current.play().catch(() => {})
  }, [track?.id])

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = t
    seek(t)
  }, [seek])

  if (!track) return null

  const coverUrl = track.metadata?.cover_art_url || track.thumbnail_url
  const artist = track.metadata?.artist || ''
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <motion.div
      layout
      animate={{ height: isExpanded ? 280 : 64 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="overflow-hidden bg-dark-surface border-t border-accent-cyan/20 flex-shrink-0"
      style={{ zIndex: 30 }}
    >
      {/* Collapsed bar */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0">
        {/* Cover */}
        <div className="w-10 h-10 rounded-lg bg-dark-elevated flex-shrink-0 overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-5 h-5 text-accent-amber" />
            </div>
          )}
        </div>

        {/* Title + progress */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-text-primary truncate">{track.title}</p>
          {artist && <p className="text-xs text-dark-text-muted truncate">{artist}</p>}
          {/* Mini progress bar */}
          <div className="mt-1 h-0.5 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-amber rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
            <SkipBack className="w-4 h-4 text-dark-text-secondary" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="p-2 rounded-full bg-accent-amber hover:bg-accent-amber/90 transition-colors"
          >
            {isPlaying
              ? <Pause className="w-4 h-4 text-dark-bg" />
              : <Play className="w-4 h-4 text-dark-bg ml-0.5" />
            }
          </button>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
            <SkipForward className="w-4 h-4 text-dark-text-secondary" />
          </button>
          <button onClick={toggleExpanded} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors ml-1">
            {isExpanded
              ? <ChevronDown className="w-4 h-4 text-dark-text-muted" />
              : <ChevronUp className="w-4 h-4 text-dark-text-muted" />
            }
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-4 space-y-4"
          >
            {/* Cover + info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-dark-elevated overflow-hidden flex-shrink-0">
                {coverUrl ? (
                  <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-accent-amber" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-dark-text-primary truncate">{track.title}</p>
                {artist && <p className="text-sm text-dark-text-muted">{artist}</p>}
                {track.metadata?.album && (
                  <p className="text-xs text-dark-text-muted">{track.metadata.album}</p>
                )}
              </div>
            </div>

            {/* Seek bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-dark-border rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-accent-amber"
                style={{
                  background: `linear-gradient(to right, #f5a623 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
                }}
              />
              <div className="flex justify-between text-xs text-dark-text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button onClick={prev} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
                  <SkipBack className="w-5 h-5 text-dark-text-secondary" />
                </button>
                <button
                  onClick={isPlaying ? pause : resume}
                  className="p-3 rounded-full bg-accent-amber hover:bg-accent-amber/90 transition-colors"
                >
                  {isPlaying
                    ? <Pause className="w-5 h-5 text-dark-bg" />
                    : <Play className="w-5 h-5 text-dark-bg ml-0.5" />
                  }
                </button>
                <button onClick={next} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
                  <SkipForward className="w-5 h-5 text-dark-text-secondary" />
                </button>
              </div>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-lg transition-colors ${repeatMode !== 'off' ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'}`}
              >
                <RepeatIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-dark-text-muted flex-shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-dark-border rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-accent-cyan"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
