/**
 * App Layout
 * ─────────────────────────────────────────────────────────────────────────────
 * Main application layout with sidebar, topbar, content area, and music player
 */
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import QuickCaptureModal from '../capture/QuickCaptureModal'
import SearchModal from '../search/SearchModal'
import GlobalMusicPlayer from '../music/GlobalMusicPlayer'

export default function AppLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-dark-surface/30 pointer-events-none" />

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -240, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -240, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="hidden md:flex md:flex-col w-60 flex-shrink-0 border-r border-dark-border bg-dark-surface/50 backdrop-blur-xl"
            >
              <Sidebar />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* TopBar */}
          <TopBar />

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-custom">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-8 pb-24 md:pb-8"
            >
              <Outlet />
            </motion.div>
          </main>

          {/* Global Music Player — above bottom nav */}
          <GlobalMusicPlayer />
        </div>

        {/* Bottom Navigation - Mobile */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

      {/* Modals */}
      <QuickCaptureModal />
      <SearchModal />
    </div>
  )
}
