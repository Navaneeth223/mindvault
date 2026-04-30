/**
 * Collection Select Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom dropdown for selecting collections
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { collectionsApi, Collection } from '@/api/collections'

interface CollectionSelectProps {
  value: string | null
  onChange: (collectionId: string | null) => void
  placeholder?: string
}

export default function CollectionSelect({
  value,
  onChange,
  placeholder = 'Select collection',
}: CollectionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  const selectedCollection = collections.find((c) => c.id === value)

  // Filter collections
  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-2xl hover:border-accent-cyan/30 transition-all duration-200 text-left"
      >
        <div className="flex items-center gap-2">
          {selectedCollection ? (
            <>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedCollection.colour }}
              />
              <span className="text-dark-text-primary">{selectedCollection.name}</span>
            </>
          ) : (
            <span className="text-dark-text-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-dark-text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 p-2 bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg max-h-80 overflow-hidden flex flex-col"
          >
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter collections..."
                className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Collections list */}
            <div className="overflow-y-auto flex-1 space-y-1">
              {/* None option */}
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setIsOpen(false)
                  setSearchQuery('')
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded-xl transition-colors ${
                  !value
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                }`}
              >
                No collection
              </button>

              {/* Collections */}
              {filteredCollections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => {
                    onChange(collection.id)
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-xl transition-colors ${
                    value === collection.id
                      ? 'bg-accent-cyan/10 text-accent-cyan'
                      : 'text-dark-text-primary hover:bg-dark-hover'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: collection.colour }}
                  />
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-xs text-dark-text-muted">
                    {collection.card_count}
                  </span>
                </button>
              ))}

              {filteredCollections.length === 0 && (
                <p className="px-3 py-4 text-sm text-dark-text-muted text-center">
                  No collections found
                </p>
              )}
            </div>

            {/* Create new */}
            <div className="mt-2 pt-2 border-t border-dark-border">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-cyan hover:bg-accent-cyan/10 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create new collection</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
