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
// ANIMATION TIMING TOKENS
// ============================================================================
export const AUTH_ANIMATION_TOKENS = {
  swapDuration: 0.72,
  swapEase: [0.22, 1, 0.36, 1] as const,
  cardLiftScale: 1.015,
  cardElevatedShadow: '0 28px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(176, 141, 87, 0.25)',
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

  // Sync mode with route changes (browser back/forward button navigation)
  useEffect(() => {
    const routeMode = location.pathname.includes('signup') ? 'signup' : 'login'
    if (routeMode !== mode) {
      setIsSwapping(true)
      setMode(routeMode)
      const timer = setTimeout(() => setIsSwapping(false), AUTH_ANIMATION_TOKENS.swapDuration * 1000)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, mode])

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
    setTimeout(() => setIsSwapping(false), AUTH_ANIMATION_TOKENS.swapDuration * 1000)
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
              id="tab-signin"
              aria-selected={mode === 'login'}
              aria-controls="panel-login"
              tabIndex={mode === 'login' ? 0 : -1}
              onClick={() => handleSwitchMode('login')}
              className={`auth-rail-tab-btn ${mode === 'login' ? 'is-active' : ''}`}
            >
              <LogIn size={18} aria-hidden="true" />
              <span className="auth-rail-tab-label">Sign in</span>
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

          {/* 3. True Sliding Arena: Visual Card slides horizontally via GPU transform */}
          <div className="auth-sliding-arena">
            {/* The Floating Sliding Visual Card */}
            <motion.div
              className="auth-sliding-visual-card"
              initial={false}
              animate={{
                x: prefersReducedMotion
                  ? 0
                  : mode === 'signup'
                  ? '108.5%'
                  : '0%',
                scale: isSwapping && !prefersReducedMotion ? AUTH_ANIMATION_TOKENS.cardLiftScale : 1,
                boxShadow: isSwapping && !prefersReducedMotion
                  ? AUTH_ANIMATION_TOKENS.cardElevatedShadow
                  : AUTH_ANIMATION_TOKENS.cardNormalShadow,
              }}
              transition={{
                x: {
                  duration: prefersReducedMotion ? AUTH_ANIMATION_TOKENS.reducedMotionDuration : AUTH_ANIMATION_TOKENS.swapDuration,
                  ease: AUTH_ANIMATION_TOKENS.swapEase,
                },
                scale: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
              }}
            >
              <VisualCard mode={mode} isReducedMotion={prefersReducedMotion} />
            </motion.div>

            {/* Left Slot: Signup Form Panel (Revealed when card is on Right) */}
            <div
              className={`auth-slot-panel auth-slot-left ${mode === 'signup' ? 'is-slot-active' : 'is-slot-inactive'}`}
              role="tabpanel"
              id="panel-signup"
              aria-labelledby="tab-signup"
              aria-hidden={mode !== 'signup'}
            >
              <motion.div
                initial={false}
                animate={{
                  opacity: mode === 'signup' ? 1 : 0,
                  x: mode === 'signup' ? 0 : -20,
                  pointerEvents: mode === 'signup' ? 'auto' : 'none',
                }}
                transition={{
                  duration: prefersReducedMotion ? AUTH_ANIMATION_TOKENS.reducedMotionDuration : 0.35,
                  delay: mode === 'signup' ? 0.15 : 0,
                  ease: 'easeOut',
                }}
                className="auth-slot-inner"
              >
                <SignupForm
                  isActive={mode === 'signup'}
                  onSwitchToLogin={() => handleSwitchMode('login')}
                />
              </motion.div>
            </div>

            {/* Right Slot: Login Form Panel (Revealed when card is on Left) */}
            <div
              className={`auth-slot-panel auth-slot-right ${mode === 'login' ? 'is-slot-active' : 'is-slot-inactive'}`}
              role="tabpanel"
              id="panel-login"
              aria-labelledby="tab-signin"
              aria-hidden={mode !== 'login'}
            >
              <motion.div
                initial={false}
                animate={{
                  opacity: mode === 'login' ? 1 : 0,
                  x: mode === 'login' ? 0 : 20,
                  pointerEvents: mode === 'login' ? 'auto' : 'none',
                }}
                transition={{
                  duration: prefersReducedMotion ? AUTH_ANIMATION_TOKENS.reducedMotionDuration : 0.35,
                  delay: mode === 'login' ? 0.15 : 0,
                  ease: 'easeOut',
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
