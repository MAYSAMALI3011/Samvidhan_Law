import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

interface FeedbackBarProps {
  status: 'correct' | 'wrong' | null
  explanation?: string
  citation?: string
  onContinue: () => void
}

export function FeedbackBar({
  status,
  explanation,
  citation,
  onContinue,
}: FeedbackBarProps) {
  if (!status) return null

  const isCorrect = status === 'correct'

  return (
    <div
      className={`duo-feedback-bar ${isCorrect ? 'is-correct' : 'is-wrong'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="duo-feedback-container">
        <div className="duo-feedback-info">
          <div className="duo-feedback-badge">
            {isCorrect ? (
              <CheckCircle2 size={28} className="feedback-icon correct-icon" aria-hidden="true" />
            ) : (
              <XCircle size={28} className="feedback-icon wrong-icon" aria-hidden="true" />
            )}
          </div>
          <div className="duo-feedback-copy">
            <h4 className="duo-feedback-title">
              {isCorrect ? 'Well done! Exactly right.' : 'Not quite. Here is why:'}
            </h4>
            {explanation && <p className="duo-feedback-explanation">{explanation}</p>}
            {citation && (
              <div className="duo-feedback-citation">
                <span className="citation-tag">Statutory Anchor:</span> {citation}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary duo-continue-btn"
          onClick={onContinue}
          autoFocus
        >
          <span>Continue</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}