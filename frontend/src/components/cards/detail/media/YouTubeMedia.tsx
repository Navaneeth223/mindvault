/**
 * YouTube Media
 * ─────────────────────────────────────────────────────────────────────────────
 * YouTube iframe embed
 */
import { Card } from '@/api/cards'

interface YouTubeMediaProps {
  card: Card
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

export default function YouTubeMedia({ card }: YouTubeMediaProps) {
  const videoId = card.metadata?.video_id || extractVideoId(card.url)

  if (!videoId) {
    return (
      <div className="aspect-video bg-dark-elevated flex items-center justify-center">
        <p className="text-sm text-dark-text-muted">Invalid YouTube URL</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-elevated">
      {/* YouTube iframe */}
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={card.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Metadata */}
      {card.metadata && (
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3 text-xs text-dark-text-muted">
            {card.metadata.channel && (
              <span>{card.metadata.channel}</span>
            )}
            {card.metadata.duration && (
              <>
                <span>•</span>
                <span>{card.metadata.duration}</span>
              </>
            )}
            {card.metadata.views && (
              <>
                <span>•</span>
                <span>{card.metadata.views} views</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
