/**
 * Authentication Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed: isLoggingOut flag prevents double-logout loops.
 * Fixed: checkAuth doesn't clear tokens on first 401 (interceptor handles it).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import client from '../api/client'

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  avatar_url: string | null
  bio: string
  theme: 'dark' | 'light' | 'system'
  accent_colour: string
  default_view: 'grid' | 'list' | 'timeline'
  speech_language: 'en-US' | 'ml-IN'
  notifications_enabled: boolean
  card_count: number
  date_joined: string
  last_active_at: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoggingOut: boolean

  login: (username: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  fetchUser: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: false,
      isLoggingOut: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { data } = await client.post('/api/auth/login/', { username, password })
          localStorage.setItem('access_token', data.access)
          localStorage.setItem('refresh_token', data.refresh)
          set({ isAuthenticated: true, isLoading: false })
          await get().fetchUser()
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          await client.post('/api/auth/register/', data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Prevent double-logout
        if (get().isLoggingOut) return
        set({ isLoggingOut: true })

        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          client.post('/api/auth/logout/', { refresh: refreshToken }).catch(() => {})
        }

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          isAuthenticated: false,
          isLoggingOut: false,
        })
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')

        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const { data } = await client.get('/api/auth/me/')
          set({ user: data, isAuthenticated: true, isLoading: false })
        } catch {
          // Don't clear tokens here — the interceptor handles refresh.
          // Only mark as not loading.
          set({ isLoading: false })
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await client.get('/api/auth/me/')
          set({ user: data })
        } catch {
          // Ignore — interceptor will handle token refresh
        }
      },

      updateUser: async (data) => {
        const { data: updated } = await client.patch('/api/auth/me/', data)
        set({ user: updated })
        return updated
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
