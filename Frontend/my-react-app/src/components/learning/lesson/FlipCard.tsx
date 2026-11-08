import { useState, type KeyboardEvent } from 'react'
import { Sparkles, RotateCw, CheckCircle2, History } from 'lucide-react'

export interface FlipCardProps {
  prompt: string
  reveal: string
  isFlipped?: boolean
  onFlipChange?: (flipped: boolean) => void
  className?: string
}

export function FlipCard({
  prompt,
  reveal,
  isFlipped: controlledFlipped,
  onFlipChange,
  className = '',
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped

  const handleFlip = () => {
    const next = !isFlipped
    if (onFlipChange) {
      onFlipChange(next)
    } else {
      setInternalFlipped(next)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div
      className={`flip-card-perspective-container ${className}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Did you know? ${isFlipped ? 'Showing answer' : 'Tap to flip and reveal answer'}`}
    >
      <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Front Face */}
        <div className="flip-card-face flip-card-front">
          <div className="flip-card-header">
            <div className="flip-badge">
              <Sparkles size={14} className="text-gold" aria-hidden="true" />
              <span>DID YOU KNOW? (TAP TO FLIP)</span>
            </div>
            <div className="flip-action-hint">
              <RotateCw size={14} className="rotate-icon" aria-hidden="true" />
              <span>Flip</span>
            </div>
          </div>
          <p className="flip-prompt-text">{prompt}</p>
          <div className="flip-footer-hint">
            <span>Tap card or press Space to reveal constitutional history</span>
          </div>
        </div>

        {/* Back Face */}
        <div className="flip-card-face flip-card-back">
          <div className="flip-card-header">
            <div className="flip-badge flip-badge-back">
              <History size={14} className="text-gold" aria-hidden="true" />
              <span>HISTORICAL CONSTITUTIONAL INSIGHT</span>
            </div>
            <div className="flip-action-hint">
              <RotateCw size={14} className="rotate-icon" aria-hidden="true" />
              <span>Flip back</span>
            </div>
          </div>
          <p className="flip-reveal-text">{reveal}</p>
          <div className="flip-verified-stamp">
            <CheckCircle2 size={14} className="stamp-icon" aria-hidden="true" />
            <span>Verified Historical Archive Record</span>
          </div>
        </div>
      </div>
    </div>
  )
}
