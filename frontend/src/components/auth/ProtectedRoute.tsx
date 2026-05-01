/**
 * Protected Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Never redirects while a token refresh is in progress.
 * Shows a loading spinner instead.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuthStore()
  const location = useLocation()

  // Show spinner while checking auth — DO NOT redirect yet
  if (isLoading || isLoggingOut) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-accent-cyan/20 border-t-accent-cyan animate-spin" />
          <p className="text-dark-text-muted text-sm">Connecting to vault...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
