import { Zap } from 'lucide-react'

export interface XpChipProps {
  amount?: number
  className?: string
}

export function XpChip({ amount = 15, className = '' }: XpChipProps) {
  return (
    <div
      className={`lesson-stat-chip xp-chip ${className}`}
      title={`Earn +${amount} Civic XP upon lesson completion`}
      tabIndex={0}
      role="status"
      aria-label={`Lesson reward: +${amount} XP`}
    >
      <Zap size={15} className="chip-icon xp-zap-icon" aria-hidden="true" />
      <span className="chip-value">+{amount} XP</span>
    </div>
  )
}
