import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AnimatedBackButtonProps {
  to?: string
  label?: string
  fallback?: string
}

export function AnimatedBackButton({
  to,
  label = 'Go Back',
  fallback = '/',
}: AnimatedBackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="animated-back-btn"
      aria-label={label}
    >
      <span className="animated-back-icon-wrap" aria-hidden="true">
        <ArrowLeft size={16} className="animated-back-arrow" />
      </span>
      <span className="animated-back-label">{label}</span>
    </button>
  )
}
