import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Flame, Shield, Landmark } from 'lucide-react'

interface VisualCardProps {
  mode: 'login' | 'signup'
  isReducedMotion?: boolean
}

export function VisualCard({ mode, isReducedMotion = false }: VisualCardProps) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const quotes = [
    {
      text: "Constitution is not a mere lawyers' document, it is a vehicle of Life, and its spirit is always the spirit of Age.",
      author: 'Dr. B.R. Ambedkar',
      source: 'Constituent Assembly speech, 25 November 1949',
    },
    {
      text: 'A Constitution is strongest when its citizens understand it.',
      author: 'Constitutional Principle',
      source: 'Foundational Civic Safeguard',
    },
  ]
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [quotes.length])

  const currentQuote = quotes[quoteIndex]

  return (
    <div className="auth-visual-card" aria-hidden="true">
      {/* Background Deep Gradient & Ambient Glows */}
      <div className="auth-card-backdrop" />

      {/* Decorative Subtle SVG Ashoka Chakra */}
      <div className="auth-chakra-wrapper" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          className="auth-ashoka-chakra-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="92" stroke="url(#goldGradient)" strokeWidth="3" opacity="0.4" />
          <circle cx="100" cy="100" r="80" stroke="url(#goldGradient)" strokeWidth="1.5" opacity="0.3" />
          <circle cx="100" cy="100" r="18" fill="url(#goldGradient)" opacity="0.6" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2="100"
                y2="20"
                stroke="url(#goldGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
                transform={`rotate(${angle} 100 100)`}
              />
            )
          })}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBA73" />
              <stop offset="50%" stopColor="#B08D57" />
              <stop offset="100%" stopColor="#8C6A38" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Ambient Particles */}
      <div className="auth-ambient-particles">
        <span className="auth-particle p1" />
        <span className="auth-particle p2" />
        <span className="auth-particle p3" />
        <span className="auth-particle p4" />
      </div>

      {/* Pillar / Court Silhouette at Bottom */}
      <div className="auth-pillars-silhouette" aria-hidden="true">
        <Landmark size={140} className="auth-pillars-icon" />
      </div>

      {/* Top Emblem Badge */}
      <div className="auth-card-top-badge">
        <Shield size={14} className="auth-badge-icon" />
        <span>SOVEREIGN CIVIC PLATFORM</span>
      </div>

      {/* Crossfading Hero Text Content */}
      <div className="auth-card-text-container">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login-content"
              initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isReducedMotion ? 0 : -8 }}
              transition={{ duration: 0.3 }}
              className="auth-card-copy-block"
            >
              <h2 className="auth-card-title">Welcome back</h2>
              <p className="auth-card-subtitle">
                Pick up your constitutional lessons and citizen safeguards right where you left off.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signup-content"
              initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isReducedMotion ? 0 : -8 }}
              transition={{ duration: 0.3 }}
              className="auth-card-copy-block"
            >
              <h2 className="auth-card-title">Join us today</h2>
              <p className="auth-card-subtitle">
                Learn your fundamental rights in simple words, a few minutes a day, verified with statutory law.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Honest Benefits with Icons */}
        <div className="auth-card-benefits-list">
          <div className="auth-benefit-item">
            <div className="auth-benefit-icon-box">
              <BookOpen size={16} />
            </div>
            <div>
              <strong>Short lessons</strong>
              <span>3-5 minute bite-sized civic reads</span>
            </div>
          </div>

          <div className="auth-benefit-item">
            <div className="auth-benefit-icon-box">
              <Sparkles size={16} />
            </div>
            <div>
              <strong>Quick quizzes</strong>
              <span>Instant feedback, no punitive lives</span>
            </div>
          </div>

          <div className="auth-benefit-item">
            <div className="auth-benefit-icon-box">
              <Flame size={16} />
            </div>
            <div>
              <strong>Keep your streak</strong>
              <span>Build everyday legal confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Dr. Ambedkar Constitutional Quote at Bottom */}
      <div className="auth-card-quote-box">
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="auth-card-quote-text">&ldquo;{currentQuote.text}&rdquo;</p>
            <div className="auth-card-quote-meta">
              <span className="auth-quote-author">{currentQuote.author}</span>
              <span className="auth-quote-dot">&bull;</span>
              <span className="auth-quote-source">{currentQuote.source}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
