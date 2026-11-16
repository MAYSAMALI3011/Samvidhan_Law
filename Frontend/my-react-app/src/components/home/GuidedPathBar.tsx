import { Link } from 'react-router-dom'
import { BookOpen, Flame, ShieldAlert, ArrowRight, Sparkles, Compass } from 'lucide-react'
import { startPeacockTour } from '../mascot/peacockTourEvents'
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
      {/* 1. Peacock Guide Callout Banner */}
      <div
        className="guided-path-tour-banner samvidhan-glow-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          padding: '1.25rem 1.75rem',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(28, 41, 65, 0.95))',
          border: '1.5px solid var(--gold-border, rgba(176, 141, 87, 0.4))',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
          <div style={{ flexShrink: 0 }}>
            <Mor mood="wave" size={54} animate decorative />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span className="pill pill-gold" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.06em' }}>
                <Sparkles size={11} aria-hidden="true" />
                PEACOCK GUIDE
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Feeling lost or new here?</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Let Mor the Peacock show you where to click and how the website works in just 1 minute.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={startPeacockTour}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.55rem 1.25rem' }}
        >
          <Compass size={16} aria-hidden="true" />
          <span>Take 1-Minute Tour with Mor</span>
        </button>
      </div>

      {/* 2. Clear 3-Step Fixed Journey */}
      <header className="section-head" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={13} className="text-gold" aria-hidden="true" />
          Your Simple 3-Step Path
        </span>
        <h2 id="guided-path-title" className="section-title">
          Follow these 3 steps — no guessing needed
        </h2>
        <p className="section-desc" style={{ maxWidth: '38rem', margin: '0 auto' }}>
          Start with Step 1, test what you learned in Step 2, and find help for real situations in Step 3.
        </p>
      </header>

      <div
        className="guided-path-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(176, 141, 87, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold, #dfba73)',
                }}
              >
                <BookOpen size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600 }}>
              Read a 3-Minute Lesson
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Start with your basic rights to equality and personal freedom in simple English. 100% free with no sign-up.
            </p>
          </div>

          <Link
            to="/learn/foundations-of-the-republic/preamble-we-the-people"
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
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
              <span className="pill" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' }}>
                STEP 02 &bull; PRACTICE
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171',
                }}
              >
                <Flame size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600 }}>
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
            style={{ width: '100%', justifyContent: 'center' }}
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
              <span className="pill" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' }}>
                STEP 03 &bull; REAL HELP
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <ShieldAlert size={18} aria-hidden="true" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.18rem', margin: '0 0 0.5rem', fontWeight: 600 }}>
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
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>See Daily Situations</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  )
}
