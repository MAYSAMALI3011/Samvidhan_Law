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
    (clientX?: number, clientY?: number) => {
      const container = containerRef.current
      const canvas = canvasRef.current
      const frontEl = frontRef.current
      if (!container || !canvas || !frontEl) return

      const nextState = !isBurned
      setIsBurned(nextState)
      if (onBurnChange) onBurnChange(nextState)

      const rect = container.getBoundingClientRect()
      const originX = clientX !== undefined ? clientX - rect.left : rect.width / 2
      const originY = clientY !== undefined ? clientY - rect.top : rect.height / 2

      const maxRadius = Math.hypot(
        Math.max(originX, rect.width - originX),
        Math.max(originY, rect.height - originY)
      ) + 40

      canvas.width = rect.width
      canvas.height = rect.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const duration = 750
      const startTime = performance.now()

      // Generate ember spark particles
      const sparks: Spark[] = []
      const sparkCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 35
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.7) * 7,
          life: 1,
          size: Math.random() * 3 + 1.5,
          decay: Math.random() * 0.025 + 0.015,
          color: Math.random() > 0.4 ? '#ffd700' : '#ff4500',
        })
      }

      if (animRef.current) cancelAnimationFrame(animRef.current)

      const animate = (now: number) => {
        let p = (now - startTime) / duration
        if (p > 1) p = 1
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p

        const curRadius = nextState ? ease * maxRadius : (1 - ease) * maxRadius
        ctx.clearRect(0, 0, rect.width, rect.height)

        if (curRadius > 0 && curRadius < maxRadius) {
          const mask = `radial-gradient(circle at ${originX}px ${originY}px, transparent ${curRadius}px, black ${curRadius + 30}px)`
          frontEl.style.maskImage = mask
          frontEl.style.webkitMaskImage = mask

          // Draw fiery glowing ring
          ctx.save()
          ctx.beginPath()
          ctx.arc(originX, originY, curRadius, 0, Math.PI * 2)
          ctx.lineWidth = 14
          ctx.strokeStyle = 'rgba(255, 69, 0, 0.75)'
          ctx.shadowColor = '#ff4500'
          ctx.shadowBlur = 18
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(originX, originY, curRadius + 3, 0, Math.PI * 2)
          ctx.lineWidth = 5
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.95)'
          ctx.shadowColor = '#ffd700'
          ctx.shadowBlur = 10
          ctx.stroke()
          ctx.restore()
        } else if (curRadius >= maxRadius) {
          frontEl.style.maskImage = 'radial-gradient(circle, transparent 100%, black 100%)'
          frontEl.style.webkitMaskImage = 'radial-gradient(circle, transparent 100%, black 100%)'
        } else {
          frontEl.style.maskImage = 'none'
          frontEl.style.webkitMaskImage = 'none'
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
    triggerBurn(e.clientX, e.clientY)
  }

  const handleTouch = (e: TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button.btn')) return
    if (e.touches.length > 0) {
      triggerBurn(e.touches[0].clientX, e.touches[0].clientY)
    }
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
