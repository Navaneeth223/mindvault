/**
 * Home Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Main dashboard with recent cards
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Grid3x3, List, Calendar } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import CardGrid from '@/components/cards/CardGrid'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function HomePage() {
  const { viewMode, setViewMode } = useUIStore()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['cards', { is_archived: false }],
    queryFn: () => cardsApi.list({ is_archived: false }),
  })

  const cards = data?.results || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold mb-2">
          Welcome back, {user?.first_name || user?.username} 👋
        </h1>
        <p className="text-dark-text-secondary">
          You have {data?.count || 0} items in your vault
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-dark-text-muted">View:</span>
          <div className="flex items-center gap-1 p-1 bg-dark-elevated border border-dark-border rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-hover'
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-hover'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'timeline'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-hover'
              )}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            Sort
          </Button>
        </div>
      </motion.div>

      {/* Cards */}
      <CardGrid cards={cards} isLoading={isLoading} />
    </div>
  )
}
