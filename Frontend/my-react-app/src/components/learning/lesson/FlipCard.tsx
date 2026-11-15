import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
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

type CardState = 'idle' | 'tearing' | 'burning' | 'revealed' | 'reassembling' | 'rewinding'

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

// Physical spring simulation for reassembly: stiffness = 170, damping = 18, mass = 1
// Gives a tiny 2-3px settle before resting firmly at 0 without a bounce loop
function springDampedFraction(t: number): number {
  if (t <= 0) return 1
  if (t >= 1) return 0
  const timeSec = t * 0.7 // 700ms duration
  const gamma = 9.0 // damping / (2 * mass) = 18 / 2
  const omegaD = 9.434 // sqrt(170 - 81)
  const decay = Math.exp(-gamma * timeSec)
  const osc = Math.cos(omegaD * timeSec) + (gamma / omegaD) * Math.sin(omegaD * timeSec)
  const val = decay * osc
  return Math.max(0, Math.min(1.05, val))
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
  // Animation state machine: idle -> tearing/burning -> revealed -> reassembling/rewinding -> idle
  const [cardState, setCardState] = useState<CardState>(() =>
    isFlipped ? 'revealed' : 'idle'
  )

  // Tear animation metrics
  const [tearProgress, setTearProgress] = useState<number>(() =>
    isFlipped && variant === 'tear' ? 1 : 0
  )
  const [isRipping, setIsRipping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [goldSeamOpacity, setGoldSeamOpacity] = useState(0)

  // Burn animation metrics
  const [burnProgress, setBurnProgress] = useState<number>(() =>
    isFlipped && variant === 'burn' ? 1 : 0
  )
  const [burnOrigin, setBurnOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [embers, setEmbers] = useState<EmberSpeck[]>([])

  // Accessibility screen-reader live announcement
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Refs for tracking pointers, captures, and animation frames
  const containerRef = useRef<HTMLDivElement>(null)
  const restoreBtnRef = useRef<HTMLButtonElement>(null)
  const tearAnimRef = useRef<number | null>(null)
  const burnAnimRef = useRef<number | null>(null)
  const jitterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goldSeamTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const hasClaimedRef = useRef(false)
  const tearProgressRef = useRef(tearProgress)
  const burnProgressRef = useRef(burnProgress)

  useEffect(() => {
    tearProgressRef.current = tearProgress
  }, [tearProgress])

  useEffect(() => {
    burnProgressRef.current = burnProgress
  }, [burnProgress])

  // Synchronize controlled isFlipped prop if provided
  const [prevFlipped, setPrevFlipped] = useState(isFlipped)
  if (isFlipped !== undefined && isFlipped !== prevFlipped) {
    setPrevFlipped(isFlipped)
    if (isFlipped && cardState === 'idle') {
      setCardState('revealed')
      if (variant === 'burn') {
        setBurnProgress(1)
      } else {
        setTearProgress(1)
      }
    } else if (!isFlipped && cardState === 'revealed') {
      setCardState('idle')
      setTearProgress(0)
      setBurnProgress(0)
      setEmbers([])
      setGoldSeamOpacity(0)
    }
  }
  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const isLowEndDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const nav = navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number }
    return (
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)
    )
  }, [])

  // Touch device detection for hint text
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Cleanup all timers and animation frames
  const clearAllAnimations = useCallback(() => {
    if (tearAnimRef.current !== null) {
      cancelAnimationFrame(tearAnimRef.current)
      tearAnimRef.current = null
    }
    if (burnAnimRef.current !== null) {
      cancelAnimationFrame(burnAnimRef.current)
      burnAnimRef.current = null
    }
    if (jitterTimeoutRef.current !== null) {
      clearTimeout(jitterTimeoutRef.current)
      jitterTimeoutRef.current = null
    }
    if (goldSeamTimeoutRef.current !== null) {
      clearTimeout(goldSeamTimeoutRef.current)
      goldSeamTimeoutRef.current = null
    }
  }, [])

  // Cancel animations on unmount or when prompt/card changes
  useEffect(() => {
    return () => {
      clearAllAnimations()
    }
  }, [clearAllAnimations, prompt])



  // Generate deterministic jagged tear polygon (12 vertices across 0% to 100%)
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

  // --------------------------------------------------------------------------
  // TEAR: START TEARING ANIMATION
  // --------------------------------------------------------------------------
  const startTearAnimation = useCallback(
    (initialProgress = 0) => {
      if (cardState !== 'idle' && cardState !== 'tearing') return

      if (isReducedMotion) {
        setTearProgress(1)
        setCardState('revealed')
        onFlipChange?.(true)
        return
      }

      setCardState('tearing')

      // 80ms rip jitter if starting from intact
      if (initialProgress === 0) {
        setIsRipping(true)
        jitterTimeoutRef.current = setTimeout(() => {
          setIsRipping(false)
        }, 80)
      }

      const duration = 650
      const startT = performance.now()
      const startP = initialProgress

      const animate = (now: number) => {
        const elapsed = now - startT
        const raw = Math.min(1, startP + elapsed / duration)
        // Smooth ease-out cubic
        const p = 1 - Math.pow(1 - raw, 3)
        setTearProgress(p)

        if (raw < 1) {
          tearAnimRef.current = requestAnimationFrame(animate)
        } else {
          setTearProgress(1)
          setCardState('revealed')
          onFlipChange?.(true)
        }
      }

      clearAllAnimations()
      tearAnimRef.current = requestAnimationFrame(animate)
    },
    [cardState, isReducedMotion, onFlipChange, clearAllAnimations]
  )

  // --------------------------------------------------------------------------
  // TEAR: REASSEMBLE THE PAGE (REVERSE TEAR WITH SPRING SETTLE & GOLD SEAM)
  // --------------------------------------------------------------------------
  const startReassembleAnimation = useCallback(() => {
    // Only allow valid transitions: from 'revealed' or interrupting 'tearing'
    if (cardState !== 'revealed' && cardState !== 'tearing') return

    clearAllAnimations()

    if (isReducedMotion) {
      setCardState('idle')
      setTearProgress(0)
      setGoldSeamOpacity(0)
      onFlipChange?.(false)
      containerRef.current?.focus()
      setLiveAnnouncement('Question')
      return
    }

    setCardState('reassembling')
    const startProgress = tearProgressRef.current || 1
    const duration = 700 // 650-750ms
    const startT = performance.now()
    let seamTriggered = false

    const animate = (now: number) => {
      const elapsed = now - startT
      const t = Math.min(1, elapsed / duration)

      // Apply damped harmonic spring fraction
      const fraction = springDampedFraction(t)
      const currentP = startProgress * fraction
      setTearProgress(currentP)

      // Trigger thin gold seam right as the two jagged halves meet exactly
      if (!seamTriggered && currentP <= 0.08) {
        seamTriggered = true
        setGoldSeamOpacity(1)
        goldSeamTimeoutRef.current = setTimeout(() => {
          setGoldSeamOpacity(0)
        }, 300)
      }

      if (t < 1) {
        tearAnimRef.current = requestAnimationFrame(animate)
      } else {
        // Complete reassembly cleanly: no leftover transforms or stray clip-paths
        setTearProgress(0)
        setCardState('idle')
        onFlipChange?.(false)

        // Accessibility: move focus to card and announce "Question"
        containerRef.current?.focus()
        setLiveAnnouncement('Question')
      }
    }

    tearAnimRef.current = requestAnimationFrame(animate)
  }, [cardState, isReducedMotion, onFlipChange, clearAllAnimations])

  // --------------------------------------------------------------------------
  // BURN: START BURN ANIMATION
  // --------------------------------------------------------------------------
  const startBurnAnimation = useCallback(
    (clientX?: number, clientY?: number, initialProgress = 0) => {
      if (cardState !== 'idle' && cardState !== 'burning') return

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
        setBurnProgress(1)
        setCardState('revealed')
        onFlipChange?.(true)
        return
      }

      setCardState('burning')
      const duration = 950
      const startT = performance.now()
      const startP = initialProgress

      // Spawn 10 rising ember specks near the ignition origin
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
        const elapsed = now - startT
        const raw = Math.min(1, startP + elapsed / duration)
        // Smooth ease-in-out curve
        const ease = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2
        setBurnProgress(ease)

        if (raw < 1) {
          burnAnimRef.current = requestAnimationFrame(animate)
        } else {
          setBurnProgress(1)
          setCardState('revealed')
          onFlipChange?.(true)
        }
      }

      clearAllAnimations()
      burnAnimRef.current = requestAnimationFrame(animate)
    },
    [cardState, isReducedMotion, isLowEndDevice, onFlipChange, clearAllAnimations]
  )

  // --------------------------------------------------------------------------
  // BURN: REWIND ANIMATION (CLOSES HOLE & DRAWS PARTICLES BACK)
  // --------------------------------------------------------------------------
  const startRewindAnimation = useCallback(() => {
    // Only allow valid transitions: from 'revealed' or interrupting 'burning'
    if (cardState !== 'revealed' && cardState !== 'burning') return

    clearAllAnimations()

    if (isReducedMotion || isLowEndDevice) {
      setBurnProgress(0)
      setEmbers([])
      setCardState('idle')
      onFlipChange?.(false)
      containerRef.current?.focus()
      setLiveAnnouncement('Question')
      return
    }

    setCardState('rewinding')
    const startP = burnProgressRef.current || 1
    const duration = 950 // 900-1000ms ease-in-out
    const startT = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startT
      const t = Math.min(1, elapsed / duration)
      // Ease-in-out reverse
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const currentP = Math.max(0, startP * (1 - ease))
      setBurnProgress(currentP)

      if (t < 1) {
        burnAnimRef.current = requestAnimationFrame(animate)
      } else {
        // Ending clean: no char marks, no particles, no leftover mask
        setBurnProgress(0)
        setEmbers([])
        setCardState('idle')
        onFlipChange?.(false)

        // Accessibility focus and announcement
        containerRef.current?.focus()
        setLiveAnnouncement('Question')
      }
    }

    burnAnimRef.current = requestAnimationFrame(animate)
  }, [cardState, isReducedMotion, isLowEndDevice, onFlipChange, clearAllAnimations])

  // --------------------------------------------------------------------------
  // RESTORE BUTTON HANDLER
  // --------------------------------------------------------------------------
  const handleRestoreClick = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      e?.stopPropagation()
      if (variant === 'burn') {
        startRewindAnimation()
      } else {
        startReassembleAnimation()
      }
    },
    [variant, startRewindAnimation, startReassembleAnimation]
  )

  // --------------------------------------------------------------------------
  // POINTER DRAG & TAP HANDLING (FOR TEAR VARIANT)
  // --------------------------------------------------------------------------
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Ignore interactions if already revealed or currently reassembling/rewinding
    if (cardState !== 'idle' && cardState !== 'tearing') return
    if (e.button !== 0) return

    setIsDragging(true)
    hasClaimedRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !pointerStartRef.current) return
    if (cardState !== 'idle' && cardState !== 'tearing') return

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

    if (hasClaimedRef.current && containerRef.current && variant === 'tear') {
      const width = containerRef.current.clientWidth || 300
      const progress = Math.min(1, Math.max(0, Math.abs(dx) / (width * 0.45)))
      setTearProgress(progress)
    }
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)

    if (hasClaimedRef.current && variant === 'tear') {
      if (tearProgress >= 0.4) {
        // Threshold reached: complete the tear
        startTearAnimation(tearProgress)
      } else {
        // Spring back to intact
        startReassembleAnimation()
      }
    } else {
      // Tap or click without drag movement
      if (variant === 'burn') {
        startBurnAnimation(e.clientX, e.clientY)
      } else {
        startTearAnimation(0)
      }
    }

    pointerStartRef.current = null
    hasClaimedRef.current = false
  }

  const handlePointerCancel = () => {
    setIsDragging(false)
    hasClaimedRef.current = false
    pointerStartRef.current = null
    if (cardState === 'idle' || cardState === 'tearing') {
      setTearProgress(0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // If pressing on restore button, let button handle it
      if ((e.target as HTMLElement).closest('.flip-restore-btn')) return

      e.preventDefault()
      if (cardState === 'revealed') {
        handleRestoreClick(e)
      } else if (cardState === 'idle') {
        if (variant === 'burn') {
          startBurnAnimation()
        } else {
          startTearAnimation(0)
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // DYNAMIC TRANSFORMS & SHADOWS
  // --------------------------------------------------------------------------
  const isMoving = cardState === 'tearing' || cardState === 'reassembling'

  const tearTopStyle = useMemo(() => {
    if (cardState === 'idle') {
      return {
        transform: 'none',
        opacity: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
      }
    }
    const p = tearProgress
    return {
      transform: `translate(${-p * 14}%, ${-p * 24}%) rotate(${-p * 6}deg)`,
      opacity: Math.max(0, 1 - p * 0.8),
      filter: isMoving
        ? 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))'
        : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
      pointerEvents: cardState === 'revealed' ? ('none' as const) : ('auto' as const),
    }
  }, [cardState, tearProgress, isMoving])

  const tearBottomStyle = useMemo(() => {
    if (cardState === 'idle') {
      return {
        transform: 'none',
        opacity: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
      }
    }
    const p = tearProgress
    return {
      transform: `translate(${p * 14}%, ${p * 24}%) rotate(${p * 4}deg)`,
      opacity: Math.max(0, 1 - p * 0.8),
      filter: isMoving
        ? 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))'
        : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
      pointerEvents: cardState === 'revealed' ? ('none' as const) : ('auto' as const),
    }
  }, [cardState, tearProgress, isMoving])

  // Underlay opacity: fades out synchronously during reassembly so question text isn't covered
  const underlayOpacity = useMemo(() => {
    if (cardState === 'idle') return 0
    if (cardState === 'revealed') return 1
    if (variant === 'burn') return burnProgress
    return tearProgress
  }, [cardState, variant, burnProgress, tearProgress])

  // Front face contents (shared across variants)
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
  const buttonLabel = variant === 'tear' ? 'Put the page back together' : 'Restore the page'

  return (
    <div
      ref={containerRef}
      className={`flip-card-perspective-container ${className} ${
        variant === 'burn' ? 'is-burn-variant' : 'is-tear-variant'
      } state-${cardState}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Interactive ${variant} card: ${prompt}`}
      aria-expanded={cardState === 'revealed'}
    >
      {/* Screen-reader live announcement for accessibility */}
      <span className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </span>

      <div className="flip-card-grid-container">
        {/* UNDERLAY / REVEALED ANSWER LAYER (IN NORMAL FLOW TO SET HEIGHT) */}
        <div
          className={`flip-card-layer flip-card-underlay ${
            cardState === 'revealed' ? 'is-active' : ''
          }`}
          style={{
            opacity: underlayOpacity,
            pointerEvents: cardState === 'revealed' ? 'auto' : 'none',
          }}
          aria-hidden={cardState === 'idle'}
        >
          <div className="flip-card-face-content">
            <div className="flip-card-header">
              <div className="flip-badge flip-badge-back">
                <Sparkles size={14} className="text-gold" aria-hidden="true" />
                <span>THE ANSWER</span>
              </div>
              <button
                ref={restoreBtnRef}
                type="button"
                className="flip-restore-btn"
                onClick={handleRestoreClick}
                aria-label={buttonLabel}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>{buttonLabel}</span>
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
            className={`flip-card-layer flip-card-tear-wrapper ${
              cardState === 'revealed' ? 'is-torn' : ''
            }`}
            aria-hidden={cardState === 'revealed'}
          >
            {/* Desktop hover guide line (visible only on hover in idle state) */}
            {cardState === 'idle' && (
              <svg
                className="tear-hover-guide-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={tearData.linePath}
                  fill="none"
                  stroke="var(--brand-gold, #D4AF37)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}

            {/* TOP HALF */}
            <div
              className={`tear-half tear-top-half ${isRipping ? 'is-ripping' : ''} ${
                isMoving ? 'is-moving' : ''
              }`}
              style={{
                clipPath: tearData.topClip,
                WebkitClipPath: tearData.topClip,
                ...tearTopStyle,
              }}
            >
              <div className="tear-half-inner">{renderFrontContent()}</div>
              {/* Lighter torn-paper edge along jagged line */}
              <svg
                className="tear-edge-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
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
              className={`tear-half tear-bottom-half ${isRipping ? 'is-ripping' : ''} ${
                isMoving ? 'is-moving' : ''
              }`}
              style={{
                clipPath: tearData.bottomClip,
                WebkitClipPath: tearData.bottomClip,
                ...tearBottomStyle,
              }}
            >
              <div className="tear-half-inner">{renderFrontContent()}</div>
              {/* Lighter torn-paper edge along jagged line */}
              <svg
                className="tear-edge-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={tearData.linePath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* THIN GOLD SEAM: Fades out over 300ms right as the halves meet */}
            {goldSeamOpacity > 0 && (
              <svg
                className="tear-gold-seam-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{
                  opacity: goldSeamOpacity,
                  transition: 'opacity 300ms ease',
                }}
              >
                <polyline
                  points={tearData.linePath}
                  fill="none"
                  stroke="var(--brand-gold, #D4AF37)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
          </div>
        ) : (
          /* BURN VARIANT */
          <div
            className={`flip-card-layer flip-card-burn-wrapper ${
              cardState === 'revealed' ? 'is-burned' : ''
            }`}
            aria-hidden={cardState === 'revealed'}
            style={
              isReducedMotion || isLowEndDevice
                ? {
                    opacity: cardState === 'revealed' ? 0 : 1,
                    pointerEvents: cardState === 'revealed' ? 'none' : 'auto',
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
                    opacity: cardState === 'revealed' ? 0 : 1,
                    pointerEvents: cardState === 'revealed' ? 'none' : 'auto',
                  }
            }
          >
            <div className="burn-front-inner">{renderFrontContent()}</div>

            {/* Glowing ember & char rings during active burn or rewind */}
            {(cardState === 'burning' || cardState === 'rewinding') &&
              !isLowEndDevice &&
              !isReducedMotion &&
              burnProgress > 0 && (
                <svg
                  className="burn-overlay-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
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
                    opacity={Math.min(0.9, burnProgress * 1.2)}
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
                    opacity={Math.min(1, burnProgress * 1.5)}
                  />
                </svg>
              )}

            {/* 10 Rising / rewinding ember specks */}
            {(cardState === 'burning' || cardState === 'rewinding') &&
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
                    opacity: speck.opacity * burnProgress,
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
