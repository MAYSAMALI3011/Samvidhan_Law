import { useState } from 'react'
import { Copy, Check, Gift, Share2, Sparkles, ShieldCheck } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useAppState } from '../../context/useAppState'
import { BackButton } from '../../components/common/BackButton'
import { MorMascot } from '../../components/mascot/MorMascot'

export function ReferralPage() {
  const { user, pushToast } = useAppState()
  const [copied, setCopied] = useState(false)

  usePageMeta({
    title: 'Invite Friends & Earn Rewards — Samvidhan',
    description: 'Share constitutional literacy with your peers. Earn streak freezes and free Pro days.',
    path: '/refer',
  })

  const referralCode = user?.name ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 6) + '2026' : 'CITIZEN2026'
  const inviteUrl = `${window.location.origin}/signup?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    pushToast('Referral link copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Learn the Constitution with me on Samvidhan',
          text: 'Master your fundamental rights and everyday legal safeguards with structured interactive lessons.',
          url: inviteUrl,
        })
        .catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <div className="container page-hero" style={{ maxWidth: '48rem' }}>
      <BackButton to="/dashboard" label="Back to Dashboard" />

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <MorMascot mood="celebrating" size={100} />
        </div>
        <p className="kicker">Civic Growth Program</p>
        <h1 style={{ fontSize: '2.4rem', margin: '0.25rem 0 0.75rem' }}>Invite Friends, Strengthen the Republic</h1>
        <p className="muted" style={{ fontSize: '1.1rem', maxWidth: '36rem', margin: '0 auto' }}>
          Give your friends access to verified constitutional education. Earn streak shields and free Pro access when they complete their first module.
        </p>
      </div>

      {/* Shareable Link Box */}
      <div className="panel samvidhan-glow-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
          Your Personal Invitation Link
        </h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Share this unique link via WhatsApp, Telegram, or social feeds.
        </p>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(176, 141, 87, 0.35)',
              color: 'var(--gold)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inviteUrl}
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button type="button" className="btn btn-secondary" onClick={handleShare}>
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Reward Milestone Ladder */}
      <div className="panel samvidhan-glow-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
          Referral Milestones &amp; Rewards
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} className="text-gold" />
              <strong style={{ fontSize: '1rem' }}>1 Friend Joined</strong>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              +1 Free Streak Freeze shield to protect your learning habit.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: 'rgba(176, 141, 87, 0.1)',
              border: '1px solid rgba(176, 141, 87, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Gift size={20} className="text-gold" />
              <strong style={{ fontSize: '1rem' }}>3 Friends Joined</strong>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              Unlock 14 Days of Samvidhan Pro with unlimited AI queries.
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={20} className="text-gold" />
              <strong style={{ fontSize: '1rem' }}>5 Friends Joined</strong>
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              Founding Civic Ambassador badge &amp; permanent landmark access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
