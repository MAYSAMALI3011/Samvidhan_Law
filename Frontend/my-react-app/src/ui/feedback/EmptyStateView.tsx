import { Link } from 'react-router-dom'
import { MorMascot, type MorMood } from '../../components/mascot/MorMascot'
import './feedback.css'

export interface SuggestionItem {
  label: string
  to: string
}

interface EmptyStateViewProps {
  title: string
  description: string
  mascotMood?: MorMood
  action?: {
    label: string
    to?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    to?: string
    onClick?: () => void
  }
  suggestions?: SuggestionItem[]
  className?: string
}

export function EmptyStateView({
  title,
  description,
  mascotMood = 'thinking',
  action,
  secondaryAction,
  suggestions,
  className = '',
}: EmptyStateViewProps) {
  return (
    <div className={`empty-state-card ${className}`} role="status">
      <div className="empty-mascot-container" aria-hidden="true">
        <MorMascot mood={mascotMood} size={110} />
      </div>

      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>

      {(action || secondaryAction) && (
        <div className="empty-action-group">
          {action && (
            action.to ? (
              <Link to={action.to} className={`btn btn-${action.variant || 'primary'}`}>
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={`btn btn-${action.variant || 'primary'}`}
              >
                {action.label}
              </button>
            )
          )}

          {secondaryAction && (
            secondaryAction.to ? (
              <Link to={secondaryAction.to} className="btn btn-secondary">
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="btn btn-secondary"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="empty-suggestions-list">
          <span className="empty-suggestions-title">Recommended starting points</span>
          <div className="empty-suggestions-pills">
            {suggestions.map((s) => (
              <Link key={s.to} to={s.to} className="suggestion-pill">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
