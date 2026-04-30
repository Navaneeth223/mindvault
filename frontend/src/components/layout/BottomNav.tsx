/**
 * Bottom Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Mobile bottom navigation bar
 */
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Star, Plus, Bell, Settings } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/favourites', icon: Star, label: 'Favourites' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const { openCapture } = useUIStore()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-dark-surface/95 backdrop-blur-xl safe-area-bottom"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive
                  ? 'text-accent-cyan'
                  : 'text-dark-text-muted hover:text-dark-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-glow')} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center Capture Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openCapture}
          className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-br from-accent-cyan to-accent-indigo rounded-2xl shadow-glow"
        >
          <Plus className="w-6 h-6 text-dark-bg" />
        </motion.button>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive
                  ? 'text-accent-cyan'
                  : 'text-dark-text-muted hover:text-dark-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-glow')} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  )
}
