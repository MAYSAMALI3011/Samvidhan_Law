import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'

export function ProfileMenu() {
  const { user, demoSignOut, pushToast } = useAppState()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleLogout = () => {
    demoSignOut()
    pushToast('You have been logged out successfully.', 'info')
    setOpen(false)
    navigate('/')
  }

  if (!user) return null

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CL'

  const canAccessAdmin = !user.role || ['superadmin', 'admin', 'editor', 'reviewer'].includes(user.role)

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User profile and settings menu"
      >
        <span className="profile-avatar-pill" aria-hidden="true">
          {initials}
        </span>
        <span className="profile-name-preview">{user.name.split(' ')[0]}</span>
        <ChevronDown size={14} className={`profile-chevron ${open ? 'is-open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="profile-dropdown-menu samvidhan-glow-card" role="menu">
          {/* User Header */}
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">{initials}</div>
            <div className="profile-dropdown-userinfo">
              <span className="profile-dropdown-name">{user.name}</span>
              <span className="profile-dropdown-email">{user.email}</span>
            </div>
          </div>

          <div className="profile-dropdown-divider" />

          {/* Links */}
          <Link
            to="/dashboard"
            role="menuitem"
            className="profile-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/progress"
            role="menuitem"
            className="profile-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Award size={16} aria-hidden="true" />
            <span>My Progress &amp; Badges</span>
          </Link>

          <Link
            to="/bookmarks"
            role="menuitem"
            className="profile-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Bookmark size={16} aria-hidden="true" />
            <span>Bookmarks</span>
          </Link>

          <Link
            to="/settings"
            role="menuitem"
            className="profile-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} aria-hidden="true" />
            <span>Settings &amp; Appearance</span>
          </Link>

          {/* Admin Entry for Admin/Editor roles */}
          {canAccessAdmin && (
            <>
              <div className="profile-dropdown-divider" />
              <Link
                to="/admin"
                role="menuitem"
                className="profile-dropdown-item admin-menu-item"
                onClick={() => setOpen(false)}
              >
                <Shield size={16} className="text-gold" aria-hidden="true" />
                <span>Admin Console</span>
              </Link>
            </>
          )}

          <div className="profile-dropdown-divider" />

          {/* Log Out */}
          <button
            type="button"
            role="menuitem"
            className="profile-dropdown-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  )
}
