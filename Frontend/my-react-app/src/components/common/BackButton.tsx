import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}

export function BackButton({ to, label = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`btn-back ${className}`}
      aria-label={`Go back: ${label}`}
    >
      <ArrowLeft size={16} aria-hidden="true" className="btn-back-icon" />
      <span>{label}</span>
    </button>
  )
}
