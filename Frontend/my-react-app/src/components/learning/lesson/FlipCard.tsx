import { Sparkles, Flame, CheckCircle2, RotateCcw, History } from 'lucide-react'
import { BurnCard } from '../../common/BurnCard'

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
  onFlipChange,
  className = '',
}: FlipCardProps) {
  return (
    <BurnCard
      className={`did-you-know-burn-card ${className}`}
      ariaLabel="Did you know? Tap to burn parchment and reveal answer"
      onBurnChange={onFlipChange}
      front={
        <>
          <div>
            <div className="flip-card-header" style={{ marginBottom: '0.65rem' }}>
              <div className="flip-badge">
                <Sparkles size={14} className="text-gold" aria-hidden="true" />
                <span>DID YOU KNOW?</span>
              </div>
              <div className="flip-action-hint burn-action-btn">
                <Flame size={14} className="flame-flicker-icon" aria-hidden="true" />
                <span>Tap to Burn</span>
              </div>
            </div>
            <p className="flip-prompt-text page-tear-prompt-desc">{prompt}</p>
          </div>
          <div className="flip-footer-hint" style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 'auto' }}>
            <span>Tap card to burn page &amp; reveal constitutional insight</span>
          </div>
        </>
      }
      back={
        <>
          <div>
            <div className="flip-card-header" style={{ marginBottom: '0.65rem' }}>
              <div className="flip-badge flip-badge-back">
                <History size={14} className="text-gold" aria-hidden="true" />
                <span>HISTORICAL CONSTITUTIONAL INSIGHT</span>
              </div>
              <div className="flip-action-hint restore-hint">
                <RotateCcw size={14} aria-hidden="true" />
                <span>Restore page</span>
              </div>
            </div>
            <p className="flip-reveal-text page-tear-reveal-desc">{reveal}</p>
          </div>
          <div className="flip-verified-stamp" style={{ marginTop: 'auto' }}>
            <CheckCircle2 size={14} className="stamp-icon text-success" aria-hidden="true" />
            <span>Verified Historical Archive Record</span>
          </div>
        </>
      }
    />
  )
}

