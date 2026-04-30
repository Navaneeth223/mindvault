/**
 * Note Media
 * ─────────────────────────────────────────────────────────────────────────────
 * Markdown note view/edit
 */
import { useState, useEffect } from 'react'
import { Eye, Edit3 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, cardsApi } from '@/api/cards'
import { useDebounce } from '@/hooks/useDebounce'

interface NoteMediaProps {
  card: Card
}

export default function NoteMedia({ card }: NoteMediaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [body, setBody] = useState(card.body || '')
  const queryClient = useQueryClient()

  const debouncedBody = useDebounce(body, 1000)

  const updateMutation = useMutation({
    mutationFn: (data: { body: string }) => cardsApi.update(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', card.id] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  useEffect(() => {
    if (debouncedBody !== card.body && isEditing) {
      updateMutation.mutate({ body: debouncedBody })
    }
  }, [debouncedBody]) // eslint-disable-line

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="mb-2 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="bg-dark-elevated">
      <div className="flex items-center justify-end gap-2 p-4 border-b border-dark-border">
        <button
          onClick={() => setIsEditing(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !isEditing ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-dark-text-muted hover:bg-dark-hover'
          }`}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isEditing ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-dark-text-muted hover:bg-dark-hover'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="p-6">
        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full min-h-[400px] px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none font-mono text-sm leading-relaxed"
            placeholder="Write your note here... (Markdown supported)"
          />
        ) : (
          <div className="text-dark-text-primary leading-relaxed">
            {body ? renderMarkdown(body) : (
              <p className="text-dark-text-muted italic">No content yet. Click Edit to add content.</p>
            )}
          </div>
        )}
      </div>

      {isEditing && updateMutation.isPending && (
        <div className="px-6 pb-4">
          <p className="text-xs text-dark-text-muted">Saving...</p>
        </div>
      )}
    </div>
  )
}
