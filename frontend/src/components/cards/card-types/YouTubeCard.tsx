/**
 * YouTube Card
 * ─────────────────────────────────────────────────────────────────────────────
 * YouTube video card with thumbnail and play overlay
 */
import { Play, Clock } from 'lucide-react'
import { Card } from '@/api/cards'

interface YouTubeCardProps {
  card: Card
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function YouTubeCard({ card }: YouTubeCardProps) {
  const duration = card.metadata?.duration || 0
  const channel = card.metadata?.channel || ''

  return (
    <>
      {/* Thumbnail with Play Overlay */}
      <div className="relative h-48 overflow-hidden bg-dark-elevated">
        {card.thumbnail_url ? (
          <>
            <img
              src={card.thumbnail_url}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-accent-red/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>
            {/* Duration Badge */}
            {duration > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-red/20 to-accent-amber/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-dark-text-muted" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Channel */}
        {channel && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-accent-red/20 flex items-center justify-center">
              <span className="text-xs">▶</span>
            </div>
            <span className="text-xs text-dark-text-muted truncate">
              {channel}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-dark-text-primary mb-2 line-clamp-2 group-hover:text-accent-cyan transition-colors">
          {card.title}
        </h3>

        {/* Description */}
        {card.description && (
          <p className="text-sm text-dark-text-secondary line-clamp-2">
            {card.description}
          </p>
        )}
      </div>
    </>
  )
}
