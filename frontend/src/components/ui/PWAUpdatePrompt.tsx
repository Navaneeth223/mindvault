/**
 * PWA Update Prompt
 * ─────────────────────────────────────────────────────────────────────────────
 * Prompts user to update when new version is available
 */
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import Button from './Button'

export default function PWAUpdatePrompt() {
  const { needRefresh, update } = usePWA()

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-dark-surface border border-accent-cyan/30 rounded-2xl shadow-soft-lg p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-accent-cyan" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-text-primary mb-1">
                  Update Available
                </h3>
                <p className="text-sm text-dark-text-secondary mb-3">
                  A new version of MindVault is available. Update now to get the latest features.
                </p>

                {/* Actions */}
                <Button variant="primary" size="sm" onClick={update} className="w-full">
                  Update Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
