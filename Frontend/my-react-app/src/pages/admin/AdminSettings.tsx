import { useState } from 'react'
import { Check } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { ambedkarQuotes } from '../../data/mock/quotes'

export function AdminSettings() {
  const [flags, setFlags] = useState(() => adminService.getFeatureFlags())
  const [quotes] = useState(() => [...ambedkarQuotes])
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleToggle = (key: string) => {
    const updated: Record<string, boolean> = { ...flags, [key]: !flags[key] }
    setFlags(updated)
    adminService.updateFeatureFlags(updated)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2400)
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">System Configuration</span>
          <h1 className="admin-page-title">Site Settings &amp; Feature Flags</h1>
          <p className="admin-subtext">Toggle global gamification flags, manage Ambedkar quote citations, and assistant settings.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="admin-toast-banner" role="alert">
          <Check size={16} />
          <span>Settings saved and applied to platform!</span>
        </div>
      )}

      {/* Feature Flags Grid */}
      <div className="admin-subpanel samvidhan-glow-card" style={{ marginBottom: '2rem' }}>
        <h3 className="subpanel-title">Global Feature Flags</h3>
        <p className="subpanel-desc">Enable or disable gamification and interaction modules in real-time:</p>

        <div className="settings-flags-list">
          {[
            {
              id: 'mascotEnabled',
              label: 'Nyay Guide Mascot',
              desc: 'Displays the friendly constitutional guide in lessons, onboarding, and milestones.',
              enabled: flags.mascotEnabled,
            },
            {
              id: 'audioEffects',
              label: 'Synthesized Web Audio Effects',
              desc: 'Chimes on correct answers, thud on mistakes, and fanfare on completion.',
              enabled: flags.audioEffects,
            },
            {
              id: 'leaderboards',
              label: 'Weekly Friendly Leaderboard',
              desc: 'Opt-in anonymous leaderboard with citizen handles.',
              enabled: flags.leaderboards,
            },
            {
              id: 'citationEnforcement',
              label: 'Strict Legal Citation Gatekeeper',
              desc: 'Prevents editors and reviewers from publishing lessons without a verified statutory citation.',
              enabled: flags.citationEnforcement,
            },
          ].map((flag) => (
            <div key={flag.id} className="flag-row-item">
              <div className="flag-meta">
                <strong className="flag-title">{flag.label}</strong>
                <p className="flag-desc">{flag.desc}</p>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${flag.enabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleToggle(flag.id)}
              >
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dr. Ambedkar Quotes Management */}
      <div className="admin-subpanel samvidhan-glow-card">
        <h3 className="subpanel-title">Constituent Assembly Quotes Carousel</h3>
        <p className="subpanel-desc">Hero codex quotes with verified Constituent Assembly Debates (CAD) citations:</p>

        <div className="quotes-mgmt-list">
          {quotes.map((q, idx) => (
            <div key={q.id} className="quote-mgmt-item">
              <span className="quote-mgmt-num">Slide {idx + 1} &bull; {q.date}</span>
              <p className="quote-mgmt-text">"{q.text}"</p>
              <div className="quote-mgmt-cite">
                <strong>Source:</strong> {q.source} &bull; {q.context}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
