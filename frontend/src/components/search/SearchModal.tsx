/**
 * Search Modal
 * ─────────────────────────────────────────────────────────────────────────────
 * Global search modal (Cmd+K) - placeholder
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function SearchModal() {
  const { searchOpen, openSearch, closeSearch } = useUIStore()

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
      if (e.key === 'Escape' && searchOpen) {
        closeSearch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, openSearch, closeSearch])

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none"
          >
            <div className="bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg pointer-events-auto overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-dark-border">
                <Search className="w-5 h-5 text-dark-text-muted" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  autoFocus
                  className="flex-1 bg-transparent text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none"
                />
                <button
                  onClick={closeSearch}
                  className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
                >
                  <X className="w-4 h-4 text-dark-text-muted" />
                </button>
              </div>

              {/* Results */}
              <div className="p-4">
                <p className="text-dark-text-muted text-center py-8">
                  Start typing to search...
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
