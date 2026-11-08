import { useState } from 'react'
import { NavLink, Outlet, Link, useOutletContext } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Users,
  Flag,
  Settings,
  History,
  Shield,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import { BrandMark } from '../../components/brand/BrandMark'
import type { UserRole } from '../../types'

interface AdminContextType {
  demoRole: UserRole
  setDemoRole: (role: UserRole) => void
}

export function useAdminContext() {
  return useOutletContext<AdminContextType>()
}

export function AdminLayout() {
  const { demoRole, setDemoRole } = useAdminContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/content', label: 'Content Manager', icon: <BookOpen size={18} /> },
    { to: '/admin/review', label: 'Review Workflow', icon: <CheckSquare size={18} /> },
    { to: '/admin/users', label: 'Users & Roles', icon: <Users size={18} /> },
    { to: '/admin/reports', label: 'Mistake Reports', icon: <Flag size={18} /> },
    { to: '/admin/settings', label: 'Site Settings', icon: <Settings size={18} /> },
    { to: '/admin/audit', label: 'Audit Trail', icon: <History size={18} /> },
  ]

  return (
    <div className="admin-shell">
      {/* Mobile top toggle */}
      <div className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="admin-brand-compact">
          <BrandMark height={28} onDark={true} />
          <span className="admin-badge-pill">Admin Console</span>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link" title="Return to Samvidhan home">
            <BrandMark height={34} onDark={true} />
          </Link>
          <div className="admin-env-pill">
            <span className="env-dot" />
            <span>DEMO STORE</span>
          </div>
        </div>

        <nav className="admin-nav-menu" aria-label="Admin Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-avatar">SA</div>
            <div className="admin-user-info">
              <strong className="admin-user-name">Priya Sharma</strong>
              <span className="admin-user-role">Role: {demoRole.toUpperCase()}</span>
            </div>
          </div>
          <Link to="/" className="btn btn-outline admin-exit-btn">
            <ArrowLeft size={15} />
            <span>Exit to Learner App</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <div className="admin-main-container">
        {/* Admin Subheader Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-breadcrumb">Administrative Management Console</span>
          </div>

          <div className="admin-topbar-right">
            {/* Quick Demo Role Selector */}
            <div className="role-switcher-box">
              <Shield size={14} className="text-gold" />
              <label htmlFor="role-select" className="role-label">Testing Role:</label>
              <select
                id="role-select"
                className="role-select-input"
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value as UserRole)}
              >
                <option value="superadmin">Super Admin (Full Access)</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor (Create & Edit)</option>
                <option value="reviewer">Reviewer (Approve Legal Citations)</option>
                <option value="user">Normal Citizen (403 Test)</option>
              </select>
            </div>

            <Link to="/learn" target="_blank" className="btn btn-sm btn-ghost open-app-link">
              <span>View Learner App</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
