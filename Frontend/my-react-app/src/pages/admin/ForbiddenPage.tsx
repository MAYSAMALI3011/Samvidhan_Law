import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'

export function ForbiddenPage() {
  return (
    <div className="container reading-layout page-hero" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="panel samvidhan-glow-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '520px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', color: 'var(--coral, #ef4444)' }}>
          <Lock size={32} />
        </div>
        <span className="section-eyebrow">403 Restricted Access</span>
        <h1 style={{ fontSize: '1.85rem', margin: '0.5rem 0 1rem' }}>Restricted Administrative Area</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
          You do not have administrative or editorial permissions to view this internal management route. Access is restricted to certified legal editors, reviewers, and system administrators.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Public Home</span>
          </Link>
          <Link to="/login" className="btn btn-primary">
            <span>Log In with Admin Account</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
