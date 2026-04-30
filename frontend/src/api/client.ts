/**
 * Axios API Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Configured with:
 * - JWT authentication (auto-attach tokens)
 * - Token refresh on 401
 * - Request/response interceptors
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach access token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and refresh token
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If 401 and we haven't retried yet, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Request new access token
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access, refresh } = response.data

        // Store new tokens
        localStorage.setItem('access_token', access)
        if (refresh) {
          localStorage.setItem('refresh_token', refresh)
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }
        return client(originalRequest)
      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default client
