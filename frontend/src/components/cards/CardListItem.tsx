/**
 * Card List Item
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact single-row card for list view
 */
import { motion } from 'framer-motion'
import { Star, Clock, Link2, FileText, Mic, Code2, Image, Youtube, Github, File } from 'lucide-react'
import { Card } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const TYPE_ICONS: Record<string, any> = {
  link: Link2, youtube: Youtube, github: Github,
  note: FileText, voice: Mic, code: Code2,
  image: Image, pdf: FileText, chat: FileText, file: File, reel: Youtube,
}
const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4', youtube: '#ef4444', github: '#8b5cf6',
  note: '#6366f1', voice: '#f5a623', code: '#10b981',
  image: '#ec4899', pdf: '#f59e0b', chat: '#6366f1', file: '#a1a1aa', reel: '#ef4444',
}

export default function CardListItem({ card }: { card: Card }) {
  const { openCardDetail } = useUIStore()
  const Icon = TYPE_ICONS[card.type] || FileText
  const color = TYPE_COLORS[card.type] || '#a1a1aa'

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={() => openCardDetail(card.id)}
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-dark-surface border border-dark-border rounded-xl',
        'hover:border-accent-cyan/30 hover:bg-dark-elevated transition-all duration-150 cursor-pointer group'
      )}
    >
      {/* Type icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-text-primary truncate group-hover:text-accent-cyan transition-colors">
          {card.title}
        </p>
        {(card.description || card.domain) && (
          <p className="text-xs text-dark-text-muted truncate mt-0.5">
            {card.description || card.domain}
          </p>
        )}
      </div>

      {/* Tags */}
      {card.tags?.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {card.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-dark-elevated border border-dark-border rounded-lg text-dark-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {card.is_favourite && <Star className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />}
        {card.reminder_at && !card.reminder_done && <Clock className="w-3.5 h-3.5 text-accent-cyan" />}
      </div>

      {/* Time */}
      <span className="text-xs text-dark-text-muted flex-shrink-0 hidden md:block">
        {card.time_since_created}
      </span>
    </motion.div>
  )
}
