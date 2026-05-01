/**
 * Player Store — Mobile
 * Uses expo-av for audio playback.
 */
import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist?: string
  album?: string
  coverUrl?: string
  audioUrl?: string
  duration?: number
}

interface PlayerState {
  queue: Track[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isShuffle: boolean
  repeatMode: 'off' | 'one' | 'all'

  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  addToQueue: (track: Track) => void
  clearQueue: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: 'off',

  play: (track, queue) => {
    const q = queue || [track]
    const idx = q.findIndex(t => t.id === track.id)
    set({ queue: q, currentIndex: idx >= 0 ? idx : 0, isPlaying: true, currentTime: 0 })
  },
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, currentIndex, isShuffle, repeatMode } = get()
    if (!queue.length) return
    if (repeatMode === 'one') { set({ currentTime: 0 }); return }
    let next = isShuffle ? Math.floor(Math.random() * queue.length) : currentIndex + 1
    if (next >= queue.length) {
      if (repeatMode === 'all') next = 0
      else { set({ isPlaying: false }); return }
    }
    set({ currentIndex: next, currentTime: 0, isPlaying: true })
  },

  prev: () => {
    const { queue, currentIndex, currentTime } = get()
    if (!queue.length) return
    if (currentTime > 3) { set({ currentTime: 0 }); return }
    const prev = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
    set({ currentIndex: prev, currentTime: 0, isPlaying: true })
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
  toggleRepeat: () => set(s => ({
    repeatMode: s.repeatMode === 'off' ? 'one' : s.repeatMode === 'one' ? 'all' : 'off'
  })),
  addToQueue: (track) => set(s => ({ queue: [...s.queue, track] })),
  clearQueue: () => set({ queue: [], currentIndex: 0, isPlaying: false }),
}))
