/**
 * Bottom Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Mobile bottom navigation with live badge counts
 */
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Star, Plus, Bell, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useUIStore } from '@/store/uiStore'
import { cardsApi } from '@/api/cards'
import { cn } from '@/utils/cn'

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-accent-red text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}

function DotBadge() {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-red rounded-full border-2 border-dark-surface"
    />
  )
}

export default function BottomNav() {
  const { openCapture } = useUIStore()

  // Live favourite count
  const { data: favData } = useQuery({
    queryKey: ['cards-favourites-count'],
    queryFn: () => cardsApi.list({ is_favourite: 'true', is_archived: false, page_size: 1 }),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  // Live reminder count (any pending reminders)
  const { data: reminderData } = useQuery({
    queryKey: ['cards-reminders-due'],
    queryFn: () => cardsApi.list({
      has_reminder: true,
      is_archived: false,
      page_size: 1,
    }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const favCount = favData?.count || 0
  const reminderCount = reminderData?.count || 0

  const navItems = [
    { to: '/', icon: Home, label: 'Home', badge: null, end: true },
    { to: '/favourites', icon: Star, label: 'Favourites', badge: favCount, end: false },
    { to: '/reminders', icon: Bell, label: 'Reminders', badge: reminderCount, end: false },
    { to: '/settings', icon: Settings, label: 'Settings', badge: null, end: false },
  ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-dark-surface/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]')} />
                  <AnimatePresence>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge count={item.badge as number} />
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center Capture Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={openCapture}
          className="flex items-center justify-center w-14 h-14 -mt-5 bg-gradient-to-br from-accent-cyan to-accent-indigo rounded-2xl shadow-glow"
        >
          <Plus className="w-6 h-6 text-dark-bg" />
        </motion.button>

        {navItems.slice(2).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]')} />
                  <AnimatePresence>
                    {item.badge !== null && item.badge > 0 && (
                      <DotBadge />
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  )
}
