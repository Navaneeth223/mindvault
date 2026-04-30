/**
 * Offline Indicator
 * ─────────────────────────────────────────────────────────────────────────────
 * Banner showing offline status and queued items
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { getQueueCount } from '@/utils/offlineQueue'

export default function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [queueCount, setQueueCount] = useState(0)

  // Update queue count
  useEffect(() => {
    const updateCount = async () => {
      const count = await getQueueCount()
      setQueueCount(count)
    }

    updateCount()

    // Poll every 5 seconds
    const interval = setInterval(updateCount, 5000)
    return () => clearInterval(interval)
  }, [])

  // Don't show if online and no queue
  const shouldShow = !isOnline || queueCount > 0

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border backdrop-blur-sm pointer-events-auto ${
                isOnline
                  ? 'bg-accent-cyan/10 border-accent-cyan/30'
                  : 'bg-accent-amber/10 border-accent-amber/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Cloud className="w-5 h-5 text-accent-cyan" />
                ) : (
                  <CloudOff className="w-5 h-5 text-accent-amber" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isOnline ? 'text-accent-cyan' : 'text-accent-amber'
                    }`}
                  >
                    {isOnline ? 'Back online' : 'You are offline'}
                  </p>
                  {queueCount > 0 && (
                    <p className="text-xs text-dark-text-muted">
                      {queueCount} {queueCount === 1 ? 'item' : 'items'} queued for sync
                    </p>
                  )}
                </div>
              </div>

              {isOnline && queueCount > 0 && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
