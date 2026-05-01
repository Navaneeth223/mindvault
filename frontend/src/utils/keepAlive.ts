/**
 * Keep-Alive Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Pings the Render backend every 10 minutes to prevent cold starts.
 * Also warms up the server on app load.
 */
const PING_INTERVAL = 10 * 60 * 1000 // 10 minutes
const API_URL = import.meta.env.VITE_API_URL || ''

let pingInterval: ReturnType<typeof setInterval> | null = null

export function startKeepAlive() {
  if (pingInterval) return

  const ping = () => {
    fetch(`${API_URL}/api/health/`, { method: 'GET' }).catch(() => {})
  }

  // Ping immediately on start
  ping()

  pingInterval = setInterval(ping, PING_INTERVAL)
}

export function stopKeepAlive() {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
}
