/**
 * URL Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * URL input with live preview
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Loader2, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { metaApi, ScrapedMetadata } from '@/api/meta'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface URLCaptureProps {
  initialUrl?: string
  onSave: (data: { url: string; metadata: ScrapedMetadata }) => void
  onCancel: () => void
}

export default function URLCapture({ initialUrl = '', onSave, onCancel }: URLCaptureProps) {
  const [url, setUrl] = useState(initialUrl)
  const [debouncedUrl, setDebouncedUrl] = useState(initialUrl)

  // Debounce URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url)
    }, 500)
    return () => clearTimeout(timer)
  }, [url])

  // Validate URL
  const isValidUrl = (str: string) => {
    try {
      const urlObj = new URL(str)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Fetch metadata
  const {
    data: metadata,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['url-metadata', debouncedUrl],
    queryFn: () => metaApi.scrapeUrl(debouncedUrl),
    enabled: isValidUrl(debouncedUrl),
    retry: false,
  })

  const handleSave = () => {
    if (!metadata) return
    onSave({ url: debouncedUrl, metadata })
  }

  const canSave = isValidUrl(url) && metadata && !error

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          URL
        </label>
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="pl-12"
            autoFocus
          />
        </div>
        {url && !isValidUrl(url) && (
          <p className="mt-1.5 text-xs text-accent-red">Please enter a valid URL</p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          <span className="ml-3 text-sm text-dark-text-muted">Fetching preview...</span>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl"
        >
          <p className="text-sm text-accent-red">
            Failed to fetch URL metadata. You can still save it.
          </p>
        </motion.div>
      )}

      {/* Preview Card */}
      <AnimatePresence mode="wait">
        {metadata && (
          <motion.div
            key={metadata.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group relative overflow-hidden bg-dark-elevated border border-dark-border rounded-2xl hover:border-accent-cyan/30 transition-all duration-300"
          >
            {/* OG Image */}
            {metadata.og_image && (
              <div className="relative aspect-[2/1] overflow-hidden bg-dark-bg">
                <img
                  src={metadata.og_image}
                  alt={metadata.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated/80 to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-2">
              {/* Domain */}
              <div className="flex items-center gap-2">
                {metadata.favicon && (
                  <img
                    src={metadata.favicon}
                    alt=""
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <span className="text-xs text-dark-text-muted">{metadata.domain}</span>
                <ExternalLink className="w-3 h-3 text-dark-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-dark-text-primary line-clamp-2">
                {metadata.title}
              </h3>

              {/* Description */}
              {metadata.description && (
                <p className="text-sm text-dark-text-secondary line-clamp-2">
                  {metadata.description}
                </p>
              )}

              {/* Type Badge */}
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2 py-1 text-xs font-medium bg-accent-cyan/10 text-accent-cyan rounded-lg border border-accent-cyan/20">
                  {metadata.type}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Save Link
        </Button>
      </div>
    </div>
  )
}
