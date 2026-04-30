/**
 * Link Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic link/bookmark card with OG image
 */
import { ExternalLink } from 'lucide-react'
import { Card } from '@/api/cards'

interface LinkCardProps {
  card: Card
}

export default function LinkCard({ card }: LinkCardProps) {
  return (
    <>
      {/* OG Image or Gradient */}
      {card.thumbnail_url || card.og_image_url ? (
        <div className="relative h-48 overflow-hidden bg-dark-elevated">
          <img
            src={card.thumbnail_url || card.og_image_url}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/80 to-transparent" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-accent-indigo/20 to-accent-cyan/20" />
      )}

      {/* Content */}
      <div className="p-4">
        {/* Domain */}
        {card.domain && (
          <div className="flex items-center gap-2 mb-2">
            {card.favicon_url && (
              <img
                src={card.favicon_url}
                alt=""
                className="w-4 h-4 rounded"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <span className="text-xs text-dark-text-muted truncate">
              {card.domain}
            </span>
            <ExternalLink className="w-3 h-3 text-dark-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-dark-text-primary mb-2 line-clamp-2 group-hover:text-accent-cyan transition-colors">
          {card.title}
        </h3>

        {/* Description */}
        {card.description && (
          <p className="text-sm text-dark-text-secondary line-clamp-3">
            {card.description}
          </p>
        )}
      </div>
    </>
  )
}
