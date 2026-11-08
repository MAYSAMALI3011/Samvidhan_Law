import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Landmark } from 'lucide-react'
import { ambedkarQuotes } from '../../data/mock/quotes'

export function HeroCodexCard() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 })

  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const isReducedMotion = useRef(false)

  useEffect(() => {
    isReducedMotion.current =
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('reduced-motion'))
  }, [])

  const nextQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % ambedkarQuotes.length)
  }, [])

  const prevQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev - 1 + ambedkarQuotes.length) % ambedkarQuotes.length)
  }, [])

  // Auto-advance quotes every 8s unless paused
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      nextQuote()
    }, 8000)
    return () => clearInterval(timer)
  }, [isPaused, nextQuote])

  // Desktop 3D Tilt + Radial Glow Cursor Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion.current || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -2.5
    const rotateY = ((x - centerX) / centerX) * 2.5
    setTilt({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setMousePos(null)
    setTilt({ rotateX: 0, rotateY: 0 })
    setIsPaused(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (diff > 40) {
      nextQuote()
    } else if (diff < -40) {
      prevQuote()
    }
    touchStartX.current = null
  }

  const currentQuote = ambedkarQuotes[quoteIndex] || ambedkarQuotes[0]

  return (
    <div
      ref={cardRef}
      className="hero-codex-card hero-quotes-only-card samvidhan-glow-card"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
      aria-label="Dr. B.R. Ambedkar Constitutional Wisdom"
    >
      {/* Radial Cursor-following Border Glow */}
      {mousePos && (
        <div
          className="card-cursor-glow"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Header: Badge & Date on single line */}
      <div className="quotes-card-topbar">
        <div className="codex-cad-badge">
          <Landmark size={14} className="text-gold" aria-hidden="true" />
          <span>CONSTITUENT ASSEMBLY</span>
        </div>
      </div>

      {/* Main Quote Content Viewport */}
      <div className="quotes-slide-viewport" key={currentQuote.id}>
        <div className="codex-gold-quote-mark" aria-hidden="true">
          &ldquo;
        </div>

        <blockquote className="codex-quote-body">
          <p className="codex-quote-text">
            &ldquo;{currentQuote.text}&rdquo;
          </p>
        </blockquote>

        <div className="codex-gold-divider" aria-hidden="true" />

        {/* Author Footer */}
        <div className="codex-author-footer">
          <div className="codex-avatar-seal" aria-hidden="true">
            <span className="codex-seal-monogram">BA</span>
          </div>
          <div className="codex-author-meta">
            <div className="codex-author-name">{currentQuote.speaker}</div>
            <div className="codex-author-role">{currentQuote.role || 'Chairman, Drafting Committee'}</div>
            <div className="codex-author-date">
              {currentQuote.context}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls & 8-second Progress Countdown Bar */}
      <div className="codex-bottom-controls">
        <div className="codex-controls-left">
          <button
            type="button"
            className="codex-arrow-btn"
            onClick={prevQuote}
            aria-label="Previous quote"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="codex-arrow-btn"
            onClick={nextQuote}
            aria-label="Next quote"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          {/* Quote Dots */}
          <div className="codex-nav-dots" aria-label="Quotes navigation">
            {ambedkarQuotes.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                className={`codex-dot ${idx === quoteIndex ? 'is-active' : ''}`}
                onClick={() => {
                  setQuoteIndex(idx)
                }}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        
      </div>
    </div>
  )
}
