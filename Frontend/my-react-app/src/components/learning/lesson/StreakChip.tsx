import { Flame } from 'lucide-react'

export interface StreakChipProps {
  streak: number
  className?: string
}

export function StreakChip({ streak, className = '' }: StreakChipProps) {
  return (
    <div
      className={`lesson-stat-chip streak-chip ${className}`}
      title={`Daily civic streak: ${streak} day${streak === 1 ? '' : 's'}`}
      tabIndex={0}
      role="status"
      aria-label={`Daily streak: ${streak} days`}
    >
      <Flame size={16} className="chip-icon streak-flame-icon" aria-hidden="true" />
      <span className="chip-value">{streak}</span>
    </div>
  )
}
