import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react'
import { BrandMark } from '../brand/BrandMark'
import { VisualCard } from './VisualCard'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { usePageMeta } from '../../hooks/usePageMeta'

// ============================================================================
// ANIMATION TIMING TOKENS (Fine-tuned physical motion curves)
// ============================================================================
const AUTH_ANIMATION_TOKENS = {
  // Desktop: gentle acceleration and silky deceleration for natural physical travel
  desktopDuration: 0.92,
  desktopEase: [0.32, 0.04, 0.18, 1] as const,
  // Mobile: small, weighted vertical translation (bottom-to-up / up-to-bottom)
  mobileDuration: 0.72,
  mobileEase: [0.32, 0.04, 0.18, 1] as const,
  cardLiftScale: 1.012,
  cardElevatedShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(176, 141, 87, 0.22)',
  cardNormalShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.5)',
  reducedMotionDuration: 0.2,
}

interface AuthShellProps {
  initialMode?: 'login' | 'signup'
}

export function AuthShell({ initialMode = 'login' }: AuthShellProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Track mode from URL pathname
  const currentMode = location.pathname.includes('signup')
    ? 'signup'
    : location.pathname.includes('login')
    ? 'login'
    : initialMode

  const [mode, setMode] = useState<'login' | 'signup'>(currentMode)
  const [isSwapping, setIsSwapping] = useState(false)
  const isInitialMount = useRef(true)

  // Track viewport width for responsive motion mode
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false))

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reduced motion preference detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const checkMotion = () => {
      setPrefersReducedMotion(
        mediaQuery.matches || document.documentElement.classList.contains('reduced-motion')
      )
    }
    checkMotion()
    mediaQuery.addEventListener('change', checkMotion)
    return () => mediaQuery.removeEventListener('change', checkMotion)
  }, [])

  const currentDuration = isMobile
    ? AUTH_ANIMATION_TOKENS.mobileDuration
    : AUTH_ANIMATION_TOKENS.desktopDuration

  // Sync mode with route changes (browser back/forward button navigation)
  useEffect(() => {
    const routeMode = location.pathname.includes('signup') ? 'signup' : 'login'
    if (routeMode !== mode) {
      let resetTimer: ReturnType<typeof setTimeout> | undefined
      const timer = setTimeout(() => {
        setIsSwapping(true)
        setMode(routeMode)
        resetTimer = setTimeout(() => setIsSwapping(false), currentDuration * 1000)
      }, 0)
      return () => {
        clearTimeout(timer)
        if (resetTimer) clearTimeout(resetTimer)
      }
    }
  }, [location.pathname, mode, currentDuration])

  useEffect(() => {
    isInitialMount.current = false
  }, [])

  usePageMeta({
    title: mode === 'login' ? 'Log in — Samvidhan' : 'Create Free Account — Samvidhan',
    description: 'Access verified constitutional education and practical citizen safeguards on Samvidhan.',
    path: mode === 'login' ? '/login' : '/signup',
  })

  // Smooth mode switcher with URL pushState
  const handleSwitchMode = (targetMode: 'login' | 'signup') => {
    if (targetMode === mode) return
    setIsSwapping(true)
    setMode(targetMode)
    navigate(targetMode === 'login' ? '/login' : '/signup', { replace: false })
    setTimeout(() => setIsSwapping(false), currentDuration * 1000)
  }

  // Keyboard navigation for tab rail
  const handleRailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      handleSwitchMode('signup')
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      handleSwitchMode('login')
    }
  }

  // Touch swipe gesture support for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return
    const touchEnd = e.changedTouches[0]
    const deltaX = touchEnd.clientX - touchStartRef.current.x
    const deltaY = touchEnd.clientY - touchStartRef.current.y
    touchStartRef.current = null

    // Threshold of 40px for deliberate swipe gesture
    const minSwipeDistance = 40

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      // Vertical swipe: swipe up -> switch to signup, swipe down -> switch to login
      if (deltaY < 0 && mode === 'login') {
        handleSwitchMode('signup')
      } else if (deltaY > 0 && mode === 'signup') {
        handleSwitchMode('login')
      }
    } else if (Math.abs(deltaX) > minSwipeDistance) {
      // Horizontal swipe: swipe left -> switch to signup, swipe right -> switch to login
      if (deltaX < 0 && mode === 'login') {
        handleSwitchMode('signup')
      } else if (deltaX > 0 && mode === 'signup') {
        handleSwitchMode('login')
      }
    }
  }

  return (
    <div className="auth-page-viewport">
      {/* Top Chrome: Logo (links to /) & Back to home link */}
      <header className="auth-top-bar">
        <Link to="/" className="auth-brand-link" aria-label="Samvidhan Home">
          <BrandMark height={36} onDark={true} />
        </Link>
        <Link to="/" className="auth-back-home-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to home</span>
        </Link>
      </header>

      {/* Main Split-Screen Container */}
      <main className="auth-center-stage">
        <div className="auth-split-container">
          {/* 1. Slim Left Tab Rail (Desktop >= 900px) */}
          <nav
            className="auth-tab-rail"
            role="tablist"
            aria-label="Authentication modes"
            onKeyDown={handleRailKeyDown}
          >
            <button
              type="button"
              role="tab"
              id="tab-login"
              aria-selected={mode === 'login'}
              aria-controls="panel-login"
              tabIndex={mode === 'login' ? 0 : -1}
              onClick={() => handleSwitchMode('login')}
              className={`auth-rail-tab-btn ${mode === 'login' ? 'is-active' : ''}`}
            >
              <LogIn size={18} aria-hidden="true" />
              <span className="auth-rail-tab-label">Log in</span>
              {mode === 'login' && (
                <motion.div
                  layoutId="activeTabRailIndicator"
                  className="auth-rail-indicator-bar"
                  transition={{
                    type: prefersReducedMotion ? 'tween' : 'spring',
                    stiffness: 180,
                    damping: 24,
                  }}
                />
              )}
            </button>

            <button
              type="button"
              role="tab"
              id="tab-signup"
              aria-selected={mode === 'signup'}
              aria-controls="panel-signup"
              tabIndex={mode === 'signup' ? 0 : -1}
              onClick={() => handleSwitchMode('signup')}
              className={`auth-rail-tab-btn ${mode === 'signup' ? 'is-active' : ''}`}
            >
              <UserPlus size={18} aria-hidden="true" />
              <span className="auth-rail-tab-label">Sign up</span>
              {mode === 'signup' && (
                <motion.div
                  layoutId="activeTabRailIndicator"
                  className="auth-rail-indicator-bar"
                  transition={{
                    type: prefersReducedMotion ? 'tween' : 'spring',
                    stiffness: 180,
                    damping: 24,
                  }}
                />
              )}
            </button>
          </nav>

          {/* 2. Mobile Segmented Control (< 900px) */}
          <div className="auth-mobile-segmented-bar" role="tablist" aria-label="Mobile Authentication switch">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => handleSwitchMode('login')}
              className={`auth-mobile-segment-btn ${mode === 'login' ? 'is-active' : ''}`}
            >
              <span>Log in</span>
              {mode === 'login' && (
                <motion.div
                  layoutId="mobileSegmentPill"
                  className="auth-mobile-active-pill"
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => handleSwitchMode('signup')}
              className={`auth-mobile-segment-btn ${mode === 'signup' ? 'is-active' : ''}`}
            >
              <span>Sign up</span>
              {mode === 'signup' && (
                <motion.div
                  layoutId="mobileSegmentPill"
                  className="auth-mobile-active-pill"
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                />
              )}
            </button>
          </div>

          {/* 3. True Sliding Arena: Visual Card slides with organic physics */}
          <div
            className="auth-sliding-arena"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Floating Sliding Visual Card */}
            <motion.div
              key={isMobile ? `mobile-card-${mode}` : 'desktop-visual-card'}
              className="auth-sliding-visual-card"
              initial={
                prefersReducedMotion
                  ? false
                  : isMobile
                  ? { y: mode === 'signup' ? 28 : -28, opacity: 0.88, x: 0 }
                  : false
              }
              animate={
                prefersReducedMotion
                  ? { x: 0, y: 0, scale: 1, opacity: 1 }
                  : isMobile
                  ? {
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                    }
                  : {
                      x: mode === 'signup' ? '108.5%' : '0%',
                      y: 0,
                      scale: isSwapping ? AUTH_ANIMATION_TOKENS.cardLiftScale : 1,
                      boxShadow: isSwapping
                        ? AUTH_ANIMATION_TOKENS.cardElevatedShadow
                        : AUTH_ANIMATION_TOKENS.cardNormalShadow,
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: AUTH_ANIMATION_TOKENS.reducedMotionDuration }
                  : isMobile
                  ? {
                      y: {
                        duration: AUTH_ANIMATION_TOKENS.mobileDuration,
                        ease: AUTH_ANIMATION_TOKENS.mobileEase,
                      },
                      opacity: {
                        duration: AUTH_ANIMATION_TOKENS.mobileDuration,
                        ease: AUTH_ANIMATION_TOKENS.mobileEase,
                      },
                    }
                  : {
                      x: {
                        duration: AUTH_ANIMATION_TOKENS.desktopDuration,
                        ease: AUTH_ANIMATION_TOKENS.desktopEase,
                      },
                      scale: { duration: 0.35, ease: [0.32, 0.04, 0.18, 1] },
                      boxShadow: { duration: 0.35, ease: [0.32, 0.04, 0.18, 1] },
                    }
              }
            >
              <VisualCard mode={mode} isReducedMotion={prefersReducedMotion} />
            </motion.div>

            {/* Left Slot: Signup Form Panel (Revealed when card is on Right on desktop, or active on mobile) */}
            <div
              className={`auth-slot-panel auth-slot-left ${mode === 'signup' ? 'is-slot-active' : 'is-slot-inactive'}`}
              role="tabpanel"
              id="panel-signup"
              aria-labelledby="tab-signup"
              aria-hidden={mode !== 'signup'}
            >
              <motion.div
                key={isMobile ? `mobile-signup-${mode}` : 'desktop-signup'}
                initial={isMobile && mode === 'signup' ? { y: 24, opacity: 0 } : false}
                animate={
                  prefersReducedMotion
                    ? { opacity: mode === 'signup' ? 1 : 0, x: 0, y: 0 }
                    : isMobile
                    ? {
                        opacity: mode === 'signup' ? 1 : 0,
                        y: 0,
                        x: 0,
                        pointerEvents: mode === 'signup' ? 'auto' : 'none',
                      }
                    : {
                        opacity: mode === 'signup' ? 1 : 0,
                        x: mode === 'signup' ? 0 : -22,
                        y: 0,
                        pointerEvents: mode === 'signup' ? 'auto' : 'none',
                      }
                }
                transition={{
                  duration: prefersReducedMotion
                    ? AUTH_ANIMATION_TOKENS.reducedMotionDuration
                    : isMobile
                    ? 0.55
                    : 0.65,
                  delay: mode === 'signup' ? (isMobile ? 0.05 : 0.12) : 0,
                  ease: [0.32, 0.04, 0.18, 1],
                }}
                className="auth-slot-inner"
              >
                <SignupForm
                  isActive={mode === 'signup'}
                  onSwitchToLogin={() => handleSwitchMode('login')}
                />
              </motion.div>
            </div>

            {/* Right Slot: Login Form Panel (Revealed when card is on Left on desktop, or active on mobile) */}
            <div
              className={`auth-slot-panel auth-slot-right ${mode === 'login' ? 'is-slot-active' : 'is-slot-inactive'}`}
              role="tabpanel"
              id="panel-login"
              aria-labelledby="tab-login"
              aria-hidden={mode !== 'login'}
            >
              <motion.div
                key={isMobile ? `mobile-login-${mode}` : 'desktop-login'}
                initial={isMobile && mode === 'login' ? { y: -24, opacity: 0 } : false}
                animate={
                  prefersReducedMotion
                    ? { opacity: mode === 'login' ? 1 : 0, x: 0, y: 0 }
                    : isMobile
                    ? {
                        opacity: mode === 'login' ? 1 : 0,
                        y: 0,
                        x: 0,
                        pointerEvents: mode === 'login' ? 'auto' : 'none',
                      }
                    : {
                        opacity: mode === 'login' ? 1 : 0,
                        x: mode === 'login' ? 0 : 22,
                        y: 0,
                        pointerEvents: mode === 'login' ? 'auto' : 'none',
                      }
                }
                transition={{
                  duration: prefersReducedMotion
                    ? AUTH_ANIMATION_TOKENS.reducedMotionDuration
                    : isMobile
                    ? 0.55
                    : 0.65,
                  delay: mode === 'login' ? (isMobile ? 0.05 : 0.12) : 0,
                  ease: [0.32, 0.04, 0.18, 1],
                }}
                className="auth-slot-inner"
              >
                <LoginForm
                  isActive={mode === 'login'}
                  onSwitchToSignup={() => handleSwitchMode('signup')}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
