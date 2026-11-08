import { ArrowRight } from 'lucide-react'

export interface ContinueButtonProps {
  label?: string
  onClick: () => void
  disabled?: boolean
  disabledHint?: string
  autoFocus?: boolean
  className?: string
}

export function ContinueButton({
  label = 'Continue',
  onClick,
  disabled = false,
  disabledHint,
  autoFocus = false,
  className = '',
}: ContinueButtonProps) {
  return (
    <div className={`continue-btn-container ${className}`}>
      <button
        type="button"
        className={`lesson-continue-btn ${disabled ? 'is-disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={label}
        title={disabled ? (disabledHint || 'Complete the card interaction to continue') : label}
      >
        <span className="btn-text">{label}</span>
        <ArrowRight size={18} className="btn-icon" aria-hidden="true" />
      </button>
      {disabled && disabledHint && (
        <span className="continue-disabled-hint" role="status">
          {disabledHint}
        </span>
      )}
    </div>
  )
}
