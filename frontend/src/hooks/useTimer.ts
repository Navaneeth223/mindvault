/**
 * useTimer Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Pomodoro / focus timer with accurate countdown using performance.now().
 * Uses setInterval + drift correction so it stays accurate even when tab is hidden.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { timerApi } from '@/api/timer'

export type TimerPhase = 'focus' | 'short_break' | 'long_break'

interface UseTimerOptions {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakAfter: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  onPhaseComplete?: (phase: TimerPhase) => void
}

interface UseTimerReturn {
  timeRemaining: number
  totalTime: number
  progress: number
  isRunning: boolean
  isPaused: boolean
  phase: TimerPhase
  sessionCount: number
  start: (linkedCardId?: string) => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
}

export function useTimer(opts: UseTimerOptions): UseTimerReturn {
  const {
    focusMinutes, shortBreakMinutes, longBreakMinutes,
    longBreakAfter, autoStartBreaks, autoStartFocus, onPhaseComplete,
  } = opts

  const [phase, setPhase] = useState<TimerPhase>('focus')
  const [sessionCount, setSessionCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(focusMinutes * 60)
  const [totalTime, setTotalTime] = useState(focusMinutes * 60)

  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const remainingAtPauseRef = useRef<number>(focusMinutes * 60)
  const linkedCardRef = useRef<string | undefined>(undefined)
  const sessionStartRef = useRef<Date | null>(null)

  // Save session to backend
  const saveMutation = useMutation({
    mutationFn: timerApi.createSession,
  })

  const getPhaseSeconds = useCallback((p: TimerPhase) => {
    if (p === 'focus') return focusMinutes * 60
    if (p === 'short_break') return shortBreakMinutes * 60
    return longBreakMinutes * 60
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handlePhaseComplete = useCallback((completedPhase: TimerPhase) => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)

    // Save focus session
    if (completedPhase === 'focus' && sessionStartRef.current) {
      saveMutation.mutate({
        session_type: 'focus',
        duration: getPhaseSeconds('focus'),
        actual_time: getPhaseSeconds('focus'),
        completed: true,
        linked_card: linkedCardRef.current || null,
        started_at: sessionStartRef.current.toISOString(),
        ended_at: new Date().toISOString(),
      })
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        completedPhase === 'focus' ? '✅ Focus session complete!' : '⏰ Break over — back to work!',
        { body: completedPhase === 'focus' ? 'Time for a break.' : 'Start your next focus session.' }
      )
    }

    onPhaseComplete?.(completedPhase)

    // Determine next phase
    let nextPhase: TimerPhase
    let newCount = sessionCount
    if (completedPhase === 'focus') {
      newCount = sessionCount + 1
      setSessionCount(newCount)
      nextPhase = newCount % longBreakAfter === 0 ? 'long_break' : 'short_break'
    } else {
      nextPhase = 'focus'
    }

    const nextSeconds = getPhaseSeconds(nextPhase)
    setPhase(nextPhase)
    setTimeRemaining(nextSeconds)
    setTotalTime(nextSeconds)
    remainingAtPauseRef.current = nextSeconds

    // Auto-start next phase
    const shouldAutoStart = nextPhase === 'focus' ? autoStartFocus : autoStartBreaks
    if (shouldAutoStart) {
      setTimeout(() => startPhase(nextPhase), 500)
    }
  }, [sessionCount, longBreakAfter, autoStartBreaks, autoStartFocus, getPhaseSeconds, onPhaseComplete])

  const startPhase = useCallback((p: TimerPhase) => {
    clearTimer()
    startTimeRef.current = performance.now()
    sessionStartRef.current = new Date()
    setIsRunning(true)
    setIsPaused(false)

    intervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, remainingAtPauseRef.current - elapsed)
      setTimeRemaining(Math.ceil(remaining))

      if (remaining <= 0) {
        handlePhaseComplete(p)
      }
    }, 250) // 250ms for smooth display
  }, [clearTimer, handlePhaseComplete])

  const start = useCallback((linkedCardId?: string) => {
    linkedCardRef.current = linkedCardId
    remainingAtPauseRef.current = getPhaseSeconds(phase)
    startPhase(phase)
  }, [phase, getPhaseSeconds, startPhase])

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return
    clearTimer()
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    remainingAtPauseRef.current = Math.max(0, remainingAtPauseRef.current - elapsed)
    setIsPaused(true)
    setIsRunning(false)
  }, [isRunning, isPaused, clearTimer])

  const resume = useCallback(() => {
    if (!isPaused) return
    startTimeRef.current = performance.now()
    setIsPaused(false)
    setIsRunning(true)

    intervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, remainingAtPauseRef.current - elapsed)
      setTimeRemaining(Math.ceil(remaining))
      if (remaining <= 0) handlePhaseComplete(phase)
    }, 250)
  }, [isPaused, phase, handlePhaseComplete])

  const reset = useCallback(() => {
    clearTimer()
    const seconds = getPhaseSeconds(phase)
    setTimeRemaining(seconds)
    setTotalTime(seconds)
    remainingAtPauseRef.current = seconds
    setIsRunning(false)
    setIsPaused(false)
  }, [clearTimer, phase, getPhaseSeconds])

  const skip = useCallback(() => {
    handlePhaseComplete(phase)
  }, [phase, handlePhaseComplete])

  // Update total time when presets change
  useEffect(() => {
    if (!isRunning && !isPaused) {
      const seconds = getPhaseSeconds(phase)
      setTimeRemaining(seconds)
      setTotalTime(seconds)
      remainingAtPauseRef.current = seconds
    }
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, phase])

  // Cleanup
  useEffect(() => () => clearTimer(), [clearTimer])

  const progress = totalTime > 0 ? 1 - (timeRemaining / totalTime) : 0

  return {
    timeRemaining, totalTime, progress,
    isRunning, isPaused, phase, sessionCount,
    start, pause, resume, reset, skip,
  }
}
