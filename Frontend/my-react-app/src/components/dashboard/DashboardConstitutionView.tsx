import { ArrowRight, Landmark, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { constitutionTopics } from '../../data/mock/constitution'

export function DashboardConstitutionView() {
  return (
    <div className="dashboard-embedded-view" role="region" aria-label="Constitutional Primary Source Map">
      <div className="dashboard-view-header">
        <span className="section-eyebrow">
          <Landmark size={14} className="text-gold" aria-hidden="true" />
          Primary Source Map
        </span>
        <h2 className="dashboard-view-title">The Constitution of India</h2>
        <p className="dashboard-view-desc">
          Navigate key constitutional parts, fundamental rights, and democratic institutions. Cross-reference all principles against the official authorised text.
        </p>
      </div>

      {/* Illuminated Preamble Showcase */}
      <section className="preamble-banner samvidhan-glow-card" aria-label="The Preamble to the Constitution of India">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Landmark size={26} className="text-gold" aria-hidden="true" />
          <span className="eyebrow text-gold" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            Front Matter &middot; Sacred Foundation
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 0.75rem 0' }}>
          The Preamble
        </h3>
        <p style={{ fontStyle: 'italic', color: 'var(--text)', fontSize: '1.08rem', lineHeight: '1.8', margin: 0, opacity: 0.95 }}>
          "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;"
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Adopted by the Constituent Assembly on 26th November 1949
          </span>
          <Link
            to="/constitution/preamble"
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'var(--border)' }}
          >
            <span>Read Preamble study note</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Topics Grid */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.4rem', color: 'var(--text)', marginBottom: '1.25rem' }}>
          Constitutional Parts &amp; Landmark Precedents
        </h3>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {constitutionTopics.map((topic) => (
            <article
              key={topic.id}
              className="samvidhan-glow-card dashboard-topic-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="eyebrow text-gold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  {topic.part}
                </span>
                <h4 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '1.18rem', color: 'var(--text)', margin: '0.5rem 0 0.4rem 0' }}>
                  {topic.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                  {topic.summary}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} className="text-gold" />
                  {topic.part}
                </span>
                <Link
                  to={`/constitution/${topic.id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
                >
                  <span>Examine</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
