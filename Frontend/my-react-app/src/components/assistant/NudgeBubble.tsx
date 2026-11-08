import { X, Sparkles } from 'lucide-react'

interface NudgeBubbleProps {
  question: string
  onOpen: () => void
  onDismiss: () => void
}

export function NudgeBubble({ question, onOpen, onDismiss }: NudgeBubbleProps) {
  return (
    <aside className="nudge-bubble-card" role="status" aria-label="Suggested legal inquiry">
      <div className="nudge-bubble-header">
        <span className="nudge-badge">
          <Sparkles size={12} aria-hidden="true" />
          Suggested Question
        </span>
        <button
          type="button"
          className="nudge-close-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          aria-label="Dismiss suggestion"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        className="nudge-question-btn"
        onClick={onOpen}
      >
        &ldquo;{question}&rdquo;
      </button>
    </aside>
  )
}
