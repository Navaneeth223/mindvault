/**
 * TopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed: hamburger button for mobile sidebar, user dropdown.
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface TopBarProps {
  onMenuClick?: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { openSearch, openCapture } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : (user?.username?.[0] || 'U').toUpperCase()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-dark-border bg-dark-surface/80 backdrop-blur-xl flex-shrink-0"
    >
      <div className="flex items-center justify-between h-14 px-3 md:px-6 gap-3">
        {/* Left: Hamburger (mobile) + Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-dark-hover transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className="block h-0.5 w-5 bg-dark-text-secondary rounded-full" />
              <span className="block h-0.5 w-3.5 bg-dark-text-secondary rounded-full" />
              <span className="block h-0.5 w-5 bg-dark-text-secondary rounded-full" />
            </div>
          </button>

          {/* Search bar */}
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl hover:border-accent-cyan/30 transition-all duration-200 group flex-1 max-w-md min-w-0"
          >
            <Search className="w-4 h-4 text-dark-text-muted group-hover:text-accent-cyan transition-colors flex-shrink-0" />
            <span className="text-sm text-dark-text-muted truncate">Search...</span>
            <kbd className="ml-auto hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono text-dark-text-muted bg-dark-surface border border-dark-border rounded flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Add + User */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Add button */}
          <Button
            onClick={openCapture}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:flex shadow-glow"
          >
            Add
          </Button>
          <button
            onClick={openCapture}
            className="sm:hidden p-2.5 rounded-xl bg-accent-cyan text-dark-bg hover:bg-accent-cyan/90 transition-colors"
            aria-label="Add card"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-dark-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-indigo flex items-center justify-center text-sm font-bold text-dark-bg flex-shrink-0">
                {initials}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-dark-text-muted transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-dark-border">
                    <p className="text-sm font-semibold text-dark-text-primary truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                    </p>
                    <p className="text-xs text-dark-text-muted truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings') }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-dark-text-muted" />
                      <span className="text-sm text-dark-text-primary">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent-red/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-accent-red" />
                      <span className="text-sm text-accent-red">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
