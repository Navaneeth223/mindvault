import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '@/api/cards'
import CardGrid from '@/components/cards/CardGrid'

export default function FavouritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cards', { is_favourite: true }],
    queryFn: () => cardsApi.list({ is_favourite: true, is_archived: false }),
  })

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-8">Favourites ⭐</h1>
      <CardGrid cards={data?.results || []} isLoading={isLoading} />
    </div>
  )
}
