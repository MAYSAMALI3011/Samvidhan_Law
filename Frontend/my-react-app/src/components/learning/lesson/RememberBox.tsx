import { Bookmark, ShieldCheck } from 'lucide-react'

export interface RememberBoxProps {
  takeaway: string
  source?: string
  className?: string
}

export function RememberBox({ takeaway, source, className = '' }: RememberBoxProps) {
  return (
    <div className={`lesson-remember-box ${className}`} role="note">
      <div className="remember-box-header">
        <Bookmark size={15} className="text-gold" aria-hidden="true" />
        <span className="remember-kicker">KEY CITIZEN TAKEAWAY</span>
      </div>
      <p className="remember-body-text">{takeaway}</p>
      {source && (
        <div className="remember-source-tag">
          <ShieldCheck size={13} className="text-muted" aria-hidden="true" />
          <span>Source: {source}</span>
        </div>
      )}
    </div>
  )
}
