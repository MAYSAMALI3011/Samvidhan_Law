import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Home, Library, Sparkles, User } from 'lucide-react'
import { useAppState } from '../../context/useAppState'

export function MobileTabBar() {
  const { user } = useAppState()
  const location = useLocation()

  // Hide on quiz pages to avoid distraction
  if (location.pathname.startsWith('/quiz')) {
    return null
  }

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-tab-item ${isActive ? 'is-active' : ''}`}
      >
        <Home size={20} aria-hidden="true" />
        <span className="mobile-tab-label">Home</span>
      </NavLink>

      <NavLink
        to="/learn"
        className={({ isActive }) => `mobile-tab-item ${isActive ? 'is-active' : ''}`}
      >
        <BookOpen size={20} aria-hidden="true" />
        <span className="mobile-tab-label">Learn</span>
      </NavLink>

      {/* Center Raised Action Button (FAB) for Ask Samvidhan */}
      <NavLink
        to="/ask"
        className={({ isActive }) => `mobile-tab-fab-wrap ${isActive ? 'is-active' : ''}`}
        aria-label="Ask Samvidhan AI Assistant"
      >
        <div className="mobile-tab-fab">
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <span className="mobile-tab-label">Ask</span>
      </NavLink>

      <NavLink
        to="/library"
        className={({ isActive }) => `mobile-tab-item ${isActive ? 'is-active' : ''}`}
      >
        <Library size={20} aria-hidden="true" />
        <span className="mobile-tab-label">Library</span>
      </NavLink>

      <NavLink
        to={user ? '/dashboard' : '/login'}
        className={({ isActive }) => `mobile-tab-item ${isActive ? 'is-active' : ''}`}
      >
        <User size={20} aria-hidden="true" />
        <span className="mobile-tab-label">{user ? 'Me' : 'Log in'}</span>
      </NavLink>
    </nav>
  )
}
