import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Archive } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import CardGrid from '@/components/cards/CardGrid'

export default function ArchivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cards-archived'],
    queryFn: () => cardsApi.list({ is_archived: 'true', page_size: 100 }),
  })

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-1">Archive</h1>
        <p className="text-dark-text-muted">
          {data?.count ? `${data.count} archived card${data.count !== 1 ? 's' : ''}` : "Cards you've archived"}
        </p>
      </motion.div>
      <CardGrid cards={data?.results || []} isLoading={isLoading} />
    </div>
  )
}
