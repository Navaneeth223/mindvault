/**
 * Link Media
 * ─────────────────────────────────────────────────────────────────────────────
 * Display for link cards
 */
import { ExternalLink } from 'lucide-react'
import { Card } from '@/api/cards'

interface LinkMediaProps {
  card: Card
}

export default function LinkMedia({ card }: LinkMediaProps) {
  return (
    <div className="relative overflow-hidden bg-dark-elevated">
      {/* OG Image */}
      {card.og_image_url ? (
        <div className="relative aspect-[2/1] overflow-hidden">
          <img
            src={card.og_image_url}
            alt={card.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated/90 to-transparent" />
        </div>
      ) : (
        /* Gradient placeholder */
        <div className="relative aspect-[2/1] bg-gradient-to-br from-accent-cyan/10 to-accent-cyan/5 flex flex-col items-center justify-center">
          {card.favicon_url && (
            <img
              src={card.favicon_url}
              alt=""
              className="w-12 h-12 rounded-lg mb-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <p className="text-sm text-dark-text-muted">{card.domain}</p>
        </div>
      )}

      {/* Domain badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-dark-surface/90 backdrop-blur-sm border border-dark-border rounded-lg">
        {card.favicon_url && (
          <img
            src={card.favicon_url}
            alt=""
            className="w-4 h-4 rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <span className="text-xs text-dark-text-secondary">{card.domain}</span>
        <ExternalLink className="w-3 h-3 text-dark-text-muted" />
      </div>
    </div>
  )
}
