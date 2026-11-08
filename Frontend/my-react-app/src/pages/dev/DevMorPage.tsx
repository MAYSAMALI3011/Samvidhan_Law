import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { Mor, MorSays } from '../../components/mascot/Mor'
import { morQueue } from '../../components/mascot/morQueue'
import type { MorMood, MorSize } from '../../components/mascot/Mor'
import { MorLogoMono } from '../../components/mascot/MorLogoMono'
import morCharacterSheet from '../../assets/mor/mor_character_sheet.png'
import { assetUrl } from '../../utils/assetUrl'
import { usePageMeta } from '../../hooks/usePageMeta'

const MOODS: { mood: MorMood; label: string; desc: string }[] = [
  { mood: 'wave', label: 'Wave (Mount)', desc: 'Friendly neutral standing, right wing waves on mount, holds rolled scroll.' },
  { mood: 'reading', label: 'Reading', desc: 'Perched reading open Constitution book with tracking eyes & page flip.' },
  { mood: 'celebrate', label: 'Celebrate', desc: 'Fully fanned tail with spring animation and gold confetti burst.' },
  { mood: 'thinking', label: 'Thinking', desc: 'Wing on chin, curious upward glance with pulsing question mark bubble.' },
  { mood: 'encourage', label: 'Encourage', desc: 'Thumbs-up wing bounce providing positive constitutional reinforcement.' },
  { mood: 'sleepy', label: 'Sleepy / At-Risk', desc: 'Drooping crest, closed sleepy eyes, and slow floating Z particles.' },
  { mood: 'idle', label: 'Idle Loop', desc: 'Calm breathing bob, slow blink every 3.8s, subtle crest wiggle.' },
]

export function DevMorPage() {
  const [size, setSize] = useState<MorSize>('md')
  const [animate, setAnimate] = useState(true)
  const [bgMode, setBgMode] = useState<'dark' | 'light'>('dark')

  usePageMeta({
    title: 'Mor Mascot Design Sheet — Developer Showcase',
    description: 'Character turnaround sheet and mood state gallery for Mor the Peacock.',
    path: '/dev/mor',
  })

  const triggerQueueDemo = (text: string, mood: MorMood) => {
    morQueue.say({
      id: `dev-demo-${Date.now()}`,
      text,
      mood,
      durationMs: 4500,
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgMode === 'dark' ? '#0B1426' : '#F8FAFC',
        color: bgMode === 'dark' ? '#F8FAFC' : '#0F172A',
        padding: '3rem 1.5rem',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '68rem', margin: '0 auto' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#B08D57',
            marginBottom: '1.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B08D57', fontWeight: 700 }}>
              Mascot Design System
            </span>
            <h1 style={{ fontSize: '2.4rem', margin: '0.25rem 0 0.5rem', fontFamily: 'serif' }}>
              Mor the Peacock
            </h1>
            <p style={{ margin: 0, opacity: 0.8, maxWidth: '38rem', fontSize: '1rem', lineHeight: '1.5' }}>
              Friendly young Indian peacock mascot for Samvidhan. Flat vector illustration with soft shading, clean outlines, rounded shapes, expressive eyes, and 3-feather gold crest.
            </p>
          </div>

          {/* Interactive Controls Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              background: bgMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(176,141,87,0.3)',
            }}
          >
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setBgMode((b) => (b === 'dark' ? 'light' : 'dark'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #B08D57',
                background: bgMode === 'dark' ? '#1E293B' : '#FFFFFF',
                color: bgMode === 'dark' ? '#FDE047' : '#0F172A',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {bgMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{bgMode === 'dark' ? 'Light Preview' : 'Dark Preview'}</span>
            </button>

            {/* Size Selector */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.15)', padding: '2px', borderRadius: '8px' }}>
              {(['sm', 'md', 'lg'] as MorSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: size === s ? '#B08D57' : 'transparent',
                    color: size === s ? '#0B1426' : 'inherit',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                  }}
                >
                  {String(s).toUpperCase()}
                </button>
              ))}
            </div>

            {/* Animation Toggle */}
            <button
              type="button"
              onClick={() => setAnimate((a) => !a)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #B08D57',
                background: animate ? '#B08D57' : 'transparent',
                color: animate ? '#0B1426' : 'inherit',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}
            >
              Motion: {animate ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Global MorSays Bubble Demo Banner */}
        <div
          style={{
            marginBottom: '3rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: bgMode === 'dark' ? '#111E38' : '#FFFFFF',
            border: '1.5px solid #DFBA73',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <MorSays message="Nice work! Article 14 (Right to Equality) done." mood="encourage" size="md" />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Speech-Bubble Queue API (&lt;MorSays&gt;)</strong>
              <span style={{ fontSize: '0.84rem', opacity: 0.8 }}>
                Queued, auto-dismissing, session-aware speech bubble helper. Only one message shows at a time.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => triggerQueueDemo('Streak protected! 4 days and counting!', 'celebrate')}
              style={{ borderColor: '#B08D57', color: '#DFBA73' }}
            >
              Test Streak Bubble
            </button>
            <button
              type="button"
              className="btn btn-sm btn-gold"
              onClick={() => triggerQueueDemo('Did you know? The Constitution was entirely handwritten in calligraphy.', 'reading')}
            >
              Test Fact Bubble
            </button>
          </div>
        </div>

        {/* 6 Poses + Idle Grid */}
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', fontFamily: 'serif' }}>
          Mascot Poses & Expressions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {MOODS.map(({ mood, label, desc }) => (
            <div
              key={mood}
              style={{
                borderRadius: '16px',
                background: bgMode === 'dark' ? '#0F1A30' : '#FFFFFF',
                border: '1px solid rgba(176,141,87,0.25)',
                padding: '1.75rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: bgMode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Mor mood={mood} size={size} animate={animate} />
              </div>
              <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.35rem' }}>{label}</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.75, margin: '0 0 1rem', lineHeight: '1.4' }}>{desc}</p>
              <code
                style={{
                  fontSize: '0.74rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: bgMode === 'dark' ? '#070E1C' : '#F1F5F9',
                  color: '#DFBA73',
                  fontFamily: 'monospace',
                }}
              >
                {`<Mor mood="${mood}" size="${size}" />`}
              </code>
            </div>
          ))}
        </div>

        {/* Brand & Monochromatic Variants */}
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', fontFamily: 'serif' }}>
          Emblem & Monochromatic Variants
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              borderRadius: '16px',
              background: bgMode === 'dark' ? '#0F1A30' : '#FFFFFF',
              border: '1px solid rgba(176,141,87,0.25)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <MorLogoMono size={72} color="#DFBA73" />
            </div>
            <strong style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Mor One-Color Gold</strong>
            <p style={{ fontSize: '0.8rem', opacity: 0.75, margin: '0 0 0.75rem' }}>
              Scalable vector seal for stamps, certificates, and foil prints.
            </p>
            <code>{`<MorLogoMono color="#DFBA73" />`}</code>
          </div>

          <div
            style={{
              borderRadius: '16px',
              background: bgMode === 'dark' ? '#0F1A30' : '#FFFFFF',
              border: '1px solid rgba(176,141,87,0.25)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <img
                src={assetUrl('/mor-favicon.svg')}
                alt="Mor Favicon"
                width={72}
                height={72}
                style={{ borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              />
            </div>
            <strong style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Mor Favicon (32×32)</strong>
            <p style={{ fontSize: '0.8rem', opacity: 0.75, margin: '0 0 0.75rem' }}>
              High-contrast browser tab favicon located at <code>/mor-favicon.svg</code>.
            </p>
          </div>

          <div
            style={{
              borderRadius: '16px',
              background: bgMode === 'dark' ? '#0F1A30' : '#FFFFFF',
              border: '1px solid rgba(176,141,87,0.25)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '1rem', width: '100%', maxHeight: '72px', overflow: 'hidden' }}>
              <img
                src={morCharacterSheet}
                alt="Mor Character Model Sheet"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
              />
            </div>
            <strong style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Character Model Sheet</strong>
            <p style={{ fontSize: '0.8rem', opacity: 0.75, margin: '0 0 0.75rem' }}>
              6-pose character turnaround reference located in <code>/src/assets/mor/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
