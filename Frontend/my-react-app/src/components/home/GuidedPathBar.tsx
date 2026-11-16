import { Link } from 'react-router-dom'
import { BookOpen, Flame, ShieldAlert, ArrowRight } from 'lucide-react'
import { Mor } from '../mascot/Mor'

export function GuidedPathBar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section
      id="guided-journey-strip"
      className="container guided-path-section"
      aria-labelledby="guided-path-title"
      style={{ margin: '2.5rem auto 3.5rem' }}
    >
      {/* 1. Clear 3-Step Fixed Journey Header with Mor Mascot Badge */}
      <header className="section-head" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px 4px 10px',
            borderRadius: '999px',
            background: 'var(--surface-2)',
            border: '1px solid var(--gold-border)',
            marginBottom: '0.75rem',
          }}
        >
          <Mor mood="wave" size={24} animate decorative />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
            Mor&apos;s Guided Citizen Path
          </span>
        </div>

        <h2 id="guided-path-title" className="section-title">
          Follow these 3 steps &mdash; no guessing needed
        </h2>
        <p className="section-desc" style={{ maxWidth: '38rem', margin: '0 auto' }}>
          Start with Step 1 to learn a basic right, practice what you learned in Step 2, and get practical help for real situations in Step 3.
        </p>
      </header>

      {/* 2. Three Responsive Step Cards */}
      <div
        className="guided-path-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* STEP 1 */}
        <article
          className="samvidhan-glow-card guided-step-card"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="pill pill-gold" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                STEP 01 &bull; START HERE
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(176, 141, 87, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold, #b08d57)',
                }}
              >
                <BookOpen size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text)' }}>
              Read a 3-Minute Lesson
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Start with your basic rights to equality and personal freedom in simple English. 100% free with no sign-up.
            </p>
          </div>

          <Link
            to="/learn/foundations-of-the-republic/preamble-we-the-people"
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
          >
            <span>Start Free Lesson</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </article>

        {/* STEP 2 */}
        <article
          className="samvidhan-glow-card guided-step-card"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="pill" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--surface-2)', color: 'var(--text)' }}>
                STEP 02 &bull; PRACTICE
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <Flame size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text)' }}>
              Try the Practice Card
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Touch the interactive card right below! It burns away to reveal what the law says about police questioning.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => scrollTo('interactive-lab-section')}
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
          >
            <span>Try the Card Below</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </article>

        {/* STEP 3 */}
        <article
          className="samvidhan-glow-card guided-step-card"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="pill" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--surface-2)', color: 'var(--text)' }}>
                STEP 03 &bull; REAL HELP
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                }}
              >
                <ShieldAlert size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text)' }}>
              Solve a Real Situation
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Have an issue with police, landlord rent, or online scams? Follow step-by-step guides for everyday life.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => scrollTo('situations-section')}
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
          >
            <span>See Daily Situations</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  )
}
