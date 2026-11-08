import { Command, Search, Menu, X, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from '../brand/BrandMark'
import { ProfileMenu } from './ProfileMenu'
import { NavbarInlineSearch } from './NavbarInlineSearch'
import { MegaMenu } from './MegaMenu'
import { useAppState } from '../../context/useAppState'

interface SiteNavbarProps {
  onOpenSearch?: () => void
}

export function SiteNavbar({ onOpenSearch }: SiteNavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAppState()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch()
    } else {
      window.dispatchEvent(new CustomEvent('open-search-palette'))
    }
  }

  return (
    <div className="floating-navbar-container">
      <header className={`floating-pill-navbar ${scrolled ? 'is-scrolled' : ''}`}>
        {/* Left: Brand Emblem & Wordmark */}
        <Link className="brand-pill-link" to="/" aria-label="Samvidhan Home">
          <BrandMark height={38} onDark={true} />
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
              <BrandMark height={34} onDark={true} />
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

            <nav className="mobile-nav-links">
              <Link to="/learn" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Curriculum
              </Link>
              <Link to="/constitution" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Constitution
              </Link>
              <Link to="/library" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Legal Library
              </Link>
            </nav>

            <div className="mobile-drawer-auth">
              {user ? (
                <div className="mobile-auth-logged">
                  <Link to="/dashboard" className="btn btn-primary mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                    Go to Dashboard
                  </Link>
                  <Link to="/settings" className="btn btn-secondary mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn btn-ghost mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/signup" className="btn btn-primary mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}