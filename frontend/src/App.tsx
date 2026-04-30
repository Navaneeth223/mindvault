import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import FavouritesPage from './pages/FavouritesPage'
import CollectionPage from './pages/CollectionPage'
import RemindersPage from './pages/RemindersPage'
import ArchivePage from './pages/ArchivePage'
import SettingsPage from './pages/SettingsPage'
import SearchPage from './pages/SearchPage'
import OfflineIndicator from './components/ui/OfflineIndicator'
import PWAInstallBanner from './components/ui/PWAInstallBanner'
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt'
import CardDetail from './components/cards/CardDetail'

function App() {
  const { isAuthenticated } = useAuthStore()
  const { activeCardId, closeCardDetail, captureOpen, closeCapture } = useUIStore()
  const location = useLocation()

  // Close drawer and capture modal on route change
  useEffect(() => {
    closeCardDetail()
    closeCapture()
  }, [location.pathname])

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<HomePage />} />
          <Route path="favourites" element={<FavouritesPage />} />
          <Route path="collections/:id" element={<CollectionPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PWA Components */}
      {isAuthenticated && (
        <>
          <OfflineIndicator />
          <PWAInstallBanner />
          <PWAUpdatePrompt />
        </>
      )}

      {/* Card Detail Drawer — only render when we have a valid ID */}
      {activeCardId && !captureOpen && (
        <CardDetail cardId={activeCardId} onClose={closeCardDetail} />
      )}
    </>
  )
}

export default App
