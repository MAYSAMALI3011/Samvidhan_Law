import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type MouseEvent, type TouchEvent, type ReactNode } from 'react'

export interface BurnCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
  ariaLabel?: string
  onBurnChange?: (isBurned: boolean) => void
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  decay: number
  color: string
}

export function BurnCard({
  front,
  back,
  className = '',
  ariaLabel = 'Interactive constitutional burn card',
  onBurnChange,
}: BurnCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const [isBurned, setIsBurned] = useState(false)
  const animRef = useRef<number | null>(null)

  const triggerBurn = useCallback(
    () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      const frontEl = frontRef.current
      if (!container || !canvas || !frontEl) return

      const nextState = !isBurned
      setIsBurned(nextState)
      if (onBurnChange) onBurnChange(nextState)

      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const duration = 850
      const startTime = performance.now()
      const sparks: Spark[] = []
      const sparkCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 35

      if (animRef.current) cancelAnimationFrame(animRef.current)

      const animate = (now: number) => {
        let p = (now - startTime) / duration
        if (p > 1) p = 1
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p

        // Organic flame wave moves from bottom (rect.height + 30) to top (-40) when burning
        const curY = nextState
          ? (rect.height + 30) - ease * (rect.height + 70)
          : -40 + ease * (rect.height + 70)

        ctx.clearRect(0, 0, rect.width, rect.height)

        if (curY > -35 && curY < rect.height + 25) {
          const numPts = 60
          const pts: { x: number; y: number }[] = []
          for (let i = 0; i <= numPts; i++) {
            const x = (i / numPts) * rect.width
            const baseWave = Math.sin(x * 0.035 + now * 0.007) * 14 + Math.cos(x * 0.075 - now * 0.011) * 7
            const flameLick = Math.max(0, Math.sin(x * 0.12 + now * 0.02)) * 10
            const y = curY + baseWave - flameLick
            pts.push({ x, y })
          }

          // Polygon masking: keeps only unburned portion above fire wave
          let polyStr = 'polygon(0% 0%, 100% 0%'
          for (let i = pts.length - 1; i >= 0; i--) {
            polyStr += `, ${pts[i].x}px ${pts[i].y}px`
          }
          polyStr += ')'
          frontEl.style.clipPath = polyStr
          frontEl.style.setProperty('-webkit-clip-path', polyStr)

          // Spawn ember sparks along active fire front
          if (sparkCount > 0 && Math.random() > 0.25) {
            const sx = Math.random() * rect.width
            const sy = curY + Math.sin(sx * 0.035) * 12
            sparks.push({
              x: sx,
              y: sy,
              vx: (Math.random() - 0.5) * 3.5,
              vy: -Math.random() * 5.5 - 2,
              life: 1,
              size: Math.random() * 3 + 1.5,
              decay: Math.random() * 0.025 + 0.018,
              color: Math.random() > 0.4 ? (Math.random() > 0.5 ? '#ffd700' : '#ff7700') : '#ff2200',
            })
          }

          // 1. Black Charred Paper Scorch Edge (above fire line)
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y - 8)
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y - 8)
          ctx.lineWidth = 18
          ctx.strokeStyle = 'rgba(15, 4, 1, 0.95)'
          ctx.stroke()

          // 2. Burning Ember Orange Flame Front
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
          ctx.lineWidth = 10
          ctx.strokeStyle = 'rgba(255, 69, 0, 0.85)'
          ctx.shadowColor = '#ff4500'
          ctx.shadowBlur = 18
          ctx.stroke()

          // 3. Incandescent White-Hot Flame Core
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y + 2)
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + 2)
          ctx.lineWidth = 3.5
          ctx.strokeStyle = 'rgba(255, 235, 120, 0.95)'
          ctx.shadowColor = '#ffd700'
          ctx.shadowBlur = 10
          ctx.stroke()
          ctx.restore()
        } else if (nextState && curY <= -35) {
          frontEl.style.clipPath = 'polygon(0 0, 0 0, 0 0)'
          frontEl.style.setProperty('-webkit-clip-path', 'polygon(0 0, 0 0, 0 0)')
        } else {
          frontEl.style.clipPath = 'none'
          frontEl.style.setProperty('-webkit-clip-path', 'none')
        }

        // Render & update ember particles
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]
          s.x += s.vx
          s.y += s.vy
          s.life -= s.decay
          if (s.life > 0) {
            ctx.fillStyle = s.color
            ctx.globalAlpha = s.life
            ctx.beginPath()
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2)
            ctx.fill()
          } else {
            sparks.splice(i, 1)
          }
        }
        ctx.globalAlpha = 1

        if (p < 1 || sparks.length > 0) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          ctx.clearRect(0, 0, rect.width, rect.height)
        }
      }

      animRef.current = requestAnimationFrame(animate)
    },
    [isBurned, onBurnChange]
  )

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // If target is an interactive anchor or button inside the revealed card, don't trigger burn restore
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button.btn')) return
    triggerBurn()
  }

  const handleTouch = (e: TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button.btn')) return
    triggerBurn()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      triggerBurn()
    }
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`burn-card-container ${isBurned ? 'is-burned' : ''} ${className}`}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-expanded={isBurned}
      aria-label={ariaLabel}
    >
      {/* UNDERLAY FACE (REVEALED TRUTH) - IN NORMAL FLOW TO DRIVE HEIGHT */}
      <div className="burn-card-face burn-card-underlay" aria-hidden={!isBurned}>
        {back}
      </div>

      {/* FRONT PARCHMENT FACE (BURNS AWAY ON TAP) */}
      <div
        ref={frontRef}
        className="burn-card-face burn-card-front"
        aria-hidden={isBurned}
        style={{ pointerEvents: isBurned ? 'none' : 'auto' }}
      >
        {front}
      </div>

      {/* CANVAS FIRE LAYER */}
      <canvas ref={canvasRef} className="burn-card-canvas" aria-hidden="true" />
    </div>
  )
}
