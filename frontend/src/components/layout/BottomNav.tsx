/**
 * Bottom Navigation — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed: correct active states, safe area, 44px tap targets.
 */
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Star, Plus, Bell, Sparkles } from 'lucide-react'
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

const tabs = [
  { to: '/',           icon: Home,     label: 'Home',      end: true  },
  { to: '/favourites', icon: Star,     label: 'Saved',     end: false },
  { to: '/reminders',  icon: Bell,     label: 'Reminders', end: false },
  { to: '/aria',       icon: Sparkles, label: 'ARIA',      end: false, accent: true },
]

export default function BottomNav() {
  const { openCapture } = useUIStore()
  const location = useLocation()

  const { data: favData } = useQuery({
    queryKey: ['cards-favourites-count'],
    queryFn: () => cardsApi.list({ is_favourite: 'true', is_archived: false, page_size: 1 }),
    staleTime: 60_000,
  })

  const { data: reminderData } = useQuery({
    queryKey: ['cards-reminders-due'],
    queryFn: () => cardsApi.list({ has_reminder: true, is_archived: false, page_size: 1 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const favCount = favData?.count || 0
  const reminderCount = reminderData?.count || 0

  const badges: Record<string, number> = {
    '/favourites': favCount,
    '/reminders': reminderCount,
  }

  return (
    <div
      className="flex items-center justify-around bg-dark-surface/95 backdrop-blur-xl border-t border-dark-border px-2 pt-2"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      {tabs.slice(0, 2).map(tab => {
        const isActive = tab.end
          ? location.pathname === tab.to
          : location.pathname.startsWith(tab.to)
        const badgeCount = badges[tab.to] || 0

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[52px] min-h-[44px]',
              isActive ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'
            )}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              <AnimatePresence>
                {badgeCount > 0 && <Badge count={badgeCount} />}
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </NavLink>
        )
      })}

      {/* Center Capture Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={openCapture}
        className="flex items-center justify-center w-14 h-14 -mt-5 bg-gradient-to-br from-accent-cyan to-accent-indigo rounded-2xl shadow-glow"
        aria-label="Add card"
      >
        <Plus className="w-6 h-6 text-dark-bg" />
      </motion.button>

      {tabs.slice(2).map(tab => {
        const isActive = location.pathname.startsWith(tab.to)

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[52px] min-h-[44px]',
              isActive ? 'text-accent-cyan' : 'text-dark-text-muted hover:text-dark-text-primary'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}
