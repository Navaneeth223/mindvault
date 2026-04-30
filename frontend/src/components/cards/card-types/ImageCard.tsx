/**
 * Image Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Image/PDF card with preview
 */
import { Image as ImageIcon, FileText } from 'lucide-react'
import { Card } from '@/api/cards'

interface ImageCardProps {
  card: Card
}

export default function ImageCard({ card }: ImageCardProps) {
  const isImage = card.type === 'image'

  return (
    <>
      {/* Image/PDF Preview */}
      <div className="relative h-64 overflow-hidden bg-dark-elevated">
        {card.thumbnail_url ? (
          <>
            <img
              src={card.thumbnail_url}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/80 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-elevated to-dark-surface flex items-center justify-center">
            {isImage ? (
              <ImageIcon className="w-12 h-12 text-dark-text-muted" />
            ) : (
              <FileText className="w-12 h-12 text-dark-text-muted" />
            )}
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-dark-bg/80 backdrop-blur-sm rounded-lg">
          <span className="text-xs font-medium text-dark-text-primary uppercase">
            {card.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-dark-text-primary mb-2 line-clamp-2 group-hover:text-accent-cyan transition-colors">
          {card.title}
        </h3>

        {card.description && (
          <p className="text-sm text-dark-text-secondary line-clamp-2">
            {card.description}
          </p>
        )}
      </div>
    </>
  )
}
