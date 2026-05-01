/**
 * Card Item
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop: full card. Mobile: compact horizontal row.
 */
import { motion } from 'framer-motion'
import { Star, Pin, Clock, Link2, FileText, Mic, Code2, Image, Youtube, Github, Music2, File } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/utils/cn'
import LinkCard from './card-types/LinkCard'
import YouTubeCard from './card-types/YouTubeCard'
import GitHubCard from './card-types/GitHubCard'
import NoteCard from './card-types/NoteCard'
import VoiceCard from './card-types/VoiceCard'
import CodeCard from './card-types/CodeCard'
import ImageCard from './card-types/ImageCard'

const TYPE_ICONS: Record<string, any> = {
  link: Link2, youtube: Youtube, github: Github,
  note: FileText, voice: Mic, code: Code2,
  image: Image, pdf: FileText, music: Music2,
  chat: FileText, file: File, reel: Youtube,
}
const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4', youtube: '#ef4444', github: '#8b5cf6',
  note: '#6366f1', voice: '#f5a623', code: '#10b981',
  image: '#ec4899', pdf: '#f59e0b', music: '#f5a623',
  chat: '#6366f1', file: '#a1a1aa', reel: '#ef4444',
}

interface CardItemProps {
  card: Card
}

export default function CardItem({ card }: CardItemProps) {
  const { openCardDetail } = useUIStore()
  const { isMobile } = useBreakpoint()

  const handleClick = () => openCardDetail(card.id)

  // ── Mobile: compact horizontal row ───────────────────────────────────────
  if (isMobile) {
    const Icon = TYPE_ICONS[card.type] || FileText
    const color = TYPE_COLORS[card.type] || '#a1a1aa'

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="flex items-start gap-3 p-4 bg-dark-surface border border-dark-border rounded-xl hover:border-white/15 transition-all cursor-pointer active:bg-dark-elevated"
      >
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-text-primary line-clamp-2 leading-snug">
            {card.title}
          </p>
          {(card.description || card.domain) && (
            <p className="text-xs text-dark-text-muted truncate mt-0.5">
              {card.description || card.domain}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {card.collection_detail && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.collection_detail.colour }} />
                <span className="text-xs text-dark-text-muted">{card.collection_detail.name}</span>
              </div>
            )}
            <span className="text-xs text-dark-text-muted ml-auto">
              {card.time_since_created}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {card.is_favourite && <Star className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />}
          {card.reminder_at && !card.reminder_done && <Clock className="w-3.5 h-3.5 text-accent-cyan" />}
        </div>
      </motion.div>
    )
  }

  // ── Desktop: full card ────────────────────────────────────────────────────
  const renderCardContent = () => {
    switch (card.type) {
      case 'link': case 'reel': return <LinkCard card={card} />
      case 'youtube':           return <YouTubeCard card={card} />
      case 'github':            return <GitHubCard card={card} />
      case 'note': case 'chat': return <NoteCard card={card} />
      case 'voice':             return <VoiceCard card={card} />
      case 'code':              return <CodeCard card={card} />
      case 'image': case 'pdf': return <ImageCard card={card} />
      default:                  return <LinkCard card={card} />
    }
  }

  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className={cn(
        'group relative bg-dark-surface border border-dark-border rounded-2xl overflow-hidden',
        'hover:border-accent-cyan/30 hover:shadow-soft-lg transition-all duration-200 cursor-pointer'
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
            <Star className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
          </div>
        )}
        {card.reminder_at && !card.reminder_done && (
          <div className="p-1.5 bg-dark-bg/80 backdrop-blur-sm rounded-lg">
            <Clock className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
        )}
      </div>

      {renderCardContent()}

      {/* Footer */}
      <div className="p-4 border-t border-dark-border/50">
        <div className="flex items-center justify-between text-xs text-dark-text-muted">
          <span>{card.time_since_created}</span>
          {card.collection_detail && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.collection_detail.colour }} />
              <span>{card.collection_detail.name}</span>
            </div>
          )}
        </div>
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {card.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-dark-elevated border border-dark-border rounded-lg text-dark-text-secondary">
                #{tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-dark-text-muted">+{card.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
