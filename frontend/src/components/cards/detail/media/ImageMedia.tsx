/**
 * Image Media
 * ─────────────────────────────────────────────────────────────────────────────
 * Image display with lightbox
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/api/cards'

interface ImageMediaProps {
  card: Card
}

export default function ImageMedia({ card }: ImageMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const imageUrl = card.file_url || card.og_image_url

  const handleCopyOCR = async () => {
    if (card.metadata?.ocr_text) {
      try {
        await navigator.clipboard.writeText(card.metadata.ocr_text)
        toast.success('OCR text copied')
      } catch (error) {
        toast.error('Failed to copy')
      }
    }
  }

  if (!imageUrl) {
    return (
      <div className="aspect-video bg-dark-elevated flex items-center justify-center">
        <p className="text-sm text-dark-text-muted">No image available</p>
      </div>
    )
  }

  return (
    <>
      {/* Image preview */}
      <div className="bg-dark-elevated">
        <div
          className="relative max-h-[300px] overflow-hidden cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={imageUrl}
            alt={card.title}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-dark-surface/90 backdrop-blur-sm rounded-lg text-sm text-dark-text-primary">
              Click to enlarge
            </div>
          </div>
        </div>

        {/* OCR text */}
        {card.metadata?.ocr_text && (
          <div className="p-4 border-t border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-dark-text-muted">Extracted text</p>
              <button
                onClick={handleCopyOCR}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <p className="text-sm text-dark-text-secondary leading-relaxed">
              {card.metadata.ocr_text}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-dark-surface/50 hover:bg-dark-surface transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={imageUrl}
              alt={card.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
