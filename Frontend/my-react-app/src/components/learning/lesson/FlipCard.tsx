import { useState, useRef, useEffect, useMemo, useCallback, type KeyboardEvent, type PointerEvent } from 'react'
import { Sparkles, CheckCircle2, RotateCcw, Flame } from 'lucide-react'

export interface FlipCardProps {
  prompt: string
  reveal: string
  source?: string
  isFlipped?: boolean
  onFlipChange?: (flipped: boolean) => void
  className?: string
  variant?: 'tear' | 'burn'
}

interface EmberSpeck {
  id: number
  x: number
  y: number
  driftY: number
  size: number
  opacity: number
}

// Deterministic seed from prompt string so each card's tear line is unique but stable
function hashString(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function createRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function FlipCard({
  prompt,
  reveal,
  source = 'Verified Constitutional Archive Record',
  isFlipped,
  onFlipChange,
  className = '',
  variant = 'tear',
}: FlipCardProps) {
  const [internalRevealed, setInternalRevealed] = useState(false)
  const isRevealed = isFlipped !== undefined ? isFlipped : internalRevealed

  // Tear-specific states
  const [isRipping, setIsRipping] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const hasClaimedRef = useRef(false)

  // Burn-specific states
  const [burnProgress, setBurnProgress] = useState(0) // 0 to 1
  const [burnOrigin, setBurnOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [burnActive, setBurnActive] = useState(false)
  const [embers, setEmbers] = useState<EmberSpeck[]>([])
  const burnAnimRef = useRef<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // Low-end and reduced-motion detection
  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const isLowEndDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const nav = navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number }
    return (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)
  }, [])

  // Touch vs pointer detection for hints
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Generate deterministic jagged tear polygon (12 points across 0% to 100%)
  const tearData = useMemo(() => {
    const seed = hashString(prompt)
    const rand = createRng(seed)
    const count = 12
    const points: { x: number; y: number }[] = []

    for (let i = 0; i <= count; i++) {
      const x = Math.round((i / count) * 1000) / 10
      const baseY = 48 + (i / count) * 4 // slight diagonal from 48% to 52%
      const jitter = (rand() - 0.5) * 7 // +/- 3.5%
      const y = Math.round((baseY + jitter) * 10) / 10
      points.push({ x, y })
    }

    const topPts = [
      '0% 0%',
      '100% 0%',
      ...points.slice().reverse().map((p) => `${p.x}% ${p.y}%`),
      `0% ${points[0].y}%`,
    ]
    const topClip = `polygon(${topPts.join(', ')})`

    const bottomPts = [
      `0% ${points[0].y}%`,
      ...points.map((p) => `${p.x}% ${p.y}%`),
      '100% 100%',
      '0% 100%',
    ]
    const bottomClip = `polygon(${bottomPts.join(', ')})`

    const linePath = points.map((p) => `${p.x},${p.y}`).join(' ')

    return { topClip, bottomClip, linePath, points }
  }, [prompt])

  // Handle revealing the answer (Tear variant)
  const triggerTear = useCallback(() => {
    if (isRevealed) return
    if (isReducedMotion) {
      setInternalRevealed(true)
      onFlipChange?.(true)
      return
    }

    // 80ms rip jitter before parting
    setIsRipping(true)
    setTimeout(() => {
      setIsRipping(false)
      setInternalRevealed(true)
      onFlipChange?.(true)
    }, 80)
  }, [isRevealed, isReducedMotion, onFlipChange])

  // Handle restoring the front page
  const handleRestore = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      e?.stopPropagation()
      if (!isRevealed) return

      if (variant === 'burn') {
        if (isReducedMotion || isLowEndDevice) {
          setBurnProgress(0)
          setBurnActive(false)
          setEmbers([])
          setInternalRevealed(false)
          onFlipChange?.(false)
          return
        }

        // Reverse burn animation over 600ms
        setBurnActive(true)
        const duration = 600
        const startTime = performance.now()
        const startP = burnProgress || 1

        const step = (now: number) => {
          const elapsed = now - startTime
          const p = Math.max(0, startP - elapsed / duration)
          setBurnProgress(p)

          if (p > 0) {
            burnAnimRef.current = requestAnimationFrame(step)
          } else {
            setBurnActive(false)
            setEmbers([])
            setInternalRevealed(false)
            onFlipChange?.(false)
          }
        }
        burnAnimRef.current = requestAnimationFrame(step)
      } else {
        // Tear variant restoration
        setDragProgress(0)
        setInternalRevealed(false)
        onFlipChange?.(false)
      }
    },
    [isRevealed, variant, isReducedMotion, isLowEndDevice, burnProgress, onFlipChange]
  )

  // Handle burn animation trigger
  const triggerBurn = useCallback(
    (clientX?: number, clientY?: number) => {
      if (isRevealed || burnActive) return

      const container = containerRef.current
      let originX = 50
      let originY = 50
      if (container && clientX !== undefined && clientY !== undefined) {
        const rect = container.getBoundingClientRect()
        originX = Math.round(((clientX - rect.left) / rect.width) * 100)
        originY = Math.round(((clientY - rect.top) / rect.height) * 100)
      }
      setBurnOrigin({ x: originX, y: originY })

      if (isReducedMotion || isLowEndDevice) {
        setInternalRevealed(true)
        onFlipChange?.(true)
        return
      }

      setBurnActive(true)
      const duration = 1000
      const startTime = performance.now()

      // Spawn 8-12 rising ember specks
      const newEmbers: EmberSpeck[] = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        driftY: Math.random() * 50 + 40,
        size: Math.random() * 2.5 + 2,
        opacity: Math.random() * 0.4 + 0.6,
      }))
      setEmbers(newEmbers)

      const animate = (now: number) => {
        const elapsed = now - startTime
        let p = elapsed / duration
        if (p > 1) p = 1
        // Smooth cubic ease
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
        setBurnProgress(ease)

        if (p < 1) {
          burnAnimRef.current = requestAnimationFrame(animate)
        } else {
          setBurnActive(false)
          setEmbers([])
          setInternalRevealed(true)
          onFlipChange?.(true)
        }
      }

      burnAnimRef.current = requestAnimationFrame(animate)
    },
    [isRevealed, burnActive, isReducedMotion, isLowEndDevice, onFlipChange]
  )

  // Pointer drag events for Tear variant
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isRevealed) return
    // Only primary button
    if (e.button !== 0) return

    setIsDragging(true)
    hasClaimedRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !pointerStartRef.current || isRevealed) return
    const dx = e.clientX - pointerStartRef.current.x
    const dy = e.clientY - pointerStartRef.current.y

    if (!hasClaimedRef.current) {
      if (Math.abs(dx) > 8) {
        hasClaimedRef.current = true
        try {
          e.currentTarget.setPointerCapture?.(e.pointerId)
        } catch {
          // ignore pointer capture exceptions
        }
      } else if (Math.abs(dy) > 8) {
        // Vertical scroll intent on mobile -> do not block page scroll!
        setIsDragging(false)
        return
      }
    }

    if (hasClaimedRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth || 300
      const progress = Math.min(1, Math.max(0, Math.abs(dx) / (width * 0.45)))
      setDragProgress(progress)
    }
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)

    if (hasClaimedRef.current) {
      if (dragProgress >= 0.4) {
        // Threshold reached: complete the tear
        setDragProgress(1)
        triggerTear()
      } else {
        // Spring back
        setDragProgress(0)
      }
    } else {
      // Tap or click without drag movement
      if (variant === 'burn') {
        triggerBurn(e.clientX, e.clientY)
      } else {
        triggerTear()
      }
    }
    pointerStartRef.current = null
    hasClaimedRef.current = false
  }

  const handlePointerCancel = () => {
    setIsDragging(false)
    hasClaimedRef.current = false
    pointerStartRef.current = null
    setDragProgress(0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isRevealed) {
        handleRestore()
      } else {
        if (variant === 'burn') {
          triggerBurn()
        } else {
          triggerTear()
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      if (burnAnimRef.current) cancelAnimationFrame(burnAnimRef.current)
    }
  }, [])

  // Dynamic transforms for tear halves
  const tearTopStyle = useMemo(() => {
    if (isRevealed) {
      return {
        transform: 'translate(-14%, -24%) rotate(-6deg)',
        opacity: 0,
        pointerEvents: 'none' as const,
      }
    }
    if (dragProgress > 0) {
      return {
        transform: `translate(${-dragProgress * 14}%, ${-dragProgress * 24}%) rotate(${-dragProgress * 6}deg)`,
        opacity: Math.max(0, 1 - dragProgress * 0.8),
        pointerEvents: 'none' as const,
      }
    }
    return {
      transform: 'none',
      opacity: 1,
    }
  }, [isRevealed, dragProgress])

  const tearBottomStyle = useMemo(() => {
    if (isRevealed) {
      return {
        transform: 'translate(14%, 24%) rotate(4deg)',
        opacity: 0,
        pointerEvents: 'none' as const,
      }
    }
    if (dragProgress > 0) {
      return {
        transform: `translate(${dragProgress * 14}%, ${dragProgress * 24}%) rotate(${dragProgress * 4}deg)`,
        opacity: Math.max(0, 1 - dragProgress * 0.8),
        pointerEvents: 'none' as const,
      }
    }
    return {
      transform: 'none',
      opacity: 1,
    }
  }, [isRevealed, dragProgress])

  // Front face contents (shared between top and bottom halves in tear, or single face in burn)
  const renderFrontContent = () => (
    <div className="flip-card-face-content">
      <div className="flip-card-header">
        <div className="flip-badge">
          {variant === 'burn' ? (
            <>
              <Flame size={14} className="text-gold" aria-hidden="true" />
              <span>DID YOU KNOW?</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-gold" aria-hidden="true" />
              <span>DID YOU KNOW?</span>
            </>
          )}
        </div>
        <div className="flip-action-hint">
          {variant === 'burn' ? (
            <>
              <Flame size={13} className="burn-icon-amber" aria-hidden="true" />
              <span>{isTouchDevice ? 'Tap to burn the page' : 'Click to burn the page'}</span>
            </>
          ) : (
            <span>{isTouchDevice ? 'Tap to tear the page' : 'Click to tear the page'}</span>
          )}
        </div>
      </div>

      <p className="flip-prompt-text">{prompt}</p>

      <div className="flip-footer-hint">
        <span>
          {variant === 'burn'
            ? 'Tap page to burn away and reveal constitutional insight'
            : isTouchDevice
            ? 'Tap or swipe horizontally to tear page'
            : 'Click or drag along card to tear page'}
        </span>
      </div>
    </div>
  )

  const burnRadiusPercent = burnProgress * 150

  return (
    <div
      ref={containerRef}
      className={`flip-card-perspective-container ${className} ${variant === 'burn' ? 'is-burn-variant' : 'is-tear-variant'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Interactive ${variant} card: ${prompt}`}
      aria-expanded={isRevealed}
    >
      <div className="flip-card-grid-container">
        {/* UNDERLAY / REVEALED ANSWER LAYER (IN NORMAL FLOW TO EXPAND CONTAINER HEIGHT) */}
        <div
          className={`flip-card-layer flip-card-underlay ${isRevealed ? 'is-active' : ''}`}
          aria-hidden={!isRevealed}
        >
          <div className="flip-card-face-content">
            <div className="flip-card-header">
              <div className="flip-badge flip-badge-back">
                <Sparkles size={14} className="text-gold" aria-hidden="true" />
                <span>THE ANSWER</span>
              </div>
              <button
                type="button"
                className="flip-restore-btn"
                onClick={handleRestore}
                aria-label="Show question again"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Show question again</span>
              </button>
            </div>

            <p className="flip-reveal-text">{reveal}</p>

            <div className="flip-source-line">
              <CheckCircle2 size={13} className="text-success" aria-hidden="true" />
              <span>{source}</span>
            </div>
          </div>
        </div>

        {/* FRONT SURFACE LAYER */}
        {variant === 'tear' ? (
          <div
            className={`flip-card-layer flip-card-tear-wrapper ${isRevealed ? 'is-torn' : ''}`}
            aria-hidden={isRevealed}
          >
            {/* Desktop hover guide line */}
            <svg className="tear-hover-guide-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                points={tearData.linePath}
                fill="none"
                stroke="var(--brand-gold, #D4AF37)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* TOP HALF */}
            <div
              className={`tear-half tear-top-half ${isRipping ? 'is-ripping' : ''}`}
              style={{
                clipPath: tearData.topClip,
                WebkitClipPath: tearData.topClip,
                ...tearTopStyle,
                transition: isDragging
                  ? 'none'
                  : isRevealed
                  ? 'transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 600ms ease'
                  : 'transform 400ms ease-out, opacity 400ms ease-out',
              }}
            >
              <div className="tear-half-inner">{renderFrontContent()}</div>
              {/* Lighter torn-paper edge along jagged line */}
              <svg className="tear-edge-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  points={tearData.linePath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* BOTTOM HALF */}
            <div
              className={`tear-half tear-bottom-half ${isRipping ? 'is-ripping' : ''}`}
              style={{
                clipPath: tearData.bottomClip,
                WebkitClipPath: tearData.bottomClip,
                ...tearBottomStyle,
                transition: isDragging
                  ? 'none'
                  : isRevealed
                  ? 'transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 600ms ease'
                  : 'transform 400ms ease-out, opacity 400ms ease-out',
              }}
            >
              <div className="tear-half-inner">{renderFrontContent()}</div>
              {/* Lighter torn-paper edge along jagged line */}
              <svg className="tear-edge-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  points={tearData.linePath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        ) : (
          /* BURN VARIANT */
          <div
            className={`flip-card-layer flip-card-burn-wrapper ${isRevealed ? 'is-burned' : ''}`}
            aria-hidden={isRevealed}
            style={
              isReducedMotion || isLowEndDevice
                ? {
                    opacity: isRevealed ? 0 : 1,
                    pointerEvents: isRevealed ? 'none' : 'auto',
                    transition: isReducedMotion ? 'opacity 150ms ease' : 'opacity 250ms ease',
                  }
                : {
                    maskImage:
                      burnProgress > 0
                        ? `radial-gradient(circle at ${burnOrigin.x}% ${burnOrigin.y}%, transparent ${burnRadiusPercent}%, black calc(${burnRadiusPercent}% + 2px))`
                        : 'none',
                    WebkitMaskImage:
                      burnProgress > 0
                        ? `radial-gradient(circle at ${burnOrigin.x}% ${burnOrigin.y}%, transparent ${burnRadiusPercent}%, black calc(${burnRadiusPercent}% + 2px))`
                        : 'none',
                    opacity: isRevealed ? 0 : 1,
                    pointerEvents: isRevealed ? 'none' : 'auto',
                  }
            }
          >
            <div className="burn-front-inner">{renderFrontContent()}</div>

            {/* Glowing ember & char rings during active burn */}
            {burnActive && !isLowEndDevice && !isReducedMotion && (
              <svg className="burn-overlay-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {/* 1. Charred ring */}
                <ellipse
                  cx={burnOrigin.x}
                  cy={burnOrigin.y}
                  rx={burnRadiusPercent}
                  ry={burnRadiusPercent}
                  fill="none"
                  stroke="#1a0d05"
                  strokeWidth="6"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.9"
                />
                {/* 2. Glowing ember ring */}
                <ellipse
                  cx={burnOrigin.x}
                  cy={burnOrigin.y}
                  rx={Math.max(0, burnRadiusPercent - 1)}
                  ry={Math.max(0, burnRadiusPercent - 1)}
                  fill="none"
                  stroke="#ff5a1f"
                  strokeWidth="3.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255, 100, 0, 0.8))' }}
                />
              </svg>
            )}

            {/* 8-12 Rising ember specks */}
            {burnActive &&
              !isLowEndDevice &&
              !isReducedMotion &&
              embers.map((speck) => (
                <span
                  key={speck.id}
                  className="burn-ember-speck"
                  style={{
                    left: `${speck.x}%`,
                    top: `${speck.y}%`,
                    width: `${speck.size}px`,
                    height: `${speck.size}px`,
                    transform: `translateY(-${speck.driftY * burnProgress}px)`,
                    opacity: speck.opacity * (1 - burnProgress),
                  }}
                  aria-hidden="true"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
