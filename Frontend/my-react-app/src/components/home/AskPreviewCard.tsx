import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'

export function AskPreviewCard() {
  return (
    <section className="ask-preview-section container" aria-labelledby="ask-preview-title" style={{ margin: '3.5rem auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(20, 30, 48, 0.85))',
          border: '1px solid rgba(176, 141, 87, 0.35)',
          borderRadius: '20px',
          padding: '2.25rem',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div>
          <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} className="text-gold" aria-hidden="true" />
            AI Civic Research Assistant
          </span>
          <h2 id="ask-preview-title" className="section-title" style={{ margin: '0.35rem 0 0.65rem' }}>
            Ask Samvidhan
          </h2>
          <p className="section-desc" style={{ margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Ask any legal question in plain everyday English. Samvidhan searches through verified statutory provisions, landmark Supreme Court rulings, and procedural guides to provide citation-backed breakdowns.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
              <span>Grounded directly in Indian statutes &amp; Constitutional articles</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
              <span>Zero legalese — clear, practical citizen explanations</span>
            </div>
          </div>

          <Link to="/ask" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
            <MessageSquare size={16} aria-hidden="true" />
            <span>Open Ask Samvidhan Assistant</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Interactive Chat Simulation Card */}
        <div
          style={{
            background: 'rgba(10, 15, 26, 0.75)',
            border: '1px solid rgba(176, 141, 87, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
          aria-label="Sample interactive query preview"
        >
          {/* User Prompt */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(176, 141, 87, 0.2)',
                border: '1px solid rgba(176, 141, 87, 0.4)',
                borderRadius: '12px 12px 2px 12px',
                padding: '0.75rem 1rem',
                fontSize: '0.88rem',
                color: '#ffffff',
                maxWidth: '85%',
              }}
            >
              &ldquo;What are my rights if stopped for questioning by police?&rdquo;
            </div>
          </div>

          {/* Assistant Grounded Answer */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--gold, #dfba73)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              S
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px 12px 12px 12px',
                padding: '0.85rem 1rem',
                fontSize: '0.86rem',
                lineHeight: 1.45,
                color: '#cbd5e1',
                flex: 1,
              }}
            >
              <p style={{ margin: '0 0 0.65rem' }}>
                Under Indian law, citizens possess statutory safeguards against unlawful restraint during police encounters:
              </p>
              <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Right to know grounds of detention immediately.</li>
                <li>Right to consult an advocate of your choice during interrogation.</li>
                <li>Women cannot be arrested after sunset or before sunrise without special judicial sanction.</li>
              </ul>

              {/* Citations Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span className="pill pill-gold" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={11} aria-hidden="true" /> Art. 22(1) Constitution
                </span>
                <span className="pill" style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  Section 41D CrPC / BNSS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
