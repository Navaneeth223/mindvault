/**
 * Card Item
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal card wrapper that routes to specific card type components
 */
import { motion } from 'framer-motion'
import { Star, Pin, Clock } from 'lucide-react'
import { Card } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import LinkCard from './card-types/LinkCard'
import YouTubeCard from './card-types/YouTubeCard'
import GitHubCard from './card-types/GitHubCard'
import NoteCard from './card-types/NoteCard'
import VoiceCard from './card-types/VoiceCard'
import CodeCard from './card-types/CodeCard'
import ImageCard from './card-types/ImageCard'

interface CardItemProps {
  card: Card
}

export default function CardItem({ card }: CardItemProps) {
  const { openCardDetail } = useUIStore()

  const handleClick = () => {
    openCardDetail(card.id)
  }

  const renderCardContent = () => {
    switch (card.type) {
      case 'link':
      case 'reel':
        return <LinkCard card={card} />
      case 'youtube':
        return <YouTubeCard card={card} />
      case 'github':
        return <GitHubCard card={card} />
      case 'note':
      case 'chat':
        return <NoteCard card={card} />
      case 'voice':
        return <VoiceCard card={card} />
      case 'code':
        return <CodeCard card={card} />
      case 'image':
      case 'pdf':
        return <ImageCard card={card} />
      default:
        return <LinkCard card={card} />
    }
  }

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className={cn(
        'group relative bg-dark-surface border border-dark-border rounded-2xl overflow-hidden',
        'hover:border-accent-cyan/30 hover:shadow-soft-lg transition-all duration-200',
        'cursor-pointer'
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {card.is_pinned && (
          <div className="p-1.5 bg-dark-bg/80 backdrop-blur-sm rounded-lg">
            <Pin className="w-3.5 h-3.5 text-accent-amber" />
          </div>
        )}
        {card.is_favourite && (
          <div className="p-1.5 bg-dark-bg/80 backdrop-blur-sm rounded-lg">
            <Star className="w-3.5 h-3.5 text-accent-cyan fill-accent-cyan" />
          </div>
        )}
        {card.reminder_at && !card.reminder_done && (
          <div className="p-1.5 bg-dark-bg/80 backdrop-blur-sm rounded-lg">
            <Clock className="w-3.5 h-3.5 text-accent-indigo" />
          </div>
        )}
      </div>

      {/* Card Content */}
      {renderCardContent()}

      {/* Footer */}
      <div className="p-4 border-t border-dark-border/50">
        <div className="flex items-center justify-between text-xs text-dark-text-muted">
          <span>{card.time_since_created}</span>
          {card.collection_detail && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: card.collection_detail.colour }}
              />
              <span>{card.collection_detail.name}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-dark-elevated border border-dark-border rounded-lg text-dark-text-secondary"
              >
                #{tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-dark-text-muted">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
