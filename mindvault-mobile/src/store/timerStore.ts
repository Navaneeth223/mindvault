/**
 * Timer Store — Mobile
 */
import { create } from 'zustand'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()
const STORAGE_KEY = 'timer-settings'

interface TimerSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakAfter: number
  dailyGoalMinutes: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  ambientSound: string
  ambientVolume: number
}

const DEFAULTS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakAfter: 4,
  dailyGoalMinutes: 480,
  autoStartBreaks: true,
  autoStartFocus: false,
  ambientSound: 'none',
  ambientVolume: 0.4,
}

function load(): TimerSettings {
  const stored = storage.getString(STORAGE_KEY)
  return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
}

interface TimerState extends TimerSettings {
  update: (updates: Partial<TimerSettings>) => void
}

export const useTimerStore = create<TimerState>((set) => ({
  ...load(),
  update: (updates) => {
    set((s) => {
      const next = { ...s, ...updates }
      storage.set(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  },
}))
