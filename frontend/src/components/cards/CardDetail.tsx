/**
 * Card Detail Drawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed: single scroll area — no more dual scroll.
 * Fixed: body scroll locked when drawer is open.
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => cardsApi.get(cardId),
    staleTime: 30_000,
  })

  const viewMutation = useMutation({
    mutationFn: () => cardsApi.recordView(cardId),
  })

  useEffect(() => {
    viewMutation.mutate()
  }, [cardId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const drawerClass = isMobile
    ? 'bottom-0 left-0 right-0 h-[95vh] rounded-t-2xl border-t border-white/7'
    : 'right-0 top-0 h-screen w-[480px] border-l border-white/7'

  const loadingContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={isMobile ? { y: '100%' } : { x: '100%' }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: '100%' } : { x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed z-50 bg-[#1e1e35] flex flex-col ${drawerClass}`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      </motion.div>
    </AnimatePresence>
  )

  if (isLoading || !card) return loadingContent

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
        onDragEnd={(_, info) => {
          if (isMobile && info.offset.y > 120) onClose()
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed z-50 bg-[#1e1e35] flex flex-col ${drawerClass}`}
      >
        {/* Drag handle — mobile only */}
        {isMobile && (
          <div
            className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing flex-shrink-0"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
        )}

        {/* STICKY HEADER — never scrolls */}
        <div className="flex-shrink-0 bg-[#1e1e35] border-b border-white/7 z-10">
          <DetailHeader card={card} onClose={onClose} />
          <DetailActions card={card} onClose={onClose} />
        </div>

        {/* SINGLE SCROLL AREA — everything below scrolls as one unit */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' } as any}
        >
          {/* Media section */}
          <DetailMedia card={card} />

          {/* Content section */}
          <div className="pb-24">
            <DetailContent card={card} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
