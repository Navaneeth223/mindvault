/**
 * Authentication API
 */
import client from './client'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

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

export interface TokenResponse {
  access: string
  refresh: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await client.post('/api/auth/login/', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<{ user: User; message: string }> => {
    const response = await client.post('/api/auth/register/', data)
    return response.data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await client.post('/api/auth/logout/', { refresh: refreshToken })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/api/auth/me/')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await client.patch('/api/auth/me/', data)
    return response.data
  },

  changePassword: async (data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }): Promise<{ message: string }> => {
    const response = await client.post('/api/auth/change-password/', data)
    return response.data
  },
}
