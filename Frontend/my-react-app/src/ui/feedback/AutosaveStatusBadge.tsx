import { Check, Loader2, WifiOff } from 'lucide-react'
import type { AutosaveStatus } from '../../hooks/useAutosave'
import './feedback.css'

interface AutosaveStatusBadgeProps {
  status: AutosaveStatus
  className?: string
}

export function AutosaveStatusBadge({ status, className = '' }: AutosaveStatusBadgeProps) {
  if (status === 'idle') return null

  return (
    <div
      className={`autosave-badge-container is-${status} ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === 'saving' && (
        <>
          <Loader2 size={12} className="spinner" aria-hidden="true" />
          <span>Saving…</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check size={12} strokeWidth={3} aria-hidden="true" />
          <span>Saved just now</span>
        </>
      )}
      {status === 'offline' && (
        <>
          <WifiOff size={12} aria-hidden="true" />
          <span>Offline, will sync</span>
        </>
      )}
    </div>
  )
}
