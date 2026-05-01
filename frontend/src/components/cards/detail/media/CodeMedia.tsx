/**
 * Code Media
 * ─────────────────────────────────────────────────────────────────────────────
 * Code snippet display with editing
 */
import { useState, useEffect } from 'react'
import { Copy, Edit3, Check } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, cardsApi } from '@/api/cards'
import { useDebounce } from '@/hooks/useDebounce'

interface CodeMediaProps {
  card: Card
}

export default function CodeMedia({ card }: CodeMediaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [body, setBody] = useState(card.body || '')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const debouncedBody = useDebounce(body, 2000)

  // Auto-save mutation
  const updateMutation = useMutation({
    mutationFn: (data: { body: string }) => cardsApi.update(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', card.id] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  // Auto-save when debounced value changes
  useEffect(() => {
    if (debouncedBody !== card.body && isEditing) {
      updateMutation.mutate({ body: debouncedBody })
    }
  }, [debouncedBody])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      toast.success('Code copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const language = card.metadata?.language || 'plaintext'

  return (
    <div className="bg-dark-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-accent-cyan/10 text-accent-cyan text-xs font-medium rounded border border-accent-cyan/20">
            {language}
          </span>
          <span className="text-xs text-dark-text-muted">
            {body.split('\n').length} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-dark-text-secondary hover:bg-dark-hover rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-accent-cyan" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isEditing
                ? 'bg-accent-cyan/10 text-accent-cyan'
                : 'text-dark-text-secondary hover:bg-dark-hover'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Editing' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full min-h-[300px] max-h-[400px] px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none font-mono text-sm leading-relaxed overflow-y-auto"
            spellCheck={false}
          />
        ) : (
          <div className="overflow-y-auto max-h-[400px] overflow-x-auto">
            <pre>
              <code className="block px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text-primary font-mono text-sm leading-relaxed whitespace-pre break-words">
                {body || <span className="text-dark-text-muted italic">No code yet</span>}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Auto-save indicator */}
      {isEditing && updateMutation.isPending && (
        <div className="px-4 pb-4">
          <p className="text-xs text-dark-text-muted">Saving...</p>
        </div>
      )}
    </div>
  )
}
