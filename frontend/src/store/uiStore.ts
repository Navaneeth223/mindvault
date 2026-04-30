/**
 * UI Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages UI state: theme, view mode, sidebar, modals
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type ViewMode = 'grid' | 'list' | 'timeline'

interface UIState {
  theme: Theme
  viewMode: ViewMode
  sidebarOpen: boolean
  searchOpen: boolean
  captureOpen: boolean
  activeCardId: string | null
  accentColour: string

  // Actions
  setTheme: (theme: Theme) => void
  setViewMode: (mode: ViewMode) => void
  setAccentColour: (colour: string) => void
  toggleSidebar: () => void
  openSearch: () => void
  closeSearch: () => void
  openCapture: () => void
  closeCapture: () => void
  openCardDetail: (cardId: string) => void
  closeCardDetail: () => void
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.classList.toggle('light', !isDark)
}

function applyAccent(colour: string) {
  document.documentElement.style.setProperty('--accent-cyan', colour)
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      viewMode: 'grid',
      sidebarOpen: true,
      searchOpen: false,
      captureOpen: false,
      activeCardId: null,
      accentColour: '#00f5d4',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      setAccentColour: (colour) => {
        set({ accentColour: colour })
        applyAccent(colour)
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),

      // Never open capture while a card detail is open (prevents z-index fights)
      openCapture: () => set({ captureOpen: true, activeCardId: null }),
      closeCapture: () => set({ captureOpen: false }),

      openCardDetail: (cardId) => set({ activeCardId: cardId, captureOpen: false }),
      closeCardDetail: () => set({ activeCardId: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
        accentColour: state.accentColour,
      }),
    }
  )
)

// ── Apply persisted theme + accent on page load ───────────────────────────────
;(function initUI() {
  try {
    const raw = localStorage.getItem('ui-storage')
    if (raw) {
      const { state } = JSON.parse(raw)
      applyTheme(state.theme || 'dark')
      if (state.accentColour) applyAccent(state.accentColour)
    } else {
      applyTheme('dark')
    }
  } catch {
    applyTheme('dark')
  }
})()
