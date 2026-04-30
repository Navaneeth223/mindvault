/**
 * Detail Header
 * ─────────────────────────────────────────────────────────────────────────────
 * Header for card detail drawer
 */
import { X, MoreVertical } from 'lucide-react'
import { Card } from '@/api/cards'

interface DetailHeaderProps {
  card: Card
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4',
  youtube: '#ef4444',
  github: '#8b5cf6',
  note: '#6366f1',
  voice: '#f5a623',
  code: '#10b981',
  image: '#ec4899',
  pdf: '#f59e0b',
  reel: '#ef4444',
  chat: '#6366f1',
  file: '#a1a1aa',
}

export default function DetailHeader({ card, onClose }: DetailHeaderProps) {
  const typeColor = TYPE_COLORS[card.type] || '#a1a1aa'

  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
      {/* Left: Close button */}
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-dark-text-secondary" />
      </button>

      {/* Center: Type badge */}
      <div
        className="px-3 py-1.5 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: `${typeColor}15`,
          borderColor: `${typeColor}40`,
          color: typeColor,
        }}
      >
        {card.card_type_display}
      </div>

      {/* Right: More menu */}
      <button
        className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="w-5 h-5 text-dark-text-secondary" />
      </button>
    </div>
  )
}
