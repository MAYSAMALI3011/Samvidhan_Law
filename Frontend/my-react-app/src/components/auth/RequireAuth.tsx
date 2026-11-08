import { Navigate, useLocation } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'

export interface RequireAuthProps {
  children: React.ReactNode
}

/**
 * Route wrapper that enforces authentication.
 * If user is unauthenticated, redirects to /login preserving the return URL.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAppState()
  const location = useLocation()

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} state={{ from: location }} replace />
  }

  return <>{children}</>
}
