/**
 * PWA Install Banner
 * ─────────────────────────────────────────────────────────────────────────────
 * Prompts user to install PWA
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import Button from './Button'

const DISMISSED_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, install } = usePWA()
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Check if should show banner
  useEffect(() => {
    if (isInstalled || !canInstall) {
      setVisible(false)
      return
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return
      }
    }

    // Show after 5 seconds
    const timer = setTimeout(() => {
      setVisible(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    setInstalling(true)
    const success = await install()
    setInstalling(false)

    if (success) {
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-dark-surface border border-dark-border rounded-2xl shadow-soft-lg p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-accent-cyan" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-text-primary mb-1">
                  Install MindVault
                </h3>
                <p className="text-sm text-dark-text-secondary mb-3">
                  Install the app for a better experience with offline access and faster loading.
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex-1"
                  >
                    {installing ? 'Installing...' : 'Install'}
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-sm text-dark-text-muted hover:text-dark-text-primary transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-dark-hover transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-dark-text-muted" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
