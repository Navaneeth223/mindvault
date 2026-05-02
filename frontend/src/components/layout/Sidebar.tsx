/**
 * Sidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Navigation sidebar with collections
 */
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Home, Star, Archive, Bell, Settings, Plus, Music2, Timer, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { collectionsApi } from '@/api/collections'
import { cn } from '@/utils/cn'
import CreateCollectionModal from '@/components/collections/CreateCollectionModal'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/favourites', icon: Star, label: 'Favourites' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/aria', icon: Sparkles, label: 'ARIA', accent: true },
  { to: '/music', icon: Music2, label: 'Music' },
  { to: '/timer', icon: Timer, label: 'Focus Timer' },
  { to: '/archive', icon: Archive, label: 'Archive' },
]

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  return (
    <div className="h-full flex flex-col py-4 overflow-hidden">
      {/* Logo — desktop only (mobile shows it in the header row) */}
      <div className="px-5 mb-5 flex-shrink-0 hidden md:block">
        <h1 className="text-xl font-serif font-bold bg-gradient-to-r from-accent-cyan to-accent-indigo bg-clip-text text-transparent">
          MindVault
        </h1>
        <p className="text-xs text-dark-text-muted mt-0.5">Everything worth keeping</p>
      </div>

      {/* Navigation — scrollable */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto min-h-0 pb-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150',
                'hover:bg-dark-hover group min-h-[44px]',
                isActive
                  ? item.accent
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    : 'bg-dark-elevated text-accent-cyan border border-accent-cyan/20'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-accent-cyan'
                    : item.accent
                    ? 'text-accent-cyan/60 group-hover:text-accent-cyan'
                    : 'text-dark-text-muted group-hover:text-dark-text-secondary'
                )} />
                <span className="text-sm font-medium truncate">{item.label}</span>
                {item.accent && !isActive && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded border border-accent-cyan/20">
                    AI
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Collections */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-1">
            <h3 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">Collections</h3>
            <button
              onClick={() => setShowCreateCollection(true)}
              className="p-1 rounded-lg hover:bg-dark-hover transition-colors"
              title="New Collection"
            >
              <Plus className="w-4 h-4 text-dark-text-muted" />
            </button>
          </div>

          <div className="space-y-0.5">
            {collections.map((collection) => (
              <NavLink
                key={collection.id}
                to={`/collections/${collection.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                    'hover:bg-dark-hover group min-h-[40px]',
                    isActive
                      ? 'bg-dark-elevated border border-dark-border text-dark-text-primary'
                      : 'text-dark-text-secondary hover:text-dark-text-primary'
                  )
                }
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: collection.colour }} />
                <span className="flex-1 truncate text-sm">{collection.name}</span>
                <span className="text-xs text-dark-text-muted flex-shrink-0">{collection.card_count}</span>
              </NavLink>
            ))}
            {collections.length === 0 && (
              <p className="px-3 py-2 text-xs text-dark-text-muted italic">No collections yet</p>
            )}
          </div>
        </div>
      </nav>

      {/* Settings */}
      <div className="px-3 pt-3 border-t border-dark-border flex-shrink-0">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150',
              'hover:bg-dark-hover group min-h-[44px]',
              isActive ? 'bg-dark-elevated text-accent-cyan' : 'text-dark-text-secondary hover:text-dark-text-primary'
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
      </div>

      <CreateCollectionModal open={showCreateCollection} onClose={() => setShowCreateCollection(false)} />
    </div>
  )
}
