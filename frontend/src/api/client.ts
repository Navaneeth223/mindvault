/**
 * Axios API Client — Mutex Token Refresh
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes the auth loop bug:
 * - Only ONE token refresh happens at a time (mutex)
 * - All other 401 requests queue and wait for the refresh
 * - 503 (Render cold start) retries 3x with 2s delay instead of logging out
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

// ── Mutex state ───────────────────────────────────────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// ── Client setup ──────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || ''

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// REQUEST: attach access token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE: handle 401 with mutex refresh + 503 retry
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig

    if (!originalRequest) return Promise.reject(error)

    // ── 503 / network error: Render is waking up — retry with backoff ─────────
    const status = error.response?.status
    if (!status || status === 503 || status === 502) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      if (originalRequest._retryCount <= 3) {
        const delay = originalRequest._retryCount * 2000 // 2s, 4s, 6s
        await new Promise(resolve => setTimeout(resolve, delay))
        return client(originalRequest)
      }
      return Promise.reject(error)
    }

    // ── Only handle 401 ───────────────────────────────────────────────────────
    if (status !== 401) return Promise.reject(error)

    // Don't retry if already retried
    if (originalRequest._retry) return Promise.reject(error)

    // Don't try to refresh if this IS the refresh request
    if (originalRequest.url?.includes('/auth/token/refresh/')) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // ── If already refreshing, queue this request ─────────────────────────────
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return client(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }

    // ── Perform the refresh (only once) ───────────────────────────────────────
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      // Use a fresh axios instance to avoid interceptor loop
      const response = await axios.post(
        `${API_URL}/api/auth/token/refresh/`,
        { refresh: refreshToken },
        { timeout: 15000 }
      )

      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)

      client.defaults.headers.common.Authorization = `Bearer ${access}`
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access}`
      }

      processQueue(null, access)
      return client(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  // Debounce redirect to avoid loop
  setTimeout(() => {
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }, 100)
}

export default client
