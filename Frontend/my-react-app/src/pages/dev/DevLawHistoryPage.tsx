import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, History, AlertCircle } from 'lucide-react'
import { LawHistoryTimeline } from '../../components/learning/lesson/LawHistoryTimeline'
import { devSampleLawHistory, devOriginalOnlyLawHistory } from '../../data/dev/lawHistorySample'

export function DevLawHistoryPage() {
  return (
    <div className="container reading-layout" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--brand-gold, #D4AF37)',
            marginBottom: '1rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#DC2626',
            background: 'rgba(220, 38, 38, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            marginBottom: '0.5rem',
          }}
        >
          Dev Component Testbed
        </span>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Law History Timeline Preview</h1>
        <p className="muted" style={{ fontSize: '0.95rem', margin: 0 }}>
          This route is only available in development mode (<code>import.meta.env.DEV</code>).
          It renders test fixtures to verify timeline states, wording diffs, date formats, and verified links.
        </p>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} className="text-gold" />
          <span>State 1: Multi-Entry Timeline (Sample Fixture — Default Open)</span>
        </h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
          Shows original enactment, subsequent amendment with comparative quotes, and a proposed bill with dashed styling.
        </p>
        <LawHistoryTimeline history={devSampleLawHistory} defaultOpen={true} />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} className="text-gold" />
          <span>State 2: In Force as Originally Enacted (Zero Amendments)</span>
        </h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
          Renders a non-expandable badge indicating statutory stability since founding enactment.
        </p>
        <LawHistoryTimeline history={devOriginalOnlyLawHistory} />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} className="text-muted" />
          <span>State 3: Null / Undefined History</span>
        </h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>
          When no history object is provided, the component renders strictly <code>null</code> with zero DOM footprint:
        </p>
        <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <LawHistoryTimeline history={undefined} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94A3B8)' }}>
            [Empty render verified: nothing rendered above this line]
          </span>
        </div>
      </section>
    </div>
  )
}
