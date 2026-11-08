import { useState } from 'react'
import {
  Award,
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/useAppState'
import { TierBadge } from '../../ui/growth/TierBadge'
import { getCurrentTier } from '../../utils/tiers'

export interface LearningSidebarProps {
  onOpenChat?: () => void
  onCollapseChange?: (collapsed: boolean) => void
}

const learnLinks = [
  { tab: 'path', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'courses', to: '/dashboard?tab=courses', label: 'Curriculum', icon: BookOpen },
  { tab: 'constitution', to: '/dashboard?tab=constitution', label: 'Constitution', icon: Landmark },
  { tab: 'library', to: '/dashboard?tab=library', label: 'Legal Library', icon: Library },
]

const personalLinks = [
  { to: '/progress', label: 'My Progress', icon: Award },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '#ask', label: 'Ask Samvidhan', icon: HelpCircle, isChatTrigger: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function LearningSidebar({ onOpenChat, onCollapseChange }: LearningSidebarProps) {
  // Remember collapse choice in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('samvidhan-sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })

  const { user, demoSignOut, pushToast } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'path'

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('samvidhan-sidebar-collapsed', String(next))
    } catch {}
    if (onCollapseChange) {
      onCollapseChange(next)
    }
  }

  const handleLogout = () => {
    demoSignOut()
    pushToast('You have been logged out.', 'info')
    navigate('/')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'C'

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="My learning navigation"
    >
      {/* Sidebar Header: "My learning" + Collapse Button */}
      <div className="sidebar-collapse-header">
        {!collapsed && <span className="sidebar-brand-sub">My learning</span>}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
        </button>
      </div>

      <nav className="sidebar-nav-scroll" aria-label="Sidebar Links">
        {/* Section: LEARN */}
        <div className="sidebar-section-header">
          {!collapsed && <span className="sidebar-section-title">LEARN</span>}
        </div>
        <div className="sidebar-nav-group">
          {learnLinks.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === '/dashboard'
                ? activeTab === item.tab
                : location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-icon-wrap" aria-hidden="true">
                  <Icon size={18} />
                </span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Section: PERSONAL */}
        <div className="sidebar-section-header">
          {!collapsed && <span className="sidebar-section-title">PERSONAL</span>}
        </div>
        <div className="sidebar-nav-group">
          {personalLinks.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            if (item.isChatTrigger) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`sidebar-nav-item chat-trigger-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    if (onOpenChat) {
                      onOpenChat()
                    } else {
                      // Dispatch global event to open chat launcher
                      window.dispatchEvent(new CustomEvent('samvidhan:open-chat'))
                    }
                  }}
                  title={collapsed ? 'Ask Samvidhan Legal AI' : undefined}
                >
                  <span className="sidebar-icon-wrap" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  {!collapsed && (
                    <div className="sidebar-chat-label-row">
                      <span className="sidebar-label">{item.label}</span>
                      <span className="sidebar-online-dot" title="Online legal guide" />
                    </div>
                  )}
                </button>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-icon-wrap" aria-hidden="true">
                  <Icon size={18} />
                </span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer User Chip & Log Out */}
      <div className="sidebar-user-footer">
        {user ? (
          <div className="sidebar-user-row">
            <div className="sidebar-avatar-circle" title={user.name}>
              {initials}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name" title={user.name}>{user.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                  <span className="sidebar-user-role">{user.role || 'Citizen'}</span>
                  <TierBadge tier={getCurrentTier()} size="sm" />
                </div>
              </div>
            )}
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="sidebar-login-prompt">
            <Link to="/login" className="sidebar-login-link" title={collapsed ? 'Log in' : undefined}>
              <span className="sidebar-icon-wrap">
                <LogOut size={16} />
              </span>
              {!collapsed && <span>Log in</span>}
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
