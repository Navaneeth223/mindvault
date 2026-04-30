import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '@/api/cards'
import CardGrid from '@/components/cards/CardGrid'

export default function ArchivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cards', { is_archived: true }],
    queryFn: () => cardsApi.list({ is_archived: true }),
  })

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-8">Archive 📦</h1>
      <CardGrid cards={data?.results || []} isLoading={isLoading} />
    </div>
  )
}
