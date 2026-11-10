import { useEffect } from 'react'
import { X, Crown, Check, Sparkles, Shield, ArrowRight } from 'lucide-react'
import { setUserTier } from '../../utils/tiers'
import { useAppState } from '../../context/useAppState'
import { isMockMode } from '../../api/config'
import { createCheckoutSession } from '../../api/services/subscriptionService'
import { isValidCheckoutUrl } from '../../utils/redirect'
import { CardNumberInput } from '../../components/ui/TextFields.jsx'
import './growth.css'

export interface ProGateModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

const proPerks = [
  'Unlimited Ask Samvidhan AI constitutional queries (bypasses 5/day cap)',
  'Complete High Court & Supreme Court landmark precedents archive',
  'Offline statutory audio briefings & downloadable case study briefs',
  'Interactive Mock Citizen Bench & moot court procedure simulator',
  'Priority answers & verified statutory cross-references',
]

export function ProGateModal({ isOpen, onClose, featureName }: ProGateModalProps) {
  const { pushToast } = useAppState()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleUpgradeDemo = async () => {
    try {
      const res = await createCheckoutSession('pro')
      if (res.checkoutUrl) {
        if (isValidCheckoutUrl(res.checkoutUrl)) {
          window.location.href = res.checkoutUrl
          return
        }
        pushToast('Invalid checkout URL received from server.', 'error')
        return
      }
      setUserTier('pro')
      pushToast(res.message || 'Welcome to Samvidhan Pro! All features unlocked.', 'success')
      onClose()
    } catch {
      pushToast('Upgrade coming soon. Payment gateway integration is currently in progress.', 'info')
    }
  }

  return (
    <div
      className="pro-gate-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-gate-modal-title"
    >
      <div
        className="pro-gate-modal-panel samvidhan-glow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="pro-gate-close-btn"
          onClick={onClose}
          aria-label="Close upgrade modal"
        >
          <X size={18} />
        </button>

        <div className="pro-gate-header">
          <div className="pro-crown-badge-glow">
            <Crown size={28} className="crown-svg" aria-hidden="true" />
          </div>
          <span className="pro-kicker">SAMVIDHAN PRO</span>
          <h2 id="pro-gate-modal-title" className="pro-gate-title">
            Unlock Sovereign Mastery
          </h2>
          {featureName ? (
            <p className="pro-gate-desc">
              <strong>{featureName}</strong> is part of the Samvidhan Pro suite. Upgrade to access all advanced legal tools.
            </p>
          ) : (
            <p className="pro-gate-desc">
              Deepen your constitutional comprehension with unlimited AI queries, landmark precedence archives, and full statutory downloads.
            </p>
          )}
        </div>

        <div className="pro-pricing-card">
          <div className="pricing-left">
            <span className="plan-name">Pro Citizen Membership</span>
            <span className="plan-billing">Billed monthly · Cancel anytime</span>
          </div>
          <div className="pricing-right">
            <span className="price-val">₹299</span>
            <span className="price-sub">/month</span>
          </div>
        </div>

        <ul className="pro-perks-list" role="list">
          {proPerks.map((perk, idx) => (
            <li key={idx} className="pro-perk-item" role="listitem">
              <div className="perk-check-icon" aria-hidden="true">
                <Check size={14} />
              </div>
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        {/* Never send raw card data to your own server. In production use Razorpay/Stripe hosted fields and use this only as a styling reference. */}
        <div style={{ margin: '1.25rem 0 0.5rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Payment Method (Design Reference):
          </p>
          <CardNumberInput label="Card Details" />
        </div>

        <div className="pro-gate-actions">
          <button
            type="button"
            className="btn btn-primary pro-upgrade-btn"
            onClick={handleUpgradeDemo}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>{isMockMode() ? 'Upgrade to Pro (Demo)' : 'Upgrade to Pro'}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="pro-guarantee-note">
            <Shield size={13} aria-hidden="true" />
            <span>7-day satisfaction guarantee · Educational simulation</span>
          </p>
        </div>
      </div>
    </div>
  )
}
