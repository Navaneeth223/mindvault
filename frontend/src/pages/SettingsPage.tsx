/**
 * Settings Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Profile, appearance, server configuration, and PWA install.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LogOut, Moon, Sun, Monitor, Check, Camera,
  Server, Wifi, WifiOff, Loader2, Copy, Download,
  Smartphone, Globe, RefreshCw, Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { usePWA } from '@/hooks/usePWA'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import {
  getServerConfig, saveServerConfig, testServer, detectBestServer,
  ServerConfig, ServerMode,
} from '@/utils/serverConfig'

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-accent-cyan' : 'bg-dark-border'}`}>
      <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-border bg-dark-elevated/50">
        <h2 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-dark-border">{children}</div>
    </section>
  )
}

function Row({ label, sublabel, right }: { label: string; sublabel?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm font-medium text-dark-text-primary">{label}</p>
        {sublabel && <p className="text-xs text-dark-text-muted mt-0.5">{sublabel}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{right}</div>
    </div>
  )
}

const ACCENTS = [
  { name: 'Cyan',    value: '#00f5d4' },
  { name: 'Indigo',  value: '#6366f1' },
  { name: 'Amber',   value: '#f5a623' },
  { name: 'Rose',    value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet',  value: '#8b5cf6' },
]

// ── Server Status Indicator ───────────────────────────────────────────────────
function ServerStatus({ url, label }: { url: string; label: string }) {
  const [status, setStatus] = useState<{ ok: boolean; ms: number } | null>(null)
  const [testing, setTesting] = useState(false)

  const test = useCallback(async () => {
    setTesting(true)
    const result = await testServer(url)
    setStatus(result)
    setTesting(false)
  }, [url])

  return (
    <div className="flex items-center gap-2">
      {testing ? (
        <Loader2 className="w-3.5 h-3.5 text-dark-text-muted animate-spin" />
      ) : status ? (
        status.ok ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-cyan" />
            <span className="text-xs text-accent-cyan">{status.ms}ms</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red" />
            <span className="text-xs text-accent-red">Offline</span>
          </div>
        )
      ) : null}
      <button onClick={test}
        className="text-xs text-accent-cyan hover:underline">
        {testing ? 'Testing...' : 'Test'}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout, updateUser } = useAuthStore()
  const { theme, setTheme, accentColour, setAccentColour } = useUIStore()
  const { canInstall, isInstalled, install, needRefresh, update } = usePWA()

  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName]   = useState(user?.last_name  || '')
  const [bio, setBio]             = useState(user?.bio        || '')
  const [editingProfile, setEditingProfile] = useState(false)
  const [notifications, setNotifications]   = useState(user?.notifications_enabled ?? true)

  // Server config state
  const [serverConfig, setServerConfigState] = useState<ServerConfig>(getServerConfig)
  const [detecting, setDetecting] = useState(false)
  const [keepAliveInterval, setKeepAliveInterval] = useState<number | null>(null)

  const updateServerConfig = (updates: Partial<ServerConfig>) => {
    const newConfig = { ...serverConfig, ...updates }
    setServerConfigState(newConfig)
    saveServerConfig(newConfig)
  }

  // Keep-alive ping
  useEffect(() => {
    if (serverConfig.keepAlive) {
      const id = window.setInterval(() => {
        fetch(`${serverConfig.cloudUrl}/api/health/`).catch(() => {})
      }, 14 * 60 * 1000) // every 14 minutes
      setKeepAliveInterval(id)
      return () => clearInterval(id)
    } else {
      if (keepAliveInterval) clearInterval(keepAliveInterval)
    }
  }, [serverConfig.keepAlive, serverConfig.cloudUrl])

  const handleAutoDetect = async () => {
    setDetecting(true)
    const best = await detectBestServer()
    updateServerConfig({ mode: best })
    setDetecting(false)
    toast.success(`Using ${best === 'local' ? 'local PC' : 'cloud'} server`)
  }

  // Profile update
  const profileMutation = useMutation({
    mutationFn: () => updateUser({ first_name: firstName, last_name: lastName, bio }),
    onSuccess: () => { toast.success('Profile updated'); setEditingProfile(false) },
    onError: () => toast.error('Failed to update profile'),
  })

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate('/login')
    toast.success('Signed out')
  }

  // PWA platform detection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin)
    toast.success('Link copied!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-serif font-bold mb-1">Settings</h1>
        <p className="text-dark-text-muted">Manage your account and preferences</p>
      </motion.div>

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="Profile">
          <div className="px-5 py-5 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-indigo flex items-center justify-center text-2xl font-bold text-dark-bg">
                {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark-elevated border border-dark-border rounded-full flex items-center justify-center hover:bg-dark-hover transition-colors">
                <Camera className="w-3 h-3 text-dark-text-muted" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-dark-text-primary">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </p>
              <p className="text-sm text-dark-text-muted">{user?.email}</p>
              <p className="text-xs text-dark-text-muted mt-0.5">@{user?.username}</p>
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)}
              className="ml-auto text-sm text-accent-cyan hover:underline">
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingProfile && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="px-5 pb-5 space-y-3 border-t border-dark-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-text-muted mb-1">First name</label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <label className="block text-xs text-dark-text-muted mb-1">Last name</label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-dark-text-muted mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio..." rows={2}
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none text-sm" />
              </div>
              <Button variant="primary" size="sm" onClick={() => profileMutation.mutate()} isLoading={profileMutation.isPending}>
                Save changes
              </Button>
            </motion.div>
          )}
        </Section>
      </motion.div>

      {/* ── Appearance ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Appearance">
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-dark-text-primary mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'dark',   icon: Moon,    label: 'Dark'   },
                { value: 'light',  icon: Sun,     label: 'Light'  },
                { value: 'system', icon: Monitor, label: 'System' },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button key={value} onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all
                    ${theme === value ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 border-t border-dark-border">
            <p className="text-sm font-medium text-dark-text-primary mb-3">Accent colour</p>
            <div className="flex gap-3 flex-wrap">
              {ACCENTS.map(a => (
                <button key={a.value} onClick={() => setAccentColour(a.value)} title={a.name}
                  className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: a.value }}>
                  {accentColour === a.value && <Check className="absolute inset-0 m-auto w-4 h-4 text-dark-bg" />}
                </button>
              ))}
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Server Configuration ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Server Configuration">
          {/* Active mode */}
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-dark-text-primary mb-3">Active Connection</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(['local', 'cloud'] as ServerMode[]).map(mode => (
                <button key={mode} onClick={() => updateServerConfig({ mode })}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                    ${serverConfig.mode === mode ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'}`}>
                  {mode === 'local' ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  <span className="text-sm font-medium">{mode === 'local' ? '● Local PC' : '☁ Cloud'}</span>
                </button>
              ))}
            </div>
            <button onClick={handleAutoDetect} disabled={detecting}
              className="flex items-center gap-2 px-4 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-secondary hover:border-accent-cyan/30 transition-all disabled:opacity-50">
              {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Auto-detect fastest server
            </button>
          </div>

          {/* Local server */}
          <div className="px-5 py-4 border-t border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-dark-text-primary">Local Server (Docker)</p>
              <ServerStatus url={serverConfig.localUrl} label="local" />
            </div>
            <Input
              value={serverConfig.localUrl}
              onChange={e => updateServerConfig({ localUrl: e.target.value })}
              placeholder="http://192.168.1.10:8000"
            />
            <p className="text-xs text-dark-text-muted mt-2">
              💡 Run <code className="bg-dark-elevated px-1 rounded">make start</code> on your PC, then enter your PC's IP.
              Your PC and this device must be on the same WiFi.
            </p>
          </div>

          {/* Cloud server */}
          <div className="px-5 py-4 border-t border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-dark-text-primary">Cloud Server (Render)</p>
              <ServerStatus url={serverConfig.cloudUrl} label="cloud" />
            </div>
            <Input
              value={serverConfig.cloudUrl}
              onChange={e => updateServerConfig({ cloudUrl: e.target.value })}
              placeholder="https://mindvault-62ua.onrender.com"
            />
            <p className="text-xs text-dark-text-muted mt-2">
              ⚠️ Free tier may take 30–60s to wake up after inactivity.
            </p>
          </div>

          {/* Auto-switch + Keep alive */}
          <Row label="Auto-switch" sublabel="Use local when available, fall back to cloud"
            right={<Toggle checked={serverConfig.autoSwitch} onChange={v => updateServerConfig({ autoSwitch: v })} />} />
          <Row label="Keep cloud alive" sublabel="Ping Render every 14 min to prevent sleep (uses your device)"
            right={<Toggle checked={serverConfig.keepAlive} onChange={v => updateServerConfig({ keepAlive: v })} />} />
        </Section>
      </motion.div>

      {/* ── Install App ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Install App">
          {isStandalone || isInstalled ? (
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-accent-cyan" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-text-primary">MindVault is installed</p>
                <p className="text-xs text-dark-text-muted">Running as a native app on this device</p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm font-medium text-dark-text-primary">Install on iPhone / iPad</p>
              <div className="space-y-2">
                {[
                  { icon: '🧭', text: 'Open this page in Safari (not Chrome)' },
                  { icon: '📤', text: 'Tap the Share button (box with arrow)' },
                  { icon: '➕', text: 'Tap "Add to Home Screen"' },
                  { icon: '✅', text: 'Tap "Add" — done!' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-dark-text-secondary">
                    <span className="text-lg">{step.icon}</span>
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : canInstall ? (
            <div className="px-5 py-4">
              <Button variant="primary" onClick={install} leftIcon={<Download className="w-4 h-4" />} className="w-full">
                Install MindVault
              </Button>
              <p className="text-xs text-dark-text-muted mt-2 text-center">
                Installs as a native app — works offline, faster loading
              </p>
            </div>
          ) : (
            <div className="px-5 py-4">
              <p className="text-sm text-dark-text-secondary mb-2">
                {isAndroid
                  ? 'Open Chrome menu → "Add to Home Screen" or "Install app"'
                  : 'Open Chrome menu → "Install MindVault"'}
              </p>
            </div>
          )}

          {/* Share link */}
          <div className="px-5 py-4 border-t border-dark-border">
            <p className="text-sm font-medium text-dark-text-primary mb-2">Share install link</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-muted truncate">
                {window.location.origin}
              </div>
              <button onClick={handleCopyLink}
                className="px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl hover:border-accent-cyan/30 transition-colors">
                <Copy className="w-4 h-4 text-dark-text-muted" />
              </button>
            </div>
            <p className="text-xs text-dark-text-muted mt-1.5">Anyone with this link can use your MindVault (requires login)</p>
          </div>

          {/* Update available */}
          {needRefresh && (
            <div className="px-5 py-4 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-cyan">Update available</p>
                  <p className="text-xs text-dark-text-muted">A new version of MindVault is ready</p>
                </div>
                <Button variant="primary" size="sm" onClick={update}>Update now</Button>
              </div>
            </div>
          )}
        </Section>
      </motion.div>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Section title="Notifications">
          <Row label="Reminder notifications" sublabel="Get notified when a reminder is due"
            right={<Toggle checked={notifications} onChange={setNotifications} />} />
        </Section>
      </motion.div>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Section title="Account">
          <Row label="Username" sublabel={`@${user?.username}`} right={<span className="text-xs text-dark-text-muted">Cannot change</span>} />
          <Row label="Member since"
            sublabel={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
            right={null} />
          <Row label="Total cards" sublabel="Cards in your vault"
            right={<span className="text-sm font-semibold text-accent-cyan">{user?.card_count ?? 0}</span>} />
        </Section>
      </motion.div>

      {/* ── Session ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Section title="Session">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-accent-red hover:bg-accent-red/5 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </Section>
      </motion.div>

      <p className="text-center text-xs text-dark-text-muted pb-4">
        MindVault v1.0.0 · Built with ❤️ in Kerala
      </p>
    </div>
  )
}
