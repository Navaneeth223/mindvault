/**
 * Sidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Navigation sidebar with collections
 */
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Star, Archive, Bell, Settings, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { collectionsApi } from '@/api/collections'
import { cn } from '@/utils/cn'
import CreateCollectionModal from '@/components/collections/CreateCollectionModal'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/favourites', icon: Star, label: 'Favourites' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/archive', icon: Archive, label: 'Archive' },
]

export default function Sidebar() {
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  return (
    <div className="h-full flex flex-col py-6 overflow-hidden">
      {/* Logo */}
      <div className="px-6 mb-6 flex-shrink-0">
        <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-accent-cyan to-accent-indigo bg-clip-text text-transparent">
          MindVault
        </h1>
        <p className="text-xs text-dark-text-muted mt-1">
          Everything worth keeping
        </p>
      </div>

      {/* Navigation — scrollable area */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto min-h-0 pb-2"
           style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {/* Main Nav */}
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-dark-hover group',
                  isActive
                    ? 'bg-dark-elevated text-accent-cyan border border-accent-cyan/20'
                    : 'text-dark-text-secondary hover:text-dark-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-colors flex-shrink-0',
                      isActive ? 'text-accent-cyan' : 'text-dark-text-muted group-hover:text-dark-text-secondary'
                    )}
                  />
                  <span className="font-medium truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}

        {/* Collections */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">
              Collections
            </h3>
            <button
              onClick={() => setShowCreateCollection(true)}
              className="p-1 rounded-lg hover:bg-dark-hover transition-colors"
              title="New Collection"
            >
              <Plus className="w-4 h-4 text-dark-text-muted" />
            </button>
          </div>

          <div className="space-y-0.5">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navItems.length + index) * 0.05 }}
              >
                <NavLink
                  to={`/collections/${collection.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200',
                      'hover:bg-dark-hover group',
                      isActive
                        ? 'bg-dark-elevated border border-dark-border text-dark-text-primary'
                        : 'text-dark-text-secondary hover:text-dark-text-primary'
                    )
                  }
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: collection.colour }}
                  />
                  <span className="flex-1 truncate text-sm">{collection.name}</span>
                  <span className="text-xs text-dark-text-muted flex-shrink-0">
                    {collection.card_count}
                  </span>
                </NavLink>
              </motion.div>
            ))}

            {collections.length === 0 && (
              <p className="px-3 py-2 text-xs text-dark-text-muted italic">No collections yet</p>
            )}
          </div>
        </div>
      </nav>

      {/* Settings — pinned to bottom */}
      <div className="px-3 pt-3 border-t border-dark-border flex-shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              'hover:bg-dark-hover group',
              isActive
                ? 'bg-dark-elevated text-accent-cyan'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        open={showCreateCollection}
        onClose={() => setShowCreateCollection(false)}
      />
    </div>
  )
}
