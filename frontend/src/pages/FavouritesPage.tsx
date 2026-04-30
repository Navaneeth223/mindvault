/**
 * Favourites Page
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import CardGrid from '@/components/cards/CardGrid'

export default function FavouritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cards-favourites'],
    queryFn: () => cardsApi.list({ is_favourite: 'true', is_archived: false, page_size: 100 }),
  })

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-1">Favourites</h1>
        <p className="text-dark-text-muted">
          {data?.count ? `${data.count} starred card${data.count !== 1 ? 's' : ''}` : 'Cards you star appear here'}
        </p>
      </motion.div>

      {!isLoading && data?.count === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-dark-elevated flex items-center justify-center mb-6">
            <Star className="w-9 h-9 text-dark-text-muted" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2">No favourites yet</h3>
          <p className="text-dark-text-muted max-w-xs">
            Star cards you want to find quickly. Click any card and tap the ☆ button.
          </p>
        </motion.div>
      ) : (
        <CardGrid cards={data?.results || []} isLoading={isLoading} />
      )}
    </div>
  )
}
