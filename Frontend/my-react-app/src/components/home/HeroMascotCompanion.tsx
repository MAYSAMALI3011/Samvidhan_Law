import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Mor, type MorMood } from '../mascot/Mor'
import { useAppState } from '../../context/useAppState'
import { Sparkles, BookOpen, Scale, MessageSquare, X } from 'lucide-react'

export function HeroMascotCompanion() {
  const { progress } = useAppState()
  const [mood, setMood] = useState<MorMood>('wave')
  const [dismissed, setDismissed] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle interactive pointer-follow on desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
    setTilt({ x, y })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setMood('idle')
  }

  const handleMascotTap = () => {
    // Cycle delightful mood poses on tap
    const moods: MorMood[] = ['wave', 'celebrate', 'thinking', 'reading', 'encourage']
    const next = moods[(moods.indexOf(mood) + 1) % moods.length]
    setMood(next)
  }

  // Return null cleanly if user disabled mascot in settings
  if (progress?.mascotEnabled === false) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="hero-mascot-companion-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Mor the Constitutional Guide"
    >
      <div
        className="hero-mascot-interactive-box"
        style={{
          transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        {/* Interactive Tap-able Mascot Avatar */}
        <div
          className="hero-mascot-avatar-col"
          onClick={handleMascotTap}
          title="Click Mor to see different poses!"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMascotTap()
            }
          }}
          aria-label="Interactive guide character. Tap to interact."
        >
          <Mor mood={mood} size={74} animate decorative />
        </div>

        {/* Mascot Speech Bubble & Interactive Route Chips */}
        <div className="hero-mascot-dialog-col">
          {!dismissed && (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold, #dfba73)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} aria-hidden="true" />
                  Guide Companion
                </span>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss guide message"
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
              <p className="hero-mascot-speech-text">
                &ldquo;Namaste! Choose where you&apos;d like to start your constitutional journey today:&rdquo;
              </p>
            </div>
          )}

          {/* Direct Quick-Choice Action Chips */}
          <div className="hero-mascot-chips-row" role="group" aria-label="Quick constitutional navigation">
            <Link
              to="/learn"
              className="hero-mascot-chip"
              onMouseEnter={() => setMood('reading')}
              onMouseLeave={() => setMood('idle')}
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>The Constitution</span>
            </Link>
            <Link
              to="/learn/fundamental-rights-in-practice"
              className="hero-mascot-chip"
              onMouseEnter={() => setMood('encourage')}
              onMouseLeave={() => setMood('idle')}
            >
              <Scale size={14} aria-hidden="true" />
              <span>Know My Rights</span>
            </Link>
            <Link
              to="/ask"
              className="hero-mascot-chip"
              onMouseEnter={() => setMood('thinking')}
              onMouseLeave={() => setMood('idle')}
            >
              <MessageSquare size={14} aria-hidden="true" />
              <span>Ask a Question</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
