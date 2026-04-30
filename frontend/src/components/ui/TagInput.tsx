/**
 * Tag Input Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Tag input with autocomplete
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

// Deterministic color from tag name
function getTagColor(tag: string): string {
  const colors = [
    '#00f5d4', // cyan
    '#6366f1', // indigo
    '#f5a623', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // orange
  ]
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function TagInput({ value, onChange, placeholder = 'Add tags...', maxTags = 10 }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch tag suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['tag-suggestions', input],
    queryFn: async () => {
      if (input.length < 2) return []
      const response = await client.get('/api/tags/', { params: { q: input } })
      const data = response.data
      const items = Array.isArray(data) ? data : (data.results ?? [])
      return items.map((t: any) => t.name ?? t)
    },
    enabled: input.length >= 2,
  })

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(
    (tag: string) => !value.includes(tag) && tag.toLowerCase().includes(input.toLowerCase())
  )

  // Add tag
  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed])
      setInput('')
      setShowSuggestions(false)
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 bg-dark-elevated border border-dark-border rounded-2xl focus-within:ring-2 focus-within:ring-accent-cyan focus-within:border-transparent transition-all">
        {/* Tag chips */}
        <AnimatePresence mode="popLayout">
          {value.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium border"
              style={{
                backgroundColor: `${getTagColor(tag)}15`,
                borderColor: `${getTagColor(tag)}40`,
                color: getTagColor(tag),
              }}
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Input */}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 p-2 bg-dark-surface border border-dark-border rounded-xl shadow-soft-lg max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((tag: string) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-sm text-dark-text-primary hover:bg-dark-hover rounded-lg transition-colors"
              >
                #{tag}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <p className="mt-1.5 text-xs text-dark-text-muted">
        Press Enter or comma to add. {value.length}/{maxTags} tags
      </p>
    </div>
  )
}
