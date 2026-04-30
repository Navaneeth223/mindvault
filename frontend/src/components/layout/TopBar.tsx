/**
 * TopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Top navigation with search, capture button, and user menu
 */
import { motion } from 'framer-motion'
import { Search, Plus, Menu, User } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Button from '../ui/Button'

export default function TopBar() {
  const { toggleSidebar, openSearch, openCapture } = useUIStore()
  const { user } = useAuthStore()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-dark-border bg-dark-surface/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Menu Toggle - Mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-dark-hover transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            onClick={openSearch}
            className="flex items-center gap-3 px-4 py-2 bg-dark-elevated border border-dark-border rounded-2xl hover:border-accent-cyan/30 transition-all duration-200 group max-w-md w-full"
          >
            <Search className="w-4 h-4 text-dark-text-muted group-hover:text-accent-cyan transition-colors" />
            <span className="text-sm text-dark-text-muted">Search...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-dark-text-muted bg-dark-surface border border-dark-border rounded-lg">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right: Capture + Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Capture Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={openCapture}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-glow"
            >
              <span className="hidden sm:inline">Add</span>
            </Button>
          </motion.div>

          {/* User Menu */}
          <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-dark-hover transition-colors">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-indigo flex items-center justify-center">
                <User className="w-4 h-4 text-dark-bg" />
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  )
}
