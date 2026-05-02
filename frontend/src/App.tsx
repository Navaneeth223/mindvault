import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { startKeepAlive, stopKeepAlive } from './utils/keepAlive'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import FavouritesPage from './pages/FavouritesPage'
import CollectionPage from './pages/CollectionPage'
import RemindersPage from './pages/RemindersPage'
import ArchivePage from './pages/ArchivePage'
import SettingsPage from './pages/SettingsPage'
import SearchPage from './pages/SearchPage'
import MusicPage from './pages/MusicPage'
import TimerPage from './pages/TimerPage'
import ARIAPage from './pages/ARIAPage'
import OfflineIndicator from './components/ui/OfflineIndicator'
import PWAInstallBanner from './components/ui/PWAInstallBanner'
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt'
import CardDetail from './components/cards/CardDetail'

function AppRoutes() {
  const { isAuthenticated } = useAuthStore()
  const { activeCardId, closeCardDetail, captureOpen, closeCapture } = useUIStore()
  const location = useLocation()

  // Close drawer and capture modal on route change
  useEffect(() => {
    closeCardDetail()
    closeCapture()
  }, [location.pathname])

  // Expose openCapture globally for Electron tray menu
  useEffect(() => {
    const { openCapture } = useUIStore.getState()
    ;(window as any).openCapture = openCapture
    return () => { delete (window as any).openCapture }
  }, [])

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="favourites"      element={<FavouritesPage />} />
          <Route path="collections/:id" element={<CollectionPage />} />
          <Route path="reminders"       element={<RemindersPage />} />
          <Route path="archive"         element={<ArchivePage />} />
          <Route path="search"          element={<SearchPage />} />
          <Route path="music"           element={<MusicPage />} />
          <Route path="timer"           element={<TimerPage />} />
          <Route path="aria"            element={<ARIAPage />} />
          <Route path="settings"        element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && (
        <>
          <OfflineIndicator />
          <PWAInstallBanner />
          <PWAUpdatePrompt />
        </>
      )}

      {activeCardId && !captureOpen && (
        <CardDetail cardId={activeCardId} onClose={closeCardDetail} />
      )}
    </>
  )
}

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // Check auth on mount (handles page refresh)
    checkAuth()
    // Start keep-alive pings to prevent Render cold starts
    startKeepAlive()
    return () => stopKeepAlive()
  }, [])

  return <AppRoutes />
}
