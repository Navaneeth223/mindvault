/**
 * Note Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Markdown note card with preview
 */
import { FileText } from 'lucide-react'
import { Card } from '@/api/cards'

interface NoteCardProps {
  card: Card
}

export default function NoteCard({ card }: NoteCardProps) {
  // Safe preview — body can be null/undefined for new cards
  const preview = (card.body || '').split('\n').slice(0, 6).join('\n')

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-accent-indigo" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-dark-text-primary line-clamp-2 group-hover:text-accent-cyan transition-colors">
              {card.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-4">
        <div className="prose prose-sm prose-invert max-w-none">
          <pre className="text-sm text-dark-text-secondary whitespace-pre-wrap line-clamp-6 font-sans">
            {preview || <span className="italic text-dark-text-muted">Empty note</span>}
          </pre>
        </div>
      </div>
    </>
  )
}
