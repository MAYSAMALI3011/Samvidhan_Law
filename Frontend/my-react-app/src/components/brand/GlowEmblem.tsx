import { useState, useRef, useEffect } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { CheckCircle2, Shield, Scale, BookOpen } from 'lucide-react'

export function GlowEmblem() {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)

  // Spring physics for mouse cursor halo
  const springX = useSpring(0, { stiffness: 120, damping: 20 })
  const springY = useSpring(0, { stiffness: 120, damping: 20 })

  useEffect(() => {
    if (shouldReduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      springX.set(x)
      springY.set(y)
    }

    const current = containerRef.current
    if (current) {
      current.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (current) {
        current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [shouldReduceMotion, springX, springY])

  return (
    <div
      ref={containerRef}
      className="glow-emblem-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        springX.set(0)
        springY.set(0)
      }}
      aria-label="Constitutional Sovereign Emblem"
    >
      {/* Dynamic Cursor-Following Gold Halo */}
      {!shouldReduceMotion && (
        <motion.div
          className="glow-emblem-halo"
          style={{
            x: springX,
            y: springY,
          }}
          animate={{
            scale: isHovered ? 1.15 : 1,
            opacity: isHovered ? 0.35 : 0.22,
          }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
      )}

      {/* Centerpiece Emblem Badge */}
      <div className="glow-emblem-card">
        {/* Ashoka Chakra & Scales of Justice SVG */}
        <div className="glow-svg-container">
          <svg
            className="glow-chakra-svg"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer Concentric Hairlines */}
            <circle cx="100" cy="100" r="92" stroke="var(--gold)" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
            <circle cx="100" cy="100" r="82" stroke="var(--gold)" strokeWidth="1.5" opacity="0.75" />
            <circle cx="100" cy="100" r="74" stroke="var(--gold)" strokeWidth="0.8" opacity="0.3" />

            {/* 24 Spokes of the Ashoka Dharma Chakra */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={100 + 72 * Math.cos((angle * Math.PI) / 180)}
                  y2={100 + 72 * Math.sin((angle * Math.PI) / 180)}
                  stroke="var(--gold)"
                  strokeWidth="1.2"
                  opacity={i % 2 === 0 ? '0.85' : '0.45'}
                />
              )
            })}

            {/* Center Hub */}
            <circle cx="100" cy="100" r="28" fill="var(--navy-950)" stroke="var(--gold)" strokeWidth="2" />
            <circle cx="100" cy="100" r="14" fill="var(--gold)" opacity="0.3" />
            <circle cx="100" cy="100" r="6" fill="var(--gold)" />
          </svg>

          {/* Central Scales of Justice Overlay Icon */}
          <div className="glow-center-icon-wrap" aria-hidden="true">
            <Scale size={28} className="glow-center-icon" />
          </div>
        </div>

        {/* 3 Right-Side Pillars of Value */}
        <div className="glow-taglines-list">
          <div className="glow-tagline-item">
            <div className="glow-tagline-icon-box">
              <Shield size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="glow-tagline-title">Know Your Rights</strong>
              <p className="glow-tagline-sub">Part III Fundamental protections & remedies</p>
            </div>
          </div>

          <div className="glow-tagline-item">
            <div className="glow-tagline-icon-box">
              <CheckCircle2 size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="glow-tagline-title">Verified Citations</strong>
              <p className="glow-tagline-sub">Supreme Court rulings & Central Acts</p>
            </div>
          </div>

          <div className="glow-tagline-item">
            <div className="glow-tagline-icon-box">
              <BookOpen size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="glow-tagline-title">Plain-English Law</strong>
              <p className="glow-tagline-sub">Demystified for everyday citizens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
