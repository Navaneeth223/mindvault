/**
 * Collection Page
 */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, Check, X } from 'lucide-react'
import { cardsApi } from '@/api/cards'
import { collectionsApi } from '@/api/collections'
import CardGrid from '@/components/cards/CardGrid'
import toast from 'react-hot-toast'

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  const { data: collection } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.get(id!),
    enabled: !!id,
  })

  // Sync name value when collection loads
  useEffect(() => {
    if (collection && !editingName) setNameValue(collection.name)
  }, [collection])

  const { data, isLoading } = useQuery({
    queryKey: ['cards-collection', id],
    queryFn: () => cardsApi.list({ collection: id, is_archived: false, page_size: 100 }),
    enabled: !!id,
  })

  const renameMutation = useMutation({
    mutationFn: (name: string) => collectionsApi.update(id!, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      setEditingName(false)
      toast.success('Collection renamed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => collectionsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      toast.success('Collection deleted')
      window.history.back()
    },
  })

  const handleRename = () => {
    if (nameValue.trim() && nameValue !== collection?.name) {
      renameMutation.mutate(nameValue.trim())
    } else {
      setEditingName(false)
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete "${collection?.name}"? Cards will not be deleted.`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 group">
          {collection && (
            <div className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: collection.colour }} />
          )}

          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
                autoFocus
                className="text-4xl font-serif font-bold bg-transparent border-b-2 border-accent-cyan focus:outline-none text-dark-text-primary flex-1"
              />
              <button onClick={handleRename} className="p-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
                <X className="w-4 h-4 text-dark-text-muted" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-serif font-bold">{collection?.name || 'Collection'}</h1>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setNameValue(collection?.name || ''); setEditingName(true) }}
                  className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
                  <Edit2 className="w-4 h-4 text-dark-text-muted" />
                </button>
                <button onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-accent-red/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-accent-red" />
                </button>
              </div>
            </>
          )}
        </div>
        <p className="text-dark-text-muted mt-1 ml-7">
          {data?.count ?? 0} card{data?.count !== 1 ? 's' : ''}
        </p>
      </motion.div>

      <CardGrid cards={data?.results || []} isLoading={isLoading} />
    </div>
  )
}
