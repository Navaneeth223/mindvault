/**
 * Server Config — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages switching between local Docker server and cloud Render server.
 * Uses MMKV for fast synchronous storage.
 */
import { MMKV } from 'react-native-mmkv'
import { useState, useEffect } from 'react'

const storage = new MMKV()

export type ServerMode = 'local' | 'cloud'

export interface ServerConfig {
  mode: ServerMode
  localUrl: string
  cloudUrl: string
  autoSwitch: boolean
}

const DEFAULT_CONFIG: ServerConfig = {
  mode: 'cloud',
  localUrl: 'http://192.168.1.10:8000',
  cloudUrl: 'https://mindvault-62ua.onrender.com',
  autoSwitch: true,
}

export function getServerConfig(): ServerConfig {
  const stored = storage.getString('serverConfig')
  return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG
}

export function saveServerConfig(config: Partial<ServerConfig>): void {
  const current = getServerConfig()
  storage.set('serverConfig', JSON.stringify({ ...current, ...config }))
}

export function getActiveApiUrl(): string {
  const config = getServerConfig()
  return config.mode === 'local' ? config.localUrl : config.cloudUrl
}

export async function testServer(url: string): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${url}/api/health/`, { signal: controller.signal })
    clearTimeout(timeout)
    return { ok: res.ok, ms: Date.now() - start }
  } catch {
    return { ok: false, ms: Date.now() - start }
  }
}

export async function detectBestServer(): Promise<ServerMode> {
  const config = getServerConfig()
  if (!config.autoSwitch) return config.mode
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 500)
    await fetch(`${config.localUrl}/api/health/`, { signal: controller.signal })
    clearTimeout(timeout)
    return 'local'
  } catch {
    return 'cloud'
  }
}

export function useServerConfig() {
  const [config, setConfig] = useState<ServerConfig>(getServerConfig)
  const [activeMode, setActiveMode] = useState<ServerMode>(config.mode)
  const [isDetecting, setIsDetecting] = useState(false)

  const autoDetect = async () => {
    setIsDetecting(true)
    const best = await detectBestServer()
    setActiveMode(best)
    setIsDetecting(false)
  }

  const updateConfig = (updates: Partial<ServerConfig>) => {
    const newConfig = { ...config, ...updates }
    saveServerConfig(newConfig)
    setConfig(newConfig)
    if (updates.mode) setActiveMode(updates.mode)
  }

  useEffect(() => {
    if (config.autoSwitch) autoDetect()
  }, [])

  return { config, activeMode, isDetecting, autoDetect, updateConfig }
}
