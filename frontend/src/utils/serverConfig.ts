/**
 * Server Config Utility — Web version
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages switching between local Docker server and cloud Render server.
 * Mirrors the mobile useServerConfig.ts logic.
 */

export type ServerMode = 'local' | 'cloud'

export interface ServerConfig {
  mode: ServerMode
  localUrl: string
  cloudUrl: string
  autoSwitch: boolean
  keepAlive: boolean
}

const STORAGE_KEY = 'mv-server-config'

const DEFAULT_CONFIG: ServerConfig = {
  mode: 'cloud',
  localUrl: 'http://localhost:8000',
  cloudUrl: import.meta.env.VITE_API_URL || 'https://mindvault-62ua.onrender.com',
  autoSwitch: false,
  keepAlive: false,
}

export function getServerConfig(): ServerConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveServerConfig(config: Partial<ServerConfig>): void {
  const current = getServerConfig()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...config }))
}

export function getActiveApiUrl(): string {
  const config = getServerConfig()
  return config.mode === 'local' ? config.localUrl : config.cloudUrl
}

export async function testServer(url: string): Promise<{ ok: boolean; ms: number; status?: string }> {
  const start = performance.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${url}/api/health/`, { signal: controller.signal })
    clearTimeout(timeout)
    const ms = Math.round(performance.now() - start)
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: true, ms, status: data.status }
    }
    return { ok: false, ms }
  } catch {
    return { ok: false, ms: Math.round(performance.now() - start) }
  }
}

export async function detectBestServer(): Promise<ServerMode> {
  const config = getServerConfig()
  if (!config.autoSwitch) return config.mode
  const result = await testServer(config.localUrl)
  return result.ok ? 'local' : 'cloud'
}
