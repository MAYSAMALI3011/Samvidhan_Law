import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader } from '../../ui/loaders/Loader'
import { ArrowLeft, BookOpen, Sparkles, RefreshCw, Activity, Sun, Moon, Maximize2 } from 'lucide-react'

export function DevLoadersPage() {
  const [fullscreenVariant, setFullscreenVariant] = useState<'book' | 'words' | null>(null)
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark')
  const [cradleSize, setCradleSize] = useState<number>(36)
  const [pulseCaption, setPulseCaption] = useState('Syncing Constitutional Data…')
  const [wordList, setWordList] = useState('Articles, Judgments, Amendments, Statutes, Safeguards')

  const words = wordList.split(',').map((w) => w.trim()).filter(Boolean)

  const toggleTheme = () => {
    const next = previewTheme === 'dark' ? 'light' : 'dark'
    setPreviewTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--canvas)',
        color: 'var(--text)',
        padding: '2.5rem 1.5rem 6rem',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Theme Preview: <strong>{previewTheme.toUpperCase()}</strong>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              aria-label="Toggle preview theme"
            >
              {previewTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>Switch to {previewTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} className="text-gold" />
            Design System Components
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading, Georgia, serif)', fontSize: '2.4rem', margin: '0.5rem 0 0.75rem' }}>
            Unified &lt;Loader /&gt; System
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: 0 }}>
            Accessible, token-styled loading states with automatic dark/light theme switching and prefers-reduced-motion support.
          </p>
        </div>

        {/* Showcase Grid of 4 Variants */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Variant 1: Book */}
          <div
            className="samvidhan-glow-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} className="text-gold" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>variant=&quot;book&quot;</h3>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Route / App Suspense
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Uiverse &ldquo;Nawsome&rdquo; 3D perspective page-flip with navy leather covers and gold fold illumination.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
              <Loader variant="book" caption="Opening the Constitution…" />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setFullscreenVariant('book')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Maximize2 size={14} />
                <span>Test Fullscreen Overlay</span>
              </button>
            </div>
          </div>

          {/* Variant 2: Words */}
          <div
            className="samvidhan-glow-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={18} className="text-gold" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>variant=&quot;words&quot;</h3>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  AI / Search Thinking
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Uiverse &ldquo;kennyotsu&rdquo; rotating words with vertical viewport scroll and top/bottom opacity fade.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
              <Loader variant="words" label="Searching" words={words} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={wordList}
                onChange={(e) => setWordList(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                placeholder="Comma separated words"
              />
            </div>
          </div>

          {/* Variant 3: Newton's Cradle */}
          <div
            className="samvidhan-glow-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} className="text-gold" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>variant=&quot;cradle&quot;</h3>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Inline / Button Loading
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Uiverse &ldquo;dovatgabriel&rdquo; Newton&apos;s cradle with elastic pendulum dots for buttons and inline widgets.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem 1rem' }}>
              <Loader variant="cradle" size={cradleSize} />
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', pointerEvents: 'none' }}
              >
                <span>Submitting Ballot</span>
                <Loader variant="cradle" size={20} color="#070E1A" />
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size ({cradleSize}px):</span>
              <input
                type="range"
                min="18"
                max="64"
                value={cradleSize}
                onChange={(e) => setCradleSize(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--gold)' }}
              />
            </div>
          </div>

          {/* Variant 4: Heartbeat Pulse */}
          <div
            className="samvidhan-glow-card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} className="text-gold" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>variant=&quot;pulse&quot;</h3>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Network Sync / Polling
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Uiverse &ldquo;milley69&rdquo; glowing ECG heartbeat polyline with dash-offset sweep for sync and reconnect status.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
              <Loader variant="pulse" caption={pulseCaption} size={72} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <input
                type="text"
                value={pulseCaption}
                onChange={(e) => setPulseCaption(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                placeholder="Caption text"
              />
            </div>
          </div>
        </div>

        {/* Fullscreen Overlay Test Modal */}
        {fullscreenVariant && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
            <Loader
              variant={fullscreenVariant}
              caption="Loading Samvidhan Civic Hub…"
              fullscreen
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setFullscreenVariant(null)}
              style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 10001,
              }}
            >
              Close Fullscreen Preview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default DevLoadersPage
