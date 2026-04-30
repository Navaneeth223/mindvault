/**
 * Search Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Full search page with filters
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, X } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import CardGrid from '@/components/cards/CardGrid'
import Input from '@/components/ui/Input'

const CARD_TYPES = [
  { value: '', label: 'All' },
  { value: 'link', label: 'Links' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'note', label: 'Notes' },
  { value: 'voice', label: 'Voice' },
  { value: 'code', label: 'Code' },
  { value: 'image', label: 'Images' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce
  const handleQueryChange = (value: string) => {
    setQuery(value)
    clearTimeout((window as any).__searchTimer)
    ;(window as any).__searchTimer = setTimeout(() => setDebouncedQuery(value), 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['search-page', debouncedQuery, typeFilter],
    queryFn: () => cardsApi.list({
      search: debouncedQuery || undefined,
      type: typeFilter || undefined,
      is_archived: false,
      page_size: 40,
    }),
    enabled: !!(debouncedQuery || typeFilter),
  })

  const cards = data?.results || []
  const hasSearch = !!(debouncedQuery || typeFilter)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-4xl font-serif font-bold mb-1">Search</h1>
        <p className="text-dark-text-muted">Search across all your cards</p>
      </motion.div>

      {/* Search bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search titles, notes, transcripts..."
            autoFocus
            className="w-full pl-12 pr-4 py-3 bg-dark-surface border border-dark-border rounded-2xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent text-base"
          />
          {query && (
            <button onClick={() => { setQuery(''); setDebouncedQuery('') }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-dark-hover transition-colors">
              <X className="w-4 h-4 text-dark-text-muted" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap">
          {CARD_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                typeFilter === t.value
                  ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                  : 'border-dark-border text-dark-text-secondary hover:border-dark-text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      {hasSearch ? (
        <div>
          {!isLoading && (
            <p className="text-sm text-dark-text-muted mb-4">
              {data?.count ?? 0} result{data?.count !== 1 ? 's' : ''}
              {debouncedQuery && <> for "<span className="text-dark-text-primary">{debouncedQuery}</span>"</>}
            </p>
          )}
          <CardGrid cards={cards} isLoading={isLoading} />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-dark-elevated flex items-center justify-center mb-6">
            <Search className="w-9 h-9 text-dark-text-muted" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2">Search your vault</h3>
          <p className="text-dark-text-muted max-w-xs">
            Type above to search across all your cards, notes, transcripts, and more.
          </p>
          <p className="text-sm text-dark-text-muted mt-3 opacity-60">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-mono">⌘K</kbd> anywhere to search
          </p>
        </motion.div>
      )}
    </div>
  )
}
