/**
 * Timer Screen — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Focus timer / Pomodoro with SVG ring and session log.
 */
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Vibration,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { useTimerStore } from '@/store/timerStore'

type Phase = 'focus' | 'short_break' | 'long_break'

const PHASE_COLORS: Record<Phase, string> = {
  focus: '#00f5d4',
  short_break: '#f5a623',
  long_break: '#6366f1',
}

const PHASE_LABELS: Record<Phase, string> = {
  focus: 'FOCUS',
  short_break: 'SHORT BREAK',
  long_break: 'LONG BREAK',
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const SIZE = 240
const RADIUS = (SIZE - 24) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TimerScreen() {
  const insets = useSafeAreaInsets()
  const { focusMinutes, shortBreakMinutes, longBreakMinutes, longBreakAfter } = useTimerStore()

  const [phase, setPhase] = useState<Phase>('focus')
  const [timeRemaining, setTimeRemaining] = useState(focusMinutes * 60)
  const [totalTime, setTotalTime] = useState(focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const remainingRef = useRef(focusMinutes * 60)

  const progress = totalTime > 0 ? 1 - (timeRemaining / totalTime) : 0
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const color = PHASE_COLORS[phase]

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleComplete = () => {
    clearTimer()
    setIsRunning(false)
    Vibration.vibrate([0, 300, 100, 300])

    let nextPhase: Phase
    let newCount = sessionCount
    if (phase === 'focus') {
      newCount = sessionCount + 1
      setSessionCount(newCount)
      nextPhase = newCount % longBreakAfter === 0 ? 'long_break' : 'short_break'
    } else {
      nextPhase = 'focus'
    }

    const nextSeconds = nextPhase === 'focus' ? focusMinutes * 60
      : nextPhase === 'short_break' ? shortBreakMinutes * 60
      : longBreakMinutes * 60

    setPhase(nextPhase)
    setTimeRemaining(nextSeconds)
    setTotalTime(nextSeconds)
    remainingRef.current = nextSeconds
  }

  const start = () => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, remainingRef.current - elapsed)
      setTimeRemaining(Math.ceil(remaining))
      if (remaining <= 0) handleComplete()
    }, 250)
  }

  const pause = () => {
    clearTimer()
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    remainingRef.current = Math.max(0, remainingRef.current - elapsed)
    setIsRunning(false)
  }

  const reset = () => {
    clearTimer()
    const seconds = phase === 'focus' ? focusMinutes * 60
      : phase === 'short_break' ? shortBreakMinutes * 60
      : longBreakMinutes * 60
    setTimeRemaining(seconds)
    setTotalTime(seconds)
    remainingRef.current = seconds
    setIsRunning(false)
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.inner}
    >
      <Text style={styles.title}>Focus Timer</Text>

      {/* Phase selector */}
      <View style={styles.phaseRow}>
        {(['focus', 'short_break', 'long_break'] as Phase[]).map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => {
              if (isRunning) return
              setPhase(p)
              const s = p === 'focus' ? focusMinutes * 60
                : p === 'short_break' ? shortBreakMinutes * 60
                : longBreakMinutes * 60
              setTimeRemaining(s)
              setTotalTime(s)
              remainingRef.current = s
            }}
            style={[styles.phaseBtn, phase === p && { borderColor: PHASE_COLORS[p], backgroundColor: `${PHASE_COLORS[p]}18` }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.phaseBtnText, phase === p && { color: PHASE_COLORS[p] }]}>
              {PHASE_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SVG Ring */}
      <View style={styles.ringContainer}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke={color} strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.timeText, { color }]}>{formatTime(timeRemaining)}</Text>
          <Text style={[styles.phaseLabel, { color: `${color}99` }]}>{PHASE_LABELS[phase]}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={reset} style={styles.secondaryBtn} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isRunning ? pause : start}
          style={[styles.primaryBtn, { backgroundColor: color }]}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleComplete} style={styles.secondaryBtn} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>🔥 {sessionCount} sessions today</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0', alignSelf: 'flex-start', marginBottom: 20 },
  phaseRow: { flexDirection: 'row', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' },
  phaseBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  phaseBtnText: { fontSize: 11, fontWeight: '600', color: '#6b6b8a' },
  ringContainer: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  timeText: { fontSize: 48, fontWeight: '700', letterSpacing: -2 },
  phaseLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 2, marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  primaryBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, minWidth: 120, alignItems: 'center' },
  primaryBtnText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
    backgroundColor: '#1e1e35', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  secondaryBtnText: { color: '#6b6b8a', fontWeight: '600', fontSize: 14 },
  stats: { padding: 16, backgroundColor: '#1e1e35', borderRadius: 14, width: '100%', alignItems: 'center' },
  statsText: { color: '#f5a623', fontSize: 14, fontWeight: '600' },
})
