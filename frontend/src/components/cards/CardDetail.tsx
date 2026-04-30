/**
 * Card Detail Drawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete card detail view with inline editing
 */
import { useEffect } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { cardsApi } from '@/api/cards'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import DetailHeader from './detail/DetailHeader'
import DetailActions from './detail/DetailActions'
import DetailMedia from './detail/DetailMedia'
import DetailContent from './detail/DetailContent'

interface CardDetailProps {
  cardId: string
  onClose: () => void
}

export default function CardDetail({ cardId, onClose }: CardDetailProps) {
  const { isMobile } = useBreakpoint()
  const dragControls = useDragControls()

  // Fetch card data
  const { data: card, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: async () => {
      const response = await cardsApi.get(cardId)
      return response
    },
    staleTime: 30_000,
  })

  // Record view
  const viewMutation = useMutation({
    mutationFn: () => cardsApi.recordView(cardId),
  })

  useEffect(() => {
    viewMutation.mutate()
  }, [cardId])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (isLoading || !card) {
    return (
      <AnimatePresence>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />

        {/* Loading drawer */}
        <motion.div
          initial={isMobile ? { y: '100%' } : { x: '100%' }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`fixed z-50 bg-dark-surface border-dark-border flex flex-col ${
            isMobile
              ? 'bottom-0 left-0 right-0 h-[95vh] rounded-t-3xl border-t'
              : 'top-0 right-0 w-[480px] h-screen border-l'
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={isMobile ? { y: '100%' } : { x: '100%' }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: '100%' } : { x: '100%' }}
        drag={isMobile ? 'y' : false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(e, info) => {
          if (isMobile && info.offset.y > 120) {
            onClose()
          }
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed z-50 bg-dark-surface border-dark-border flex flex-col ${
          isMobile
            ? 'bottom-0 left-0 right-0 h-[95vh] rounded-t-3xl border-t'
            : 'top-0 right-0 w-[480px] h-screen border-l'
        }`}
      >
        {/* Drag handle (mobile only) */}
        {isMobile && (
          <div
            className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-dark-text-muted rounded-full" />
          </div>
        )}

        {/* Header */}
        <DetailHeader card={card} onClose={onClose} />

        {/* Actions */}
        <DetailActions card={card} onClose={onClose} />

        {/* Media */}
        <DetailMedia card={card} />

        {/* Content */}
        <DetailContent card={card} />
      </motion.div>
    </AnimatePresence>
  )
}
