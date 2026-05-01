/**
 * useTimer — Mobile Pomodoro timer
 * ─────────────────────────────────────────────────────────────────────────────
 * Accurate countdown using Date.now() drift correction.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { Vibration } from 'react-native'
import { useTimerStore } from '@/store/timerStore'

export type TimerPhase = 'focus' | 'short_break' | 'long_break'

interface UseTimerReturn {
  timeRemaining: number
  totalTime: number
  progress: number
  isRunning: boolean
  isPaused: boolean
  phase: TimerPhase
  sessionCount: number
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
}

export function useTimer(): UseTimerReturn {
  const {
    focusMinutes, shortBreakMinutes, longBreakMinutes,
    longBreakAfter, autoStartBreaks, autoStartFocus,
  } = useTimerStore()

  const [phase, setPhase] = useState<TimerPhase>('focus')
  const [sessionCount, setSessionCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(focusMinutes * 60)
  const [totalTime, setTotalTime] = useState(focusMinutes * 60)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const remainingRef = useRef(focusMinutes * 60)

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

  const handleComplete = useCallback((completedPhase: TimerPhase) => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)
    Vibration.vibrate([0, 300, 100, 300])

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
    remainingRef.current = nextSeconds

    const shouldAutoStart = nextPhase === 'focus' ? autoStartFocus : autoStartBreaks
    if (shouldAutoStart) {
      setTimeout(() => {
        startTimeRef.current = Date.now()
        setIsRunning(true)
        intervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000
          const remaining = Math.max(0, remainingRef.current - elapsed)
          setTimeRemaining(Math.ceil(remaining))
          if (remaining <= 0) handleComplete(nextPhase)
        }, 250)
      }, 1000)
    }
  }, [sessionCount, longBreakAfter, autoStartBreaks, autoStartFocus, getPhaseSeconds, clearTimer])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
    setIsPaused(false)

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, remainingRef.current - elapsed)
      setTimeRemaining(Math.ceil(remaining))
      if (remaining <= 0) handleComplete(phase)
    }, 250)
  }, [phase, handleComplete])

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return
    clearTimer()
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    remainingRef.current = Math.max(0, remainingRef.current - elapsed)
    setIsPaused(true)
    setIsRunning(false)
  }, [isRunning, isPaused, clearTimer])

  const resume = useCallback(() => {
    if (!isPaused) return
    startTimeRef.current = Date.now()
    setIsPaused(false)
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, remainingRef.current - elapsed)
      setTimeRemaining(Math.ceil(remaining))
      if (remaining <= 0) handleComplete(phase)
    }, 250)
  }, [isPaused, phase, handleComplete])

  const reset = useCallback(() => {
    clearTimer()
    const seconds = getPhaseSeconds(phase)
    setTimeRemaining(seconds)
    setTotalTime(seconds)
    remainingRef.current = seconds
    setIsRunning(false)
    setIsPaused(false)
  }, [clearTimer, phase, getPhaseSeconds])

  const skip = useCallback(() => {
    handleComplete(phase)
  }, [phase, handleComplete])

  useEffect(() => () => clearTimer(), [clearTimer])

  const progress = totalTime > 0 ? 1 - (timeRemaining / totalTime) : 0

  return {
    timeRemaining, totalTime, progress,
    isRunning, isPaused, phase, sessionCount,
    start, pause, resume, reset, skip,
  }
}
