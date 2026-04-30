/**
 * Detail Actions
 * ─────────────────────────────────────────────────────────────────────────────
 * Action buttons for card detail
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Archive, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, cardsApi } from '@/api/cards'

interface DetailActionsProps {
  card: Card
  onClose: () => void
}

export default function DetailActions({ card, onClose }: DetailActionsProps) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  // Favourite mutation
  const favouriteMutation = useMutation({
    mutationFn: () => cardsApi.toggleFavourite(card.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['card', card.id] })
      const previous = queryClient.getQueryData(['card', card.id])
      queryClient.setQueryData(['card', card.id], (old: any) => ({
        ...old,
        is_favourite: !old.is_favourite,
      }))
      return { previous }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(card.is_favourite ? 'Removed from favourites' : 'Added to favourites')
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['card', card.id], context?.previous)
      toast.error('Failed to update favourite')
    },
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => cardsApi.toggleArchive(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['cards-archived'] })
      toast.success(card.is_archived ? 'Restored from archive' : 'Moved to archive')
      onClose()
    },
    onError: () => {
      toast.error('Failed to archive')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => cardsApi.permanentDelete(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Card deleted permanently')
      onClose()
    },
    onError: () => {
      toast.error('Failed to delete')
    },
  })

  const handleFavourite = () => {
    favouriteMutation.mutate()
  }

  const handleArchive = () => {
    if (confirm(card.is_archived ? 'Restore from archive?' : 'Move to archive? You can restore it anytime.')) {
      archiveMutation.mutate()
    }
  }

  const handleDelete = () => {
    if (confirm('Permanently delete this card? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  const handleCopyLink = async () => {
    const url = card.url || window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleOpenUrl = () => {
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center gap-2 p-4 border-b border-dark-border flex-shrink-0">
      {/* Favourite */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleFavourite}
        disabled={favouriteMutation.isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors disabled:opacity-50"
      >
        <Star
          className={`w-4 h-4 ${card.is_favourite ? 'fill-accent-amber text-accent-amber' : 'text-dark-text-secondary'}`}
        />
        <span className="text-sm text-dark-text-secondary">
          {card.is_favourite ? 'Favourited' : 'Favourite'}
        </span>
      </motion.button>

      {/* Archive */}
      <button
        onClick={handleArchive}
        disabled={archiveMutation.isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors disabled:opacity-50"
      >
        <Archive className="w-4 h-4 text-dark-text-secondary" />
        <span className="text-sm text-dark-text-secondary">
          {card.is_archived ? 'Restore' : 'Archive'}
        </span>
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent-red/10 transition-colors disabled:opacity-50 ml-auto"
      >
        <Trash2 className="w-4 h-4 text-accent-red" />
        <span className="text-sm text-accent-red">Delete</span>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-accent-cyan" />
        ) : (
          <Copy className="w-4 h-4 text-dark-text-secondary" />
        )}
      </button>

      {/* Open URL */}
      {card.url && (
        <button
          onClick={handleOpenUrl}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-dark-text-secondary" />
        </button>
      )}
    </div>
  )
}
