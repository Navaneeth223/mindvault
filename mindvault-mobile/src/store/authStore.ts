/**
 * Auth Store — Mobile
 */
import { create } from 'zustand'
import { MMKV } from 'react-native-mmkv'
import client from '@/api/client'

const storage = new MMKV()

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  card_count: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!storage.getString('access_token'),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const { data } = await client.post('/api/auth/login/', { username, password })
      storage.set('access_token', data.access)
      storage.set('refresh_token', data.refresh)
      set({ isAuthenticated: true })
      await get().fetchUser()
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    storage.delete('access_token')
    storage.delete('refresh_token')
    set({ user: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    try {
      const { data } = await client.get('/api/auth/me/')
      set({ user: data })
    } catch {
      // ignore
    }
  },
}))
