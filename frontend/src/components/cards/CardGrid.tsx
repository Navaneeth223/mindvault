/**
 * Card Grid
 * ─────────────────────────────────────────────────────────────────────────────
 * Grid and list layout with stagger animation
 */
import { motion } from 'framer-motion'
import { Card } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import CardItem from './CardItem'
import CardListItem from './CardListItem'

interface CardGridProps {
  cards: Card[]
  isLoading?: boolean
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Skeleton for loading state
function Skeleton({ count = 8, list = false }: { count?: number; list?: boolean }) {
  if (list) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-16 bg-dark-surface border border-dark-border rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-56 bg-dark-surface border border-dark-border rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}

export default function CardGrid({ cards, isLoading }: CardGridProps) {
  const { viewMode } = useUIStore()
  const isList = viewMode === 'list'

  if (isLoading) return <Skeleton list={isList} />

  if (cards.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-6 rounded-full bg-dark-elevated flex items-center justify-center">
          <span className="text-4xl">📦</span>
        </div>
        <h3 className="text-xl font-serif font-semibold mb-2">Nothing here yet</h3>
        <p className="text-dark-text-muted max-w-sm">
          Start capturing your knowledge by clicking the + button
        </p>
      </motion.div>
    )
  }

  if (isList) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
        {cards.map(card => (
          <motion.div key={card.id} variants={item}>
            <CardListItem card={card} />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map(card => (
        <motion.div key={card.id} variants={item}>
          <CardItem card={card} />
        </motion.div>
      ))}
    </motion.div>
  )
}
