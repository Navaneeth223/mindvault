/**
 * App Layout
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed mobile: hamburger menu, slide-in sidebar overlay, auto-close on nav.
 */
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import QuickCaptureModal from '../capture/QuickCaptureModal'
import SearchModal from '../search/SearchModal'
import GlobalMusicPlayer from '../music/GlobalMusicPlayer'

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { sidebarOpen } = useUIStore()
  const location = useLocation()

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Escape key closes mobile sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary flex flex-col">
      {/* TopBar */}
      <TopBar onMenuClick={() => setMobileSidebarOpen(p => !p)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar — always visible on md+ */}
        {sidebarOpen && (
          <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-dark-border bg-dark-surface/50 backdrop-blur-xl overflow-y-auto">
            <Sidebar onClose={() => {}} />
          </aside>
        )}

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />

              {/* Sidebar panel */}
              <motion.aside
                key="sidebar"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="md:hidden fixed left-0 top-0 h-full w-72 z-50 bg-dark-surface border-r border-dark-border overflow-y-auto flex flex-col shadow-2xl"
              >
                {/* Close button row */}
                <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-dark-border flex-shrink-0">
                  <span className="font-serif text-lg font-bold bg-gradient-to-r from-accent-cyan to-accent-indigo bg-clip-text text-transparent">
                    MindVault
                  </span>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-dark-hover text-dark-text-muted hover:text-dark-text-primary transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Sidebar onClose={() => setMobileSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 md:p-8 pb-32 md:pb-8">
              <Outlet />
            </div>
          </div>

          {/* Global Music Player */}
          <GlobalMusicPlayer />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Modals */}
      <QuickCaptureModal />
      <SearchModal />
    </div>
  )
}
