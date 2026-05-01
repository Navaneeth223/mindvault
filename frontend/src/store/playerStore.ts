/**
 * Music Player Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Global state for the music player. Audio engine lives in GlobalMusicPlayer.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card } from '@/api/cards'

export type RepeatMode = 'off' | 'one' | 'all'

interface PlayerState {
  queue: Card[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isShuffle: boolean
  repeatMode: RepeatMode
  isExpanded: boolean

  // Actions
  play: (card: Card, queue?: Card[]) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleExpanded: () => void
  addToQueue: (card: Card) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isShuffle: false,
      repeatMode: 'off',
      isExpanded: false,

      play: (card, queue) => {
        const newQueue = queue || [card]
        const idx = newQueue.findIndex(c => c.id === card.id)
        set({ queue: newQueue, currentIndex: idx >= 0 ? idx : 0, isPlaying: true, currentTime: 0 })
      },

      pause: () => set({ isPlaying: false }),
      resume: () => set({ isPlaying: true }),
      stop: () => set({ isPlaying: false, currentTime: 0 }),

      next: () => {
        const { queue, currentIndex, isShuffle, repeatMode } = get()
        if (queue.length === 0) return
        if (repeatMode === 'one') {
          set({ currentTime: 0, isPlaying: true })
          return
        }
        let nextIdx: number
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * queue.length)
        } else {
          nextIdx = currentIndex + 1
          if (nextIdx >= queue.length) {
            if (repeatMode === 'all') nextIdx = 0
            else { set({ isPlaying: false }); return }
          }
        }
        set({ currentIndex: nextIdx, currentTime: 0, isPlaying: true })
      },

      prev: () => {
        const { queue, currentIndex, currentTime } = get()
        if (queue.length === 0) return
        // If > 3s in, restart current track
        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }
        const prevIdx = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
        set({ currentIndex: prevIdx, currentTime: 0, isPlaying: true })
      },

      seek: (seconds) => set({ currentTime: seconds }),
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
      toggleRepeat: () => set(s => ({
        repeatMode: s.repeatMode === 'off' ? 'one' : s.repeatMode === 'one' ? 'all' : 'off'
      })),
      toggleExpanded: () => set(s => ({ isExpanded: !s.isExpanded })),

      addToQueue: (card) => set(s => ({ queue: [...s.queue, card] })),
      removeFromQueue: (index) => set(s => ({
        queue: s.queue.filter((_, i) => i !== index),
        currentIndex: index < s.currentIndex ? s.currentIndex - 1 : s.currentIndex,
      })),
      clearQueue: () => set({ queue: [], currentIndex: 0, isPlaying: false }),
    }),
    {
      name: 'player-storage',
      partialize: (s) => ({ volume: s.volume, isShuffle: s.isShuffle, repeatMode: s.repeatMode }),
    }
  )
)

// Selector: current track
export const useCurrentTrack = () => {
  const { queue, currentIndex } = usePlayerStore()
  return queue[currentIndex] ?? null
}
