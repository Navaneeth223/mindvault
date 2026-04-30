/**
 * Search Modal
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured Cmd+K search with instant results
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, FileText, Link2, Mic, Code2, Image, Youtube, Github } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { cardsApi, Card } from '@/api/cards'
import { cn } from '@/utils/cn'

const TYPE_ICONS: Record<string, any> = {
  link: Link2, youtube: Youtube, github: Github,
  note: FileText, voice: Mic, code: Code2,
  image: Image, pdf: FileText, chat: FileText, file: FileText, reel: Youtube,
}

const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4', youtube: '#ef4444', github: '#8b5cf6',
  note: '#6366f1', voice: '#f5a623', code: '#10b981',
  image: '#ec4899', pdf: '#f59e0b', chat: '#6366f1', file: '#a1a1aa', reel: '#ef4444',
}

const RECENT_KEY = 'mv-recent-searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function addRecentSearch(q: string) {
  const recent = getRecentSearches().filter(r => r !== q)
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...recent].slice(0, MAX_RECENT)))
}

function ResultItem({ card, onSelect }: { card: Card; onSelect: (card: Card) => void }) {
  const Icon = TYPE_ICONS[card.type] || FileText
  const color = TYPE_COLORS[card.type] || '#a1a1aa'

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(card)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover rounded-xl transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-text-primary truncate group-hover:text-accent-cyan transition-colors">
          {card.title}
        </p>
        {card.description && (
          <p className="text-xs text-dark-text-muted truncate mt-0.5">{card.description}</p>
        )}
      </div>
      <span className="text-xs text-dark-text-muted capitalize flex-shrink-0 px-2 py-0.5 bg-dark-elevated rounded-lg">
        {card.type}
      </span>
    </motion.button>
  )
}

export default function SearchModal() {
  const { searchOpen, openSearch, closeSearch, openCardDetail } = useUIStore()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (searchOpen) closeSearch(); else openSearch()
      }
      if (e.key === 'Escape' && searchOpen) closeSearch()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, openSearch, closeSearch])

  // Load recent searches when modal opens
  useEffect(() => {
    if (searchOpen) {
      setRecentSearches(getRecentSearches())
      setQuery('')
      setDebouncedQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  // Search query
  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => cardsApi.list({ search: debouncedQuery, page_size: 12 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  const results = data?.results || []

  const handleSelect = (card: Card) => {
    if (query.trim()) addRecentSearch(query.trim())
    closeSearch()
    openCardDetail(card.id)
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    setDebouncedQuery(term)
    inputRef.current?.focus()
  }

  const handleClearRecent = () => {
    localStorage.removeItem(RECENT_KEY)
    setRecentSearches([])
  }

  const showRecent = !query && recentSearches.length > 0
  const showResults = debouncedQuery.length >= 2
  const showEmpty = showResults && !isLoading && results.length === 0

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none"
          >
            <div className="bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg pointer-events-auto overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-dark-border">
                <Search className={cn('w-5 h-5 flex-shrink-0 transition-colors', query ? 'text-accent-cyan' : 'text-dark-text-muted')} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search cards, notes, links..."
                  className="flex-1 bg-transparent text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none text-base"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-dark-hover transition-colors">
                    <X className="w-4 h-4 text-dark-text-muted" />
                  </button>
                )}
                <button onClick={closeSearch} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors ml-1">
                  <kbd className="text-xs text-dark-text-muted font-mono">Esc</kbd>
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {/* Loading */}
                {isLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Results */}
                {showResults && !isLoading && results.length > 0 && (
                  <div>
                    <p className="px-4 py-2 text-xs font-semibold text-dark-text-muted uppercase tracking-wider">
                      {data?.count} result{data?.count !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-0.5">
                      {results.map(card => (
                        <ResultItem key={card.id} card={card} onSelect={handleSelect} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty */}
                {showEmpty && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="w-10 h-10 text-dark-text-muted mb-3" />
                    <p className="text-dark-text-primary font-medium">No results for "{debouncedQuery}"</p>
                    <p className="text-sm text-dark-text-muted mt-1">Try different keywords</p>
                  </div>
                )}

                {/* Recent searches */}
                {showRecent && (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <p className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">Recent</p>
                      <button onClick={handleClearRecent} className="text-xs text-dark-text-muted hover:text-accent-cyan transition-colors">
                        Clear
                      </button>
                    </div>
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-hover rounded-xl transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-dark-text-muted flex-shrink-0" />
                        <span className="text-sm text-dark-text-secondary">{term}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hint when empty and no recent */}
                {!query && !showRecent && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <p className="text-sm text-dark-text-muted">Type to search your vault</p>
                    <p className="text-xs text-dark-text-muted mt-1 opacity-60">
                      Searches titles, descriptions, notes, and transcripts
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-dark-border">
                <span className="text-xs text-dark-text-muted flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-mono">↵</kbd> Open
                </span>
                <span className="text-xs text-dark-text-muted flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-mono">Esc</kbd> Close
                </span>
                <span className="ml-auto text-xs text-dark-text-muted">
                  <kbd className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-mono">⌘K</kbd>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
