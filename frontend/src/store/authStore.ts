/**
 * Authentication Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages user authentication state, tokens, and user profile.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, User } from '../api/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (username: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  setTokens: (access: string, refresh: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { access, refresh } = await authApi.login({ username, password })
          
          // Store tokens
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          
          set({
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
          })

          // Fetch user profile
          await get().fetchUser()
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          await authApi.register(data)
          set({ isLoading: false })
          // User must login separately after registration
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        
        try {
          if (refreshToken) {
            await authApi.logout(refreshToken)
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear tokens and state
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          set({ user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateUser: async (data) => {
        try {
          const updatedUser = await authApi.updateProfile(data)
          set({ user: updatedUser })
        } catch (error) {
          throw error
        }
      },

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        })
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
