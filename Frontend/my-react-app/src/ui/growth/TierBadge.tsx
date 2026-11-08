import { Crown, Lock } from 'lucide-react'
import { type UserTier } from '../../utils/tiers'
import './growth.css'

export interface TierBadgeProps {
  tier?: UserTier
  size?: 'sm' | 'md'
  className?: string
  onClick?: () => void
}

export function TierBadge({ tier = 'free', size = 'sm', className = '', onClick }: TierBadgeProps) {
  const isPro = tier === 'pro' || tier === 'patron'

  return (
    <button
      type="button"
      className={`tier-badge ${isPro ? 'is-pro' : 'is-free'} size-${size} ${className}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Current subscription tier: ${tier.toUpperCase()}`}
    >
      {isPro ? (
        <>
          <Crown size={size === 'sm' ? 12 : 14} className="tier-crown-icon" aria-hidden="true" />
          <span>PRO</span>
        </>
      ) : (
        <span>FREE</span>
      )}
    </button>
  )
}

export function ProGatedChip({
  label = 'PRO',
  onUnlockClick,
}: {
  label?: string
  onUnlockClick?: () => void
}) {
  return (
    <span
      className="pro-gated-chip"
      onClick={onUnlockClick}
      role={onUnlockClick ? 'button' : undefined}
      title="Requires Samvidhan Pro"
    >
      <Lock size={10} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
