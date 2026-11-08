import { ArrowLeft } from 'lucide-react'
import { ContinueButton } from './ContinueButton'

export interface BottomBarProps {
  cardIndex: number
  totalCards: number
  onNext: () => void
  onPrev?: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  disabledHint?: string
  className?: string
}

export function BottomBar({
  cardIndex,
  totalCards,
  onNext,
  onPrev,
  nextLabel = 'Continue',
  isNextDisabled = false,
  disabledHint,
  className = '',
}: BottomBarProps) {
  return (
    <footer className={`lesson-bottom-bar ${className}`}>
      <div className="bottom-bar-inner">
        {/* Left Side: Step Indicator & Back Button */}
        <div className="bottom-bar-left">
          {cardIndex > 0 && onPrev && (
            <button
              type="button"
              className="lesson-back-btn"
              onClick={onPrev}
              aria-label="Previous card"
              title="Go back to previous card"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="back-text">Back</span>
            </button>
          )}

          <div className="card-counter-indicator" aria-live="polite">
            <span className="card-counter-text">
              Card {cardIndex + 1} of {totalCards}
            </span>
            <div className="card-counter-dots" aria-hidden="true">
              {Array.from({ length: totalCards }).map((_, i) => (
                <span
                  key={i}
                  className={`counter-dot ${i === cardIndex ? 'is-active' : i < cardIndex ? 'is-past' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Continue Button */}
        <div className="bottom-bar-right">
          <ContinueButton
            label={nextLabel}
            onClick={onNext}
            disabled={isNextDisabled}
            disabledHint={disabledHint}
          />
        </div>
      </div>
    </footer>
  )
}
