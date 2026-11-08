import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import type { UserRole } from '../../types'

const ADMIN_ROLES: UserRole[] = ['superadmin', 'admin', 'editor', 'reviewer']

export function AdminGuard() {
  const { user } = useAppState()
  const location = useLocation()

  // Hooks must be called at top-level before early returns
  const isDevMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false'
  const initialRole: UserRole = (user?.role as UserRole) || 'learner'
  const [demoRole, setDemoRole] = useState<UserRole>(initialRole)

  // 1. In production builds, disable /admin entirely until a server-verified role exists
  if (import.meta.env.PROD) {
    return <Navigate to="/admin/forbidden" replace />
  }

  // 2. Access requires an authenticated user; unauthenticated visitors are redirected to login
  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} state={{ from: location }} replace />
  }

  const activeRole = isDevMock ? demoRole : initialRole
  const hasAccess = ADMIN_ROLES.includes(activeRole)

  if (!hasAccess) {
    return <Navigate to="/admin/forbidden" replace />
  }

  return <Outlet context={{ demoRole: activeRole, setDemoRole: isDevMock ? setDemoRole : () => {} }} />
}
