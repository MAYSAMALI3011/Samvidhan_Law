import { LogOut } from 'lucide-react'

interface ExpandingLogoutButtonProps {
  onLogout: () => void
  className?: string
}

export function ExpandingLogoutButton({ onLogout, className = '' }: ExpandingLogoutButtonProps) {
  return (
    <button
      type="button"
      className={`expanding-logout-btn ${className}`}
      onClick={onLogout}
      aria-label="Log out of session"
    >
      <div className="expanding-logout-icon-wrap" aria-hidden="true">
        <LogOut size={16} className="expanding-logout-icon" />
      </div>
      <span className="expanding-logout-text">Log Out</span>
    </button>
  )
}
