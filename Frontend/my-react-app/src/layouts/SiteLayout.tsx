import { useEffect, useState, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Toasts } from '../components/feedback/Toasts'
import { SiteFooter } from '../components/navigation/SiteFooter'
import { SiteNavbar } from '../components/navigation/SiteNavbar'
import { MobileTabBar } from '../components/navigation/MobileTabBar'
import { AskSamvidhanLauncher } from '../components/assistant/AskSamvidhanLauncher'
import { SearchPalette } from '../components/navigation/SearchPalette'
import { ShortcutsModal } from '../ui/navigation/ShortcutsModal'
import { RouteProgressBar } from '../components/feedback/RouteProgressBar'
import { GlobalCursorGlow } from '../components/brand/GlobalCursorGlow'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { OfflineBanner } from '../ui/feedback/OfflineBanner'
import { ColdStartBanner } from '../ui/feedback/ColdStartBanner'
import { ErrorBoundary } from '../ui/feedback/ErrorBoundary'

export function SiteLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const location = useLocation()

  useKeyboardShortcuts({
    onOpenShortcutsHelp: () => setShortcutsOpen(true),
    onOpenSearch: () => setSearchOpen(true),
  })

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  const isFocusModeRoute =
    (location.pathname.startsWith('/learn/') && location.pathname.split('/').filter(Boolean).length >= 3) ||
    location.pathname.startsWith('/quiz/')
  const hideChrome = isAuthRoute || isFocusModeRoute

  // Global Ctrl+K / Cmd+K and custom event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }

    const handleOpenCustom = () => setSearchOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search-palette', handleOpenCustom)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search-palette', handleOpenCustom)
    }
  }, [])

  const handleAskSamvidhanFromSearch = (query: string) => {
    window.dispatchEvent(new CustomEvent('open-ask-samvidhan', { detail: { query } }))
  }

  return (
    <div className={`site-shell ${isAuthRoute ? 'is-auth-page-shell' : ''}`}>
      {/* Cold start wake-up banner for free-tier backend */}
      <ColdStartBanner />

      {/* Pattern 20: Offline Banner with automatic sync indicator */}
      <OfflineBanner />

      {/* Whole-page interactive ambient cursor spotlight */}
      <GlobalCursorGlow />
      {/* Route-level progress bar on navigation */}
      <RouteProgressBar />

      {/* Accessible skip link */}
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Top Navbar (Hidden on auth & focus mode lesson/quiz pages) */}
      {!hideChrome && <SiteNavbar onOpenSearch={() => setSearchOpen(true)} />}

      {/* Main Content Viewport with Error Boundary */}
      <main id="main" className={`site-main ${isAuthRoute ? 'auth-fullscreen-main' : ''} ${isFocusModeRoute ? 'lesson-focus-main' : ''}`} tabIndex={-1}>
        <ErrorBoundary scope="Page Content">
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Site Footer (Hidden on auth & focus mode) */}
      {!hideChrome && <SiteFooter />}

      {/* Mobile Bottom Tab Bar (Hidden on auth & focus mode) */}
      {!hideChrome && <MobileTabBar />}

      {/* Ask Samvidhan Floating Assistant (Hidden in focus mode) */}
      {!isFocusModeRoute && <AskSamvidhanLauncher />}

      {/* Command Palette Search Modal */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAskSamvidhan={handleAskSamvidhanFromSearch}
      />

      {/* Global Keyboard Shortcuts Help Modal (Pattern 13) */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Global Notification Toasts */}
      <Toasts />
    </div>
  )
}

export function LearnFrame({ children }: { children: ReactNode }) {
  return (
    <div className="container app-shell-layout">
      {children}
    </div>
  )
}
