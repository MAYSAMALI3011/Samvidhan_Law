import { useState, useEffect } from 'react'
import { Mor } from '../../components/mascot/Mor'
import './loaders.css'

export interface LoaderProps {
  variant?: 'book' | 'words' | 'cradle' | 'pulse'
  caption?: string
  label?: string
  words?: string[]
  size?: number | string
  color?: string
  fullscreen?: boolean
  delayMs?: number
  minVisibleMs?: number
  className?: string
}

const defaultWords = ['Articles', 'Judgments', 'Amendments', 'Statutes']

// Simple 90x120 SVG Page with subtle rounded borders & gold/slate text lines
function PageSvg() {
  return (
    <svg
      width="90"
      height="120"
      viewBox="0 0 90 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="90" height="120" rx="6" fill="currentColor" />
      {/* Decorative text lines */}
      <rect x="12" y="18" width="45" height="4" rx="2" fill="var(--gold, #B08D57)" opacity="0.65" />
      <rect x="12" y="30" width="66" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      <rect x="12" y="40" width="60" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      <rect x="12" y="50" width="64" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      <rect x="12" y="60" width="55" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      <rect x="12" y="70" width="62" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      <rect x="12" y="80" width="40" height="3" rx="1.5" fill="var(--gold, #B08D57)" opacity="0.3" />
      {/* Little emblem circle on bottom corner */}
      <circle cx="72" cy="100" r="5" fill="var(--gold, #B08D57)" opacity="0.4" />
    </svg>
  )
}

export function Loader({
  variant = 'book',
  caption,
  label = 'Searching',
  words = defaultWords,
  size,
  color,
  fullscreen = false,
  delayMs = 0,
  className = '',
}: LoaderProps) {
  const [shouldRender, setShouldRender] = useState(delayMs === 0)

  // Anti-flicker delay (e.g. 300ms)
  useEffect(() => {
    if (delayMs === 0) {
      setShouldRender(true)
      return
    }
    const timer = setTimeout(() => setShouldRender(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  if (!shouldRender) return null

  // Ensure words array has seamless repeat: first word appended to end
  const seamlessWords = words.length > 0 ? [...words, words[0]] : ['Items', 'Items']
  const wordsDuration = Math.max(3, words.length * 1.25)

  const content = (
    <div
      className={`samvidhan-loader-root variant-${variant} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        {caption || label || 'Loading content…'}
      </span>

      {/* 1. BOOK VARIANT (Uiverse "Nawsome" Page-Flip Book) */}
      {variant === 'book' && (
        <div className="book-loader-container" aria-hidden="true">
          <div className="nawsome-book">
            <div className="book-spine">
              <ul>
                <li><PageSvg /></li>
                <li><PageSvg /></li>
                <li><PageSvg /></li>
                <li><PageSvg /></li>
                <li><PageSvg /></li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <Mor mood="idle" size={42} decorative />
              <span className="book-caption">
                {caption || 'Opening the Constitution…'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. WORDS VARIANT (Uiverse "kennyotsu" Rotating Words) */}
      {variant === 'words' && (
        <div className="words-loader-card" aria-hidden="true">
          <div className="words-loader-inner">
            <p className="words-loader-label">{label}</p>
            <div className="words-window">
              {seamlessWords.map((w, idx) => (
                <span
                  key={idx}
                  className="rotating-word"
                  style={{
                    animationDuration: `${wordsDuration}s`,
                    animationIterationCount: 'infinite',
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. NEWTON'S CRADLE VARIANT (Uiverse "dovatgabriel") */}
      {variant === 'cradle' && (
        <div
          className="newtons-cradle"
          aria-hidden="true"
          style={{
            '--uib-size': size ? (typeof size === 'number' ? `${size}px` : size) : '24px',
            '--uib-color': color || 'var(--gold, #B08D57)',
          } as React.CSSProperties}
        >
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
          <div className="newtons-cradle__dot" />
        </div>
      )}

      {/* 4. HEARTBEAT PULSE VARIANT (Uiverse "milley69") */}
      {variant === 'pulse' && (
        <div
          className="pulse-loader-wrap"
          aria-hidden="true"
          style={{ width: size || 64, height: size ? Number(size) / 2.5 : 26 }}
        >
          <svg
            className="pulse-svg"
            viewBox="0 0 64 26"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              id="pulse-back"
              points="0,13 18,13 22,2 28,24 34,7 38,18 42,13 64,13"
              style={{ stroke: color || 'var(--gold, #B08D57)' }}
            />
            <polyline
              id="pulse-front"
              points="0,13 18,13 22,2 28,24 34,7 38,18 42,13 64,13"
              style={{ stroke: color || 'var(--gold, #B08D57)' }}
            />
          </svg>
          {caption && <span className="pulse-caption">{caption}</span>}
        </div>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fullscreen-loader-overlay" role="dialog" aria-modal="true" aria-label="Loading page">
        {content}
      </div>
    )
  }

  return content
}
