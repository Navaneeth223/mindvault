/**
 * Timer Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Focus timer / Pomodoro system with session logging and ambient sound.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Play, Pause, Square, SkipForward, Settings2, Flame, CheckCircle2, XCircle } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'
import { useTimerStore } from '@/store/timerStore'
import TimerRing from '@/components/timer/TimerRing'
import { timerApi, TimerStats } from '@/api/timer'
import { format } from 'date-fns'

const AMBIENT_OPTIONS = [
  { value: 'none', label: 'None', emoji: '🔇' },
  { value: 'rain', label: 'Rain', emoji: '🌧️', url: 'https://freesound.org/data/previews/346/346170_5121236-lq.mp3' },
  { value: 'cafe', label: 'Café', emoji: '☕', url: 'https://freesound.org/data/previews/243/243627_4284968-lq.mp3' },
]

export default function TimerPage() {
  const {
    presets, autoStartBreaks, autoStartFocus, longBreakAfter,
    dailyGoal, ambientSound, ambientVolume,
    setPresets, setAmbientSound, setAmbientVolume,
  } = useTimerStore()

  const [customMinutes, setCustomMinutes] = useState(25)
  const [selectedPreset, setSelectedPreset] = useState<'25' | '50' | 'custom'>('25')
  const [showSettings, setShowSettings] = useState(false)
  const [linkedCardId, setLinkedCardId] = useState<string | undefined>()
  const [ambientAudio] = useState(() => new Audio())

  const focusMinutes = selectedPreset === '25' ? 25 : selectedPreset === '50' ? 50 : customMinutes

  const timer = useTimer({
    focusMinutes,
    shortBreakMinutes: presets.shortBreak,
    longBreakMinutes: presets.longBreak,
    longBreakAfter,
    autoStartBreaks,
    autoStartFocus,
    onPhaseComplete: (phase) => {
      if (phase === 'focus') {
        ambientAudio.pause()
      } else if (ambientSound !== 'none') {
        const opt = AMBIENT_OPTIONS.find(o => o.value === ambientSound)
        if (opt?.url) {
          ambientAudio.src = opt.url
          ambientAudio.loop = true
          ambientAudio.volume = ambientVolume
          ambientAudio.play().catch(() => {})
        }
      }
    },
  })

  // Ambient sound control
  useEffect(() => {
    if (timer.isRunning && timer.phase === 'focus' && ambientSound !== 'none') {
      const opt = AMBIENT_OPTIONS.find(o => o.value === ambientSound)
      if (opt?.url) {
        ambientAudio.src = opt.url
        ambientAudio.loop = true
        ambientAudio.volume = ambientVolume
        ambientAudio.play().catch(() => {})
      }
    } else {
      ambientAudio.pause()
    }
  }, [timer.isRunning, timer.phase, ambientSound])

  useEffect(() => {
    ambientAudio.volume = ambientVolume
  }, [ambientVolume])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Today's sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['timer-sessions-today'],
    queryFn: () => timerApi.listSessions({ page_size: 20 }),
    refetchInterval: timer.isRunning ? 30000 : false,
  })

  const { data: statsData } = useQuery({
    queryKey: ['timer-stats-today'],
    queryFn: () => timerApi.getStats('today'),
    refetchInterval: 60000,
  })

  const sessions = sessionsData?.results || []
  const stats: Partial<TimerStats> = statsData || {}
  const totalFocusMinutes = Math.round((stats.total_focus_seconds || 0) / 60)
  const goalProgress = Math.min(100, (totalFocusMinutes / dailyGoal) * 100)

  const handleStart = () => {
    timer.start(linkedCardId)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-1">Focus Timer</h1>
          <p className="text-dark-text-muted text-sm">Deep work, one session at a time</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-xl border transition-all ${showSettings ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-dark-border text-dark-text-muted hover:border-dark-text-muted'}`}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Settings panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-dark-surface border border-dark-border rounded-2xl space-y-3"
        >
          <p className="text-sm font-semibold text-dark-text-secondary">Timer Presets (minutes)</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Focus', key: 'focus' as const, value: presets.focus },
              { label: 'Short Break', key: 'shortBreak' as const, value: presets.shortBreak },
              { label: 'Long Break', key: 'longBreak' as const, value: presets.longBreak },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="block text-xs text-dark-text-muted mb-1">{label}</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={value}
                  onChange={e => setPresets({ [key]: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main timer */}
      <div className="flex flex-col items-center gap-8">
        {/* Preset selector */}
        <div className="flex gap-2">
          {(['25', '50', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPreset(p)}
              disabled={timer.isRunning}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-50
                ${selectedPreset === p
                  ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                  : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'}`}
            >
              {p === 'custom' ? 'Custom' : `${p} min`}
            </button>
          ))}
          {selectedPreset === 'custom' && (
            <input
              type="number"
              min={1}
              max={180}
              value={customMinutes}
              onChange={e => setCustomMinutes(parseInt(e.target.value) || 25)}
              disabled={timer.isRunning}
              className="w-20 px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50"
            />
          )}
        </div>

        {/* Ring */}
        <TimerRing
          timeRemaining={timer.timeRemaining}
          progress={timer.progress}
          phase={timer.phase}
          size={260}
        />

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!timer.isRunning && !timer.isPaused ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-3 bg-accent-cyan text-dark-bg rounded-2xl font-semibold hover:bg-accent-cyan/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Focus
            </button>
          ) : (
            <>
              <button
                onClick={timer.isPaused ? timer.resume : timer.pause}
                className="flex items-center gap-2 px-6 py-3 bg-accent-cyan text-dark-bg rounded-2xl font-semibold hover:bg-accent-cyan/90 transition-colors"
              >
                {timer.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {timer.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={timer.reset}
                className="p-3 rounded-2xl border border-dark-border hover:bg-dark-hover transition-colors"
              >
                <Square className="w-5 h-5 text-dark-text-secondary" />
              </button>
              <button
                onClick={timer.skip}
                className="p-3 rounded-2xl border border-dark-border hover:bg-dark-hover transition-colors"
              >
                <SkipForward className="w-5 h-5 text-dark-text-secondary" />
              </button>
            </>
          )}
        </div>

        {/* Ambient sound */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-sm text-dark-text-muted">🎵 Ambient:</span>
          {AMBIENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAmbientSound(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${ambientSound === opt.value
                  ? 'border-accent-amber bg-accent-amber/10 text-accent-amber'
                  : 'border-dark-border text-dark-text-muted hover:border-dark-text-muted'}`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
          {ambientSound !== 'none' && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={ambientVolume}
              onChange={e => setAmbientVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-dark-border rounded-full appearance-none cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Today's stats */}
      <div className="mt-10 space-y-4">
        <div className="p-4 bg-dark-surface border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark-text-primary">Today's Focus</span>
              <span className="text-sm font-bold text-accent-amber">{totalFocusMinutes}m</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-accent-amber">
              <Flame className="w-4 h-4" />
              <span>{stats.streak_days || 0} day streak</span>
            </div>
          </div>
          <div className="h-2 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-amber rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-dark-text-muted mt-1.5">
            {totalFocusMinutes}m / {dailyGoal}m daily goal · {stats.completed_sessions || 0} sessions
          </p>
        </div>

        {/* Session log */}
        {sessions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-dark-text-secondary px-1">Sessions</p>
            {sessions.slice(0, 8).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl">
                {s.completed
                  ? <CheckCircle2 className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-dark-text-muted flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-text-primary">
                    {Math.round(s.actual_time / 60)}min
                    {s.note && <span className="text-dark-text-muted"> · {s.note}</span>}
                  </p>
                </div>
                <span className="text-xs text-dark-text-muted flex-shrink-0">
                  {format(new Date(s.started_at), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
