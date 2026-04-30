/**
 * App Layout
 * ─────────────────────────────────────────────────────────────────────────────
 * Main application layout with sidebar, topbar, and content area
 */
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import QuickCaptureModal from '../capture/QuickCaptureModal'
import SearchModal from '../search/SearchModal'

export default function AppLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-dark-surface/30 pointer-events-none" />
      
      {/* Subtle noise texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -240, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -240, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="hidden md:block w-60 flex-shrink-0 border-r border-dark-border bg-dark-surface/50 backdrop-blur-xl"
            >
              <Sidebar />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
