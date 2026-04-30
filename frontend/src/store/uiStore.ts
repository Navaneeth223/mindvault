/**
 * UI Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages UI state: theme, view mode, sidebar, modals
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'
type ViewMode = 'grid' | 'list' | 'timeline'

interface UIState {
  theme: Theme
  viewMode: ViewMode
  sidebarOpen: boolean
  searchOpen: boolean
  captureOpen: boolean
  activeCardId: string | null
  
  // Actions
  setTheme: (theme: Theme) => void
  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  openSearch: () => void
  closeSearch: () => void
  openCapture: () => void
  closeCapture: () => void
  openCardDetail: (cardId: string) => void
  closeCardDetail: () => void
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

      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),

      openCapture: () => set({ captureOpen: true }),
      closeCapture: () => set({ captureOpen: false }),

      openCardDetail: (cardId) => set({ activeCardId: cardId }),
      closeCardDetail: () => set({ activeCardId: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

// Initialize theme on load
const storedTheme = localStorage.getItem('ui-storage')
if (storedTheme) {
  try {
    const { state } = JSON.parse(storedTheme)
    const theme = state.theme || 'dark'
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  } catch (e) {
    document.documentElement.classList.add('dark')
  }
} else {
  document.documentElement.classList.add('dark')
}
