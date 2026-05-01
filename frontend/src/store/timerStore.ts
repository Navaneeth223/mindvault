/**
 * Timer Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Persisted settings for the focus timer.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimerPresets {
  focus: number       // minutes
  shortBreak: number
  longBreak: number
}

interface TimerState {
  presets: TimerPresets
  autoStartBreaks: boolean
  autoStartFocus: boolean
  longBreakAfter: number   // sessions before long break
  dailyGoal: number        // minutes per day
  ambientSound: string     // 'none' | 'rain' | 'cafe' | card_id
  ambientVolume: number    // 0-1
  notificationsEnabled: boolean

  // Actions
  setPresets: (presets: Partial<TimerPresets>) => void
  setAutoStartBreaks: (v: boolean) => void
  setAutoStartFocus: (v: boolean) => void
  setLongBreakAfter: (n: number) => void
  setDailyGoal: (minutes: number) => void
  setAmbientSound: (sound: string) => void
  setAmbientVolume: (v: number) => void
  setNotificationsEnabled: (v: boolean) => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      presets: { focus: 25, shortBreak: 5, longBreak: 15 },
      autoStartBreaks: true,
      autoStartFocus: false,
      longBreakAfter: 4,
      dailyGoal: 480,  // 8 hours
      ambientSound: 'none',
      ambientVolume: 0.4,
      notificationsEnabled: true,

      setPresets: (p) => set(s => ({ presets: { ...s.presets, ...p } })),
      setAutoStartBreaks: (v) => set({ autoStartBreaks: v }),
      setAutoStartFocus: (v) => set({ autoStartFocus: v }),
      setLongBreakAfter: (n) => set({ longBreakAfter: n }),
      setDailyGoal: (m) => set({ dailyGoal: m }),
      setAmbientSound: (s) => set({ ambientSound: s }),
      setAmbientVolume: (v) => set({ ambientVolume: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
    }),
    { name: 'timer-storage' }
  )
)
