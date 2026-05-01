/**
 * API Client — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Axios instance with JWT auth and token refresh.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { MMKV } from 'react-native-mmkv'
import { getActiveApiUrl } from '@/utils/serverConfig'

const storage = new MMKV()

const client = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Dynamic base URL from server config
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getActiveApiUrl()
  const token = storage.getString('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = storage.getString('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        const res = await axios.post(`${getActiveApiUrl()}/api/auth/token/refresh/`, { refresh: refreshToken })
        const { access, refresh } = res.data
        storage.set('access_token', access)
        if (refresh) storage.set('refresh_token', refresh)
        if (original.headers) original.headers.Authorization = `Bearer ${access}`
        return client(original)
      } catch {
        storage.delete('access_token')
        storage.delete('refresh_token')
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default client
export { storage }
