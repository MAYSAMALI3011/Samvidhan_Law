import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { isMockMode } from '../../api/config'
import { getCurrentUser } from '../../api/services/authService'
import { sanitizeReturnUrl } from '../../utils/redirect'
import { Loader } from '../../ui/loaders/Loader'
import type { DemoUser, UserRole } from '../../types'

const ADMIN_ROLES: UserRole[] = ['superadmin', 'admin', 'editor', 'reviewer']

/**
 * AdminGuard protects /admin routes.
 *
 * NOTE: This frontend check is strictly for conditional UI navigation and rendering.
 * All administrative API endpoints enforce real authorization checks and permissions server-side.
 */
export function AdminGuard() {
  const { user } = useAppState()
  const location = useLocation()
  const isDevMock = import.meta.env.DEV && isMockMode()

  const [demoRole, setDemoRole] = useState<UserRole>(() => (user?.role as UserRole) || 'learner')
  const [liveUser, setLiveUser] = useState<DemoUser | null>(user)
  const [isVerifying, setIsVerifying] = useState<boolean>(!isDevMock)

  useEffect(() => {
    if (isDevMock) return

    let active = true
    getCurrentUser()
      .then((serverUser) => {
        if (active) {
          setLiveUser(serverUser)
          setIsVerifying(false)
        }
      })
      .catch(() => {
        if (active) {
          setLiveUser(null)
          setIsVerifying(false)
        }
      })

    return () => {
      active = false
    }
  }, [isDevMock])

  // While server authorization is verifying in live mode, render the loader
  if (isVerifying) {
    return <Loader fullscreen caption="Verifying administrative credentials with server..." />
  }

  const effectiveUser = isDevMock ? user : liveUser

  // If not authenticated, redirect to login with safe returnTo parameter
  if (!effectiveUser) {
    const safePath = sanitizeReturnUrl(location.pathname + location.search, '/dashboard')
    const returnTo = encodeURIComponent(safePath)
    return <Navigate to={`/login?returnTo=${returnTo}`} state={{ from: location }} replace />
  }

  // In dev mock mode: allow testing role switcher; in live mode: server-verified role only
  const activeRole: UserRole = isDevMock ? demoRole : ((effectiveUser.role as UserRole) || 'learner')
  const hasAccess = ADMIN_ROLES.includes(activeRole)

  if (!hasAccess) {
    return <Navigate to="/admin/forbidden" replace />
  }

  return (
    <Outlet
      context={{
        demoRole: activeRole,
        setDemoRole: isDevMock ? setDemoRole : () => {},
      }}
    />
  )
}
