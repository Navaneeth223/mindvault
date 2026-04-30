/**
 * Create Collection Modal
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { collectionsApi } from '@/api/collections'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface CreateCollectionModalProps {
  open: boolean
  onClose: () => void
}

const COLOURS = [
  '#00f5d4', '#6366f1', '#f5a623', '#ef4444',
  '#10b981', '#8b5cf6', '#ec4899', '#3b82f6',
]

const ICONS = ['📁', '💡', '📚', '🔬', '🎨', '💻', '🌍', '⭐', '🎯', '🏠', '💼', '🎵']

export default function CreateCollectionModal({ open, onClose }: CreateCollectionModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [colour, setColour] = useState(COLOURS[0])
  const [icon, setIcon] = useState('📁')

  const createMutation = useMutation({
    mutationFn: () => collectionsApi.create({ name: name.trim(), colour, icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      toast.success(`Collection "${name}" created`)
      setName('')
      setColour(COLOURS[0])
      setIcon('📁')
      onClose()
    },
    onError: () => toast.error('Failed to create collection'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-accent-cyan" />
                  <h2 className="font-semibold text-dark-text-primary">New Collection</h2>
                </div>
                <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
                  <X className="w-4 h-4 text-dark-text-muted" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-dark-text-muted mb-1.5">Name</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Research, Ideas, Work..."
                    autoFocus
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-xs font-medium text-dark-text-muted mb-1.5">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(i => (
                      <button
                        key={i} type="button"
                        onClick={() => setIcon(i)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all
                          ${icon === i ? 'bg-accent-cyan/20 ring-2 ring-accent-cyan' : 'bg-dark-elevated hover:bg-dark-hover'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colour */}
                <div>
                  <label className="block text-xs font-medium text-dark-text-muted mb-1.5">Colour</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOURS.map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => setColour(c)}
                        className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                      >
                        {colour === c && (
                          <span className="absolute inset-0 flex items-center justify-center text-dark-bg text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-dark-elevated rounded-xl">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colour }} />
                  <span className="text-sm text-dark-text-primary">{icon} {name || 'Collection name'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 px-5 pb-5">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                  type="submit" variant="primary"
                  disabled={!name.trim()}
                  isLoading={createMutation.isPending}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
