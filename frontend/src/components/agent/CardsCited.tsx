/**
 * Cards Cited
 * ─────────────────────────────────────────────────────────────────────────────
 * Horizontal scroll of mini card chips shown below ARIA messages.
 * Each chip opens the card detail drawer on click.
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link2, FileText, Mic, Code2, Image, Youtube, Github, ExternalLink } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'

const TYPE_ICONS: Record<string, any> = {
  link: Link2, youtube: Youtube, github: Github,
  note: FileText, voice: Mic, code: Code2,
  image: Image, pdf: FileText, chat: FileText, file: FileText, reel: Youtube,
}

const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4', youtube: '#ef4444', github: '#8b5cf6',
  note: '#6366f1', voice: '#f5a623', code: '#10b981',
  image: '#ec4899', pdf: '#f59e0b', chat: '#6366f1', file: '#a1a1aa',
}

interface CardsCitedProps {
  cardIds: string[]
}

function CardChip({ cardId }: { cardId: string }) {
  const { openCardDetail } = useUIStore()

  const { data: card } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.get(cardId),
    staleTime: 5 * 60 * 1000,
  })

  if (!card) {
    return (
      <div className="h-8 w-32 bg-dark-elevated rounded-lg animate-pulse flex-shrink-0" />
    )
  }

  const Icon = TYPE_ICONS[card.type] || FileText
  const color = TYPE_COLORS[card.type] || '#a1a1aa'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => openCardDetail(cardId)}
      className="flex items-center gap-2 px-3 py-1.5 bg-dark-elevated border border-dark-border rounded-xl hover:border-accent-cyan/30 transition-all flex-shrink-0 group"
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <span className="text-xs text-dark-text-secondary truncate max-w-[120px] group-hover:text-accent-cyan transition-colors">
        {card.title}
      </span>
      <ExternalLink className="w-3 h-3 text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </motion.button>
  )
}

export default function CardsCited({ cardIds }: CardsCitedProps) {
  if (!cardIds || cardIds.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-dark-text-muted">From your vault:</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {cardIds.map((id) => (
          <CardChip key={id} cardId={id} />
        ))}
      </div>
    </div>
  )
}
