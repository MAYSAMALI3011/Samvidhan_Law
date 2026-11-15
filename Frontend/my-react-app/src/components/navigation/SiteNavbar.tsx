import {
  Command,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Home,
  BookOpen,
  Landmark,
  FileText,
  Sparkles,
  Settings,
  Bookmark,
  Sun,
  Moon,
  Compass,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from '../brand/BrandMark'
import { ProfileMenu } from './ProfileMenu'
import { NavbarInlineSearch } from './NavbarInlineSearch'
import { MegaMenu } from './MegaMenu'
import { useAppState } from '../../context/useAppState'
import { useTheme } from '../../context/useTheme'

interface SiteNavbarProps {
  onOpenSearch?: () => void
}

export function SiteNavbar({ onOpenSearch }: SiteNavbarProps) {
  const location = useLocation()
  const { user, demoSignOut, pushToast } = useAppState()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [prevPath, setPrevPath] = useState(location.pathname)

  // Close mobile drawer on route change (adjust state during render)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Escape key closes mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch()
    } else {
      window.dispatchEvent(new CustomEvent('open-search-palette'))
    }
  }

  return (
    <div className={`floating-navbar-container ${mobileMenuOpen ? 'drawer-is-open' : ''}`}>
      <header className={`floating-pill-navbar ${scrolled ? 'is-scrolled' : ''}`}>
        {/* Left: Brand Emblem & Wordmark */}
        <Link className="brand-pill-link" to="/" aria-label="Samvidhan Home">
          <BrandMark height={38} onDark={theme === 'dark'} />
        </Link>

        {/* Center: Exactly Three Primary Links */}
        <nav className="desktop-center-nav" aria-label="Primary Navigation">
          <MegaMenu />
        </nav>

        {/* Direct Inline Search Input (Type right in the navbar, no popup modal) */}
        <NavbarInlineSearch />

        {/* Right Actions: Strict Auth State Separation */}
        <div className="nav-right-actions">
          {user ? (
            <div className="auth-logged-in-group">
              <Link to="/dashboard" className="btn btn-outline nav-dashboard-btn">
                <LayoutDashboard size={15} aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
              <ProfileMenu />
            </div>
          ) : (
            <div className="auth-logged-out-group">
              <Link to="/login" className="btn btn-ghost nav-login-link">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary nav-signup-gold-btn">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button (Strictly hidden on desktop > 900px) */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Drawer Menu (<= 900px) */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content samvidhan-glow-card" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <BrandMark height={34} onDark={theme === 'dark'} />
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search Trigger */}
            <button
              type="button"
              className="mobile-drawer-search"
              onClick={() => {
                setMobileMenuOpen(false)
                handleSearchClick()
              }}
            >
              <Search size={16} />
              <span>Search lessons, articles, acts...</span>
              <span className="search-shortcut-badge">
                <Command size={10} /> K
              </span>
            </button>

            {/* Primary Nav Links */}
            <div className="mobile-nav-group">
              <div className="mobile-group-title">Navigation</div>
              <nav className="mobile-nav-links">
                <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={18} aria-hidden="true" />
                  <span>Home</span>
                </Link>
                <Link to="/learn" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <BookOpen size={18} aria-hidden="true" />
                  <span>Curriculum &amp; Courses</span>
                </Link>
                <Link to="/constitution" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Landmark size={18} aria-hidden="true" />
                  <span>Constitution of India</span>
                </Link>
                <Link to="/library" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <FileText size={18} aria-hidden="true" />
                  <span>Statutory Library</span>
                </Link>
                <Link to="/ask" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles size={18} aria-hidden="true" className="text-gold" />
                  <span>Ask Samvidhan AI</span>
                </Link>
              </nav>
            </div>

            {/* Account & Preferences */}
            <div className="mobile-drawer-auth">
              <div className="mobile-group-title">Account &amp; Preferences</div>
              {user ? (
                <div className="mobile-auth-logged">
                  <div className="mobile-user-greeting">
                    Signed in as <strong>{user.name}</strong>
                  </div>
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard size={18} aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/dashboard?tab=bookmarks" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Bookmark size={18} aria-hidden="true" />
                    <span>My Bookmarks</span>
                  </Link>
                  <Link to="/settings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Settings size={18} aria-hidden="true" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Theme Switcher Row */}
                  <button
                    type="button"
                    className="mobile-nav-link mobile-theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                    <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline mobile-full-btn mobile-logout-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '0.75rem',
                      minHeight: '48px',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      demoSignOut()
                      pushToast('You have been logged out successfully.', 'info')
                    }}
                  >
                    <LogOut size={18} />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/signup" className="btn btn-primary mobile-full-btn" style={{ minHeight: '48px' }} onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                  <Link to="/login" className="btn btn-ghost mobile-full-btn" style={{ minHeight: '44px' }} onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>

                  {/* Theme Switcher Row */}
                  <button
                    type="button"
                    className="mobile-nav-link mobile-theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                    <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Platform Reference Footer Links */}
            <div className="mobile-drawer-footer-links">
              <Link to="/design-principles" className="mobile-sublink" onClick={() => setMobileMenuOpen(false)}>
                <Compass size={14} aria-hidden="true" />
                <span>Design Principles</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}