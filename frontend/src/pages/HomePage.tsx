/**
 * Home Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Main dashboard with all cards, view toggle, filter, and sort
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Grid3x3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import CardGrid from '@/components/cards/CardGrid'
import { cn } from '@/utils/cn'

const CARD_TYPES = [
  { value: '', label: 'All types' },
  { value: 'link', label: 'Links' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'note', label: 'Notes' },
  { value: 'voice', label: 'Voice' },
  { value: 'code', label: 'Code' },
  { value: 'image', label: 'Images' },
]

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at',  label: 'Oldest first' },
  { value: '-updated_at', label: 'Recently updated' },
  { value: 'title',       label: 'Title A–Z' },
]

export default function HomePage() {
  const { viewMode, setViewMode } = useUIStore()
  const { user } = useAuthStore()
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('-created_at')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['cards', { is_archived: false, type: typeFilter, ordering: sortBy }],
    queryFn: () => cardsApi.list({
      is_archived: false,
      ...(typeFilter ? { type: typeFilter } : {}),
      ordering: sortBy,
      page_size: 40,
    }),
  })

  const cards = data?.results || []
  const hasFilters = !!typeFilter

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-1">
          {greeting()}, {user?.first_name || user?.username} 👋
        </h1>
        <p className="text-dark-text-muted text-sm">
          {data?.count !== undefined
            ? `${data.count} item${data.count !== 1 ? 's' : ''} in your vault`
            : 'Loading your vault...'}
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="flex items-center justify-between mb-5 gap-3">

        {/* Left: view toggle + filter button */}
        <div className="flex items-center gap-2">
          {/* View mode */}
          <div className="flex items-center gap-0.5 p-1 bg-dark-elevated border border-dark-border rounded-xl">
            <button onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid' ? 'bg-accent-cyan text-dark-bg' : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-hover')}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-all duration-200',
                viewMode === 'list' ? 'bg-accent-cyan text-dark-bg' : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-hover')}>
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
              showFilters || hasFilters
                ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
            )}
          </button>

          {/* Clear filters */}
          {hasFilters && (
            <button onClick={() => setTypeFilter('')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-accent-red hover:bg-accent-red/10 transition-colors border border-accent-red/20">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Right: sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-secondary focus:outline-none focus:border-accent-cyan cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-text-muted pointer-events-none" />
        </div>
      </motion.div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="flex flex-wrap gap-2 pb-1">
              {CARD_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                    typeFilter === t.value
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                      : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <CardGrid cards={cards} isLoading={isLoading} />
    </div>
  )
}
