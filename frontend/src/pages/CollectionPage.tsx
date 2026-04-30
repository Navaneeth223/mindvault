import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '@/api/cards'
import { collectionsApi } from '@/api/collections'
import CardGrid from '@/components/cards/CardGrid'

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>()

  const { data: collection } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.get(id!),
    enabled: !!id,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['cards', { collection: id }],
    queryFn: () => cardsApi.list({ collection: id, is_archived: false }),
    enabled: !!id,
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        {collection && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: collection.colour }}
          />
        )}
        <h1 className="text-4xl font-serif font-bold">
          {collection?.name || 'Collection'}
        </h1>
      </div>
      <CardGrid cards={data?.results || []} isLoading={isLoading} />
    </div>
  )
}
