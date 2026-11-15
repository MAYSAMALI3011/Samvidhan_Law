import { useState, type KeyboardEvent } from 'react'
import { Sparkles, Flame, CheckCircle2, RotateCcw, History } from 'lucide-react'

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
      className={`flip-card-perspective-container page-tear-card-wrap ${className}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Did you know? ${isFlipped ? 'Showing answer' : 'Tap to tear page and reveal answer'}`}
    >
      <div className={`flip-card-inner page-tear-card ${isFlipped ? 'is-torn is-flipped' : ''}`}>
        {/* Back Face (Revealed Insight) */}
        <div className="flip-card-face flip-card-back page-tear-underlay">
          <div className="flip-card-header">
            <div className="flip-badge flip-badge-back">
              <History size={14} className="text-gold" aria-hidden="true" />
              <span>HISTORICAL CONSTITUTIONAL INSIGHT</span>
            </div>
            <div className="flip-action-hint">
              <RotateCcw size={14} aria-hidden="true" />
              <span>Restore page</span>
            </div>
          </div>
          <p className="flip-reveal-text page-tear-reveal-desc">{reveal}</p>
          <div className="flip-verified-stamp">
            <CheckCircle2 size={14} className="stamp-icon text-success" aria-hidden="true" />
            <span>Verified Historical Archive Record</span>
          </div>
        </div>

        {/* Front Face (Parchment Codex Page that tears away) */}
        <div className="flip-card-face flip-card-front page-tear-overlay">
          <div className="page-char-tint" aria-hidden="true" />
          <div className="flip-card-header">
            <div className="flip-badge">
              <Sparkles size={14} className="text-gold" aria-hidden="true" />
              <span>DID YOU KNOW? (TAP TO BURN &amp; TEAR)</span>
            </div>
            <div className="flip-action-hint burn-action-btn">
              <Flame size={14} className="flame-flicker-icon" aria-hidden="true" />
              <span>Tear page</span>
            </div>
          </div>
          <p className="flip-prompt-text page-tear-prompt-desc">{prompt}</p>
          <div className="flip-footer-hint">
            <span>Tap card or press Space to ignite tear line and reveal insight</span>
          </div>
          {/* Jagged Deckled Tear Edge with Burning Embers & Sparks */}
          <div className="page-burn-tear-edge" aria-hidden="true">
            <svg className="torn-edge-svg" viewBox="0 0 400 16" preserveAspectRatio="none">
              <path d="M0,0 L0,8 Q20,15 40,7 Q60,3 80,12 Q100,16 120,6 Q140,2 160,11 Q180,16 200,7 Q220,3 240,11 Q260,16 280,8 Q300,4 320,13 Q340,16 360,8 Q380,4 400,11 L400,0 Z" />
            </svg>
            <div className="ember-fire-glow-line" />
            <div className="burn-sparks">
              <span className="spark spark-1" />
              <span className="spark spark-2" />
              <span className="spark spark-3" />
              <span className="spark spark-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
