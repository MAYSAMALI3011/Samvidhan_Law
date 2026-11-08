import { Lightbulb } from 'lucide-react'

export interface SimplifyButtonProps {
  isSimplified: boolean
  onToggle: () => void
  className?: string
}

export function SimplifyButton({
  isSimplified,
  onToggle,
  className = '',
}: SimplifyButtonProps) {
  return (
    <button
      type="button"
      className={`lesson-utility-btn simplify-btn ${isSimplified ? 'is-simplified' : ''} ${className}`}
      onClick={onToggle}
      aria-pressed={isSimplified}
      title={isSimplified ? 'Show original civic explanation' : 'Simplify explanation into grade-school English'}
      aria-label={isSimplified ? 'Switch to original language' : 'Simplify explanation'}
    >
      <Lightbulb size={15} className={isSimplified ? 'text-amber-glow' : ''} aria-hidden="true" />
      <span>{isSimplified ? 'Original' : 'Simplify'}</span>
    </button>
  )
}
