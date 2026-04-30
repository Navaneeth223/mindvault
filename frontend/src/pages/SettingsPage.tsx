/**
 * Settings Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Profile, appearance, and account settings.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, Palette, Bell, Shield, LogOut, ChevronRight,
  Moon, Sun, Monitor, Check, Camera,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-accent-cyan' : 'bg-dark-border'}`}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
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

// ── Row ───────────────────────────────────────────────────────────────────────
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

// ── Accent colours ────────────────────────────────────────────────────────────
const ACCENTS = [
  { name: 'Cyan',   value: '#00f5d4' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber',  value: '#f5a623' },
  { name: 'Rose',   value: '#f43f5e' },
  { name: 'Emerald',value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout, updateUser } = useAuthStore()
  const { theme, setTheme } = useUIStore()

  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName]   = useState(user?.last_name  || '')
  const [bio, setBio]             = useState(user?.bio        || '')
  const [editingProfile, setEditingProfile] = useState(false)
  const [notifications, setNotifications]   = useState(user?.notifications_enabled ?? true)
  const [accent, setAccent] = useState(user?.accent_colour || '#00f5d4')

  // ── Profile update ────────────────────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: () => updateUser({ first_name: firstName, last_name: lastName, bio }),
    onSuccess: () => {
      toast.success('Profile updated')
      setEditingProfile(false)
    },
    onError: () => toast.error('Failed to update profile'),
  })

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate('/login')
    toast.success('Signed out')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-serif font-bold mb-1">Settings</h1>
        <p className="text-dark-text-muted">Manage your account and preferences</p>
      </motion.div>

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="Profile">
          {/* Avatar + name */}
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
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="ml-auto text-sm text-accent-cyan hover:underline"
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Edit form */}
          {editingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-5 pb-5 space-y-3 border-t border-dark-border pt-4"
            >
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
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="A short bio..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none text-sm"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => profileMutation.mutate()}
                isLoading={profileMutation.isPending}
              >
                Save changes
              </Button>
            </motion.div>
          )}
        </Section>
      </motion.div>

      {/* ── Appearance ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Appearance">
          {/* Theme */}
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-dark-text-primary mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'dark',   icon: Moon,    label: 'Dark'   },
                { value: 'light',  icon: Sun,     label: 'Light'  },
                { value: 'system', icon: Monitor, label: 'System' },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all
                    ${theme === value
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                      : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent colour */}
          <div className="px-5 py-4 border-t border-dark-border">
            <p className="text-sm font-medium text-dark-text-primary mb-3">Accent colour</p>
            <div className="flex gap-3 flex-wrap">
              {ACCENTS.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAccent(a.value)}
                  title={a.name}
                  className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: a.value }}
                >
                  {accent === a.value && (
                    <Check className="absolute inset-0 m-auto w-4 h-4 text-dark-bg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Notifications ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Notifications">
          <Row
            label="Reminder notifications"
            sublabel="Get notified when a reminder is due"
            right={<Toggle checked={notifications} onChange={setNotifications} />}
          />
        </Section>
      </motion.div>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Account">
          <Row
            label="Username"
            sublabel={`@${user?.username}`}
            right={<span className="text-xs text-dark-text-muted">Cannot change</span>}
          />
          <Row
            label="Member since"
            sublabel={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
            right={null}
          />
          <Row
            label="Total cards"
            sublabel="Cards in your vault"
            right={<span className="text-sm font-semibold text-accent-cyan">{user?.card_count ?? 0}</span>}
          />
        </Section>
      </motion.div>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Section title="Session">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-accent-red hover:bg-accent-red/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </Section>
      </motion.div>

      {/* Version */}
      <p className="text-center text-xs text-dark-text-muted pb-4">
        MindVault v1.0.0 · Built with ❤️
      </p>
    </div>
  )
}
