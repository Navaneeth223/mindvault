/**
 * TopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Top navigation with search, capture button, and user menu
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function TopBar() {
  const { toggleSidebar, openSearch, openCapture } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
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
    await logout()
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
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-dark-hover transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-dark-text-secondary" />
          </button>

          {/* Search bar */}
          <button
            onClick={openSearch}
            className="flex items-center gap-3 px-4 py-2 bg-dark-elevated border border-dark-border rounded-2xl hover:border-accent-cyan/30 transition-all duration-200 group flex-1 max-w-md"
          >
            <Search className="w-4 h-4 text-dark-text-muted group-hover:text-accent-cyan transition-colors flex-shrink-0" />
            <span className="text-sm text-dark-text-muted truncate">Search your vault...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono text-dark-text-muted bg-dark-surface border border-dark-border rounded-md flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Add + User */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {/* Quick Capture */}
          <Button
            onClick={openCapture}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-glow hidden sm:flex"
          >
            Add
          </Button>
          <button
            onClick={openCapture}
            className="sm:hidden p-2.5 rounded-xl bg-accent-cyan text-dark-bg hover:bg-accent-cyan/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-hover transition-colors"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-indigo flex items-center justify-center text-sm font-bold text-dark-bg">
                  {initials}
                </div>
              )}
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
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-dark-border">
                    <p className="text-sm font-semibold text-dark-text-primary truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                    </p>
                    <p className="text-xs text-dark-text-muted truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
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
