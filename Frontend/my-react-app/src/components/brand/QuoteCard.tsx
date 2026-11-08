import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Landmark } from 'lucide-react'
import { ambedkarQuotes } from '../../data/mock/quotes'

interface QuoteCardProps {
  variant?: 'prominent' | 'compact'
  autoRotateInterval?: number
}

export function QuoteCard({ variant = 'prominent', autoRotateInterval = 8000 }: QuoteCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  const currentQuote = ambedkarQuotes[currentIndex]

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % ambedkarQuotes.length)
  }

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + ambedkarQuotes.length) % ambedkarQuotes.length)
  }

  useEffect(() => {
    if (isPaused) return

    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ambedkarQuotes.length)
    }, autoRotateInterval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, autoRotateInterval])

  return (
    <figure
      className={`quote-card-container ${variant === 'compact' ? 'quote-card-compact' : 'quote-card-prominent'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Constituent Assembly Debates historical quote"
    >
      <div className="quote-card-inner">
        {/* Decorative Quote Mark */}
        <div className="quote-watermark-symbol" aria-hidden="true">
          ?
        </div>

        <div className="quote-header-strip">
          <div className="quote-source-tag">
            <Landmark size={14} className="quote-source-icon" aria-hidden="true" />
            <span>Constituent Assembly Debates</span>
          </div>
          <span className="quote-date-badge">{currentQuote.date}</span>
        </div>

        {/* Gold Hairline Accent Rule */}
        <div className="quote-accent-rule" aria-hidden="true" />

        {/* Quote Body with animated fade/slide */}
        <blockquote className="quote-blockquote" key={currentQuote.id}>
          <p className="quote-text">&ldquo;{currentQuote.text}&rdquo;</p>
        </blockquote>

        {/* Attribution Row */}
        <figcaption className="quote-attribution-row">
          <div className="quote-author-profile">
            {/* Monogram Seal Placeholder for Dr. B.R. Ambedkar */}
            <div className="quote-monogram-seal" aria-hidden="true" title="Dr. Bhimrao Ramji Ambedkar">
              <span>BA</span>
            </div>
            <div>
              <cite className="quote-author-name">{currentQuote.speaker}</cite>
              <div className="quote-author-role">Chairman, Drafting Committee</div>
              <div className="quote-source-detail">{currentQuote.context} • {currentQuote.source}</div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="quote-nav-controls" aria-label="Quote carousel navigation">
            <button
              type="button"
              className="quote-nav-btn"
              onClick={prevQuote}
              aria-label="Previous historical quote"
              title="Previous quote"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            <div className="quote-dots" role="tablist" aria-label="Select quote">
              {ambedkarQuotes.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  className={`quote-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Quote ${idx + 1}: ${q.date}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="quote-nav-btn"
              onClick={nextQuote}
              aria-label="Next historical quote"
              title="Next quote"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </figcaption>
      </div>
    </figure>
  )
}
