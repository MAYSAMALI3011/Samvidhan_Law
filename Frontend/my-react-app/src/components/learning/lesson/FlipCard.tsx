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
import './flip-card.css'

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
  driftX: number
  size: number
  opacity: number
}

interface SmokePuff {
  id: number
  x: number
  y: number
  driftY: number
  size: number
  opacity: number
}

// Stable deterministic string hash for reproducible seed values
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
// Settle of 2-3px before resting firmly at 0 with no bounce loop
function springDampedFraction(t: number): number {
  if (t <= 0) return 1
  if (t >= 1) return 0
  const timeSec = t * 0.7 // 700ms base duration
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
  // FIX B: Support dev-only ?fx=burn | ?fx=tear query parameter to force variant across cards
  const activeVariant = useMemo(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      const p = new URLSearchParams(window.location.search).get('fx')
      if (p === 'burn' || p === 'tear') return p
    }
    return variant
  }, [variant])

  // DEV SLOW MOTION MULTIPLIER (?fxslow=4)
  const slowMultiplier = useMemo(() => {
    if (typeof window === 'undefined') return 1
    const isDevEnv =
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    if (isDevEnv) {
      const params = new URLSearchParams(window.location.search)
      const fxslow = params.get('fxslow')
      if (fxslow) {
        const parsed = parseFloat(fxslow)
        return isNaN(parsed) || parsed <= 0 ? 1 : parsed
      }
    }
    return 1
  }, [])

  // Animation state machine: idle -> tearing/burning -> revealed -> reassembling/rewinding -> idle
  const [cardState, setCardState] = useState<CardState>(() =>
    isFlipped ? 'revealed' : 'idle'
  )

  // Interaction tap / origin point (percentages 0-100)
  const [tapCoords, setTapCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 })

  // Tear animation metrics:
  // Phase 1 (0-120ms): anticipation (press 1px, jitter 2px)
  // Phase 2 (120-470ms): rip (opens like a zip)
  // Phase 3 (470-950ms): separation (top -5%/-12%/-7deg, bottom +4%/+10%/+5deg)
  const [tearPhase, setTearPhase] = useState<'idle' | 'anticipation' | 'rip' | 'separation'>(() =>
    isFlipped && activeVariant === 'tear' ? 'separation' : 'idle'
  )
  const [tearProgress, setTearProgress] = useState<number>(() =>
    isFlipped && activeVariant === 'tear' ? 1 : 0
  )
  const [ripProgress, setRipProgress] = useState<number>(() =>
    isFlipped && activeVariant === 'tear' ? 1 : 0
  )
  const [jitterOffset, setJitterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [goldSeamOpacity, setGoldSeamOpacity] = useState(0)

  // Burn animation metrics:
  // 0-200ms: ignition, 200-1300ms: spread, 1300-1500ms: burnout
  const [burnProgress, setBurnProgress] = useState<number>(() =>
    isFlipped && activeVariant === 'burn' ? 1 : 0
  )
  const [burnPhase, setBurnPhase] = useState<'idle' | 'ignition' | 'spread' | 'burnout'>(() =>
    isFlipped && activeVariant === 'burn' ? 'burnout' : 'idle'
  )
  const [embers, setEmbers] = useState<EmberSpeck[]>([])
  const [smokePuffs, setSmokePuffs] = useState<SmokePuff[]>([])

  // Accessibility screen-reader live announcement
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Unique IDs for SVG filters & masks to prevent collisions
  const filterId = useMemo(
    () => `burn-turb-${hashString(prompt).toString(36)}`,
    [prompt]
  )
  const maskId = useMemo(
    () => `burn-mask-${hashString(prompt).toString(36)}`,
    [prompt]
  )

  // Hardware / Accessibility preferences
  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // FIX B: Fall back to 250ms fade only when navigator.deviceMemory <= 2 (when available) or reduced motion.
  // Removed hardwareConcurrency condition.
  const isLowEndDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const nav = navigator as unknown as { deviceMemory?: number }
    return nav.deviceMemory !== undefined && nav.deviceMemory <= 2
  }, [])

  // Detect fine pointer / hover capability for exact hint text
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  })
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Refs for tracking animation loops, timeouts, and drag gestures
  const containerRef = useRef<HTMLDivElement>(null)
  const restoreBtnRef = useRef<HTMLButtonElement>(null)
  const tearAnimRef = useRef<number | null>(null)
  const burnAnimRef = useRef<number | null>(null)
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
      if (activeVariant === 'burn') {
        setBurnProgress(1)
        setBurnPhase('burnout')
      } else {
        setTearProgress(1)
        setRipProgress(1)
        setTearPhase('separation')
      }
    } else if (!isFlipped && cardState === 'revealed') {
      setCardState('idle')
      setTearProgress(0)
      setRipProgress(0)
      setTearPhase('idle')
      setBurnProgress(0)
      setBurnPhase('idle')
      setEmbers([])
      setSmokePuffs([])
      setGoldSeamOpacity(0)
    }
  }

  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (goldSeamTimeoutRef.current !== null) {
      clearTimeout(goldSeamTimeoutRef.current)
      goldSeamTimeoutRef.current = null
    }
    if (safetyTimerRef.current !== null) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearAllAnimations()
  }, [clearAllAnimations, prompt])

  // FIX A: Immediate clean reset to idle state
  const resetToCleanIdle = useCallback(() => {
    clearAllAnimations()
    setTearProgress(0)
    setRipProgress(0)
    setTearPhase('idle')
    setJitterOffset({ x: 0, y: 0 })
    setBurnProgress(0)
    setBurnPhase('idle')
    setEmbers([])
    setSmokePuffs([])
    setGoldSeamOpacity(0)
    setIsDragging(false)
    hasClaimedRef.current = false
    pointerStartRef.current = null
    setCardState('idle')
    onFlipChange?.(false)
    containerRef.current?.focus()
    setLiveAnnouncement('Question')
  }, [clearAllAnimations, onFlipChange])

  // Hard guard safety timer: if running or restoring lasts duration + 1000ms, force recovery
  useEffect(() => {
    if (safetyTimerRef.current !== null) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }

    if (cardState === 'tearing' || cardState === 'burning') {
      const expectedDur = (activeVariant === 'burn' ? 1500 : 950) * slowMultiplier
      safetyTimerRef.current = setTimeout(() => {
        clearAllAnimations()
        if (activeVariant === 'burn') {
          setBurnProgress(1)
          setBurnPhase('burnout')
          setEmbers([])
          setSmokePuffs([])
        } else {
          setTearProgress(1)
          setRipProgress(1)
          setTearPhase('separation')
          setJitterOffset({ x: 0, y: 0 })
        }
        setCardState('revealed')
        onFlipChange?.(true)
      }, expectedDur + 1000)
    } else if (cardState === 'reassembling' || cardState === 'rewinding') {
      const expectedDur = (activeVariant === 'burn' ? 950 : 700) * slowMultiplier
      safetyTimerRef.current = setTimeout(() => {
        resetToCleanIdle()
      }, expectedDur + 1000)
    }

    return () => {
      if (safetyTimerRef.current !== null) {
        clearTimeout(safetyTimerRef.current)
        safetyTimerRef.current = null
      }
    }
  }, [cardState, activeVariant, slowMultiplier, clearAllAnimations, onFlipChange, resetToCleanIdle])

  // Watch for theme switches to safely land any in-flight animations in clean idle
  useEffect(() => {
    if (typeof document === 'undefined') return
    const observer = new MutationObserver(() => {
      if (
        cardState === 'tearing' ||
        cardState === 'burning' ||
        cardState === 'reassembling' ||
        cardState === 'rewinding'
      ) {
        resetToCleanIdle()
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    return () => observer.disconnect()
  }, [cardState, resetToCleanIdle])

  // --------------------------------------------------------------------------
  // TEAR GEOMETRY: DETERMINISTIC JAGGED TEAR LINE PASSING THROUGH TAP POINT
  // --------------------------------------------------------------------------
  const tearData = useMemo(() => {
    const seed = hashString(prompt)
    const rand = createRng(seed)
    // Angled between -14 and +14 degrees
    const angleDeg = -14 + rand() * 28
    const angleRad = (angleDeg * Math.PI) / 180
    // Aspect ratio correction (width:height is approx 1.4-1.8)
    const slope = Math.tan(angleRad) * 0.7

    const count = 14 // 14 jagged segments
    const points: { x: number; y: number }[] = []
    const fibrePointsTop: { x: number; y: number }[] = []
    const fibrePointsBottom: { x: number; y: number }[] = []

    const tapX = tapCoords.x
    const tapY = tapCoords.y

    for (let i = 0; i <= count; i++) {
      const x = Math.round((i / count) * 1000) / 10
      // Line passing through (tapX, tapY)
      const baseY = tapY + slope * (x - tapX)
      // 3 to 7px amplitude (approx 1.2% to 2.8% of height)
      const amp = 1.2 + rand() * 1.6
      const jitter = (rand() - 0.5) * amp * 2
      const y = Math.min(88, Math.max(12, Math.round((baseY + jitter) * 10) / 10))
      points.push({ x, y })

      // Fibrous edge jitter
      const fibreJitter = 0.5 + rand() * 0.4
      fibrePointsTop.push({ x, y: Math.min(90, y + fibreJitter) })
      fibrePointsBottom.push({ x, y: Math.max(10, y - fibreJitter) })
    }

    // Top polygon (clockwise)
    const topPts = [
      '0% 0%',
      '100% 0%',
      ...points.slice().reverse().map((p) => `${p.x}% ${p.y}%`),
      `0% ${points[0].y}%`,
    ]
    const topClip = `polygon(${topPts.join(', ')})`

    // Bottom polygon (clockwise)
    const bottomPts = [
      `0% ${points[0].y}%`,
      ...points.map((p) => `${p.x}% ${p.y}%`),
      '100% 100%',
      '0% 100%',
    ]
    const bottomClip = `polygon(${bottomPts.join(', ')})`

    const linePath = points.map((p) => `${p.x},${p.y}`).join(' ')
    const topFibrePath = fibrePointsTop.map((p) => `${p.x},${p.y}`).join(' ')
    const bottomFibrePath = fibrePointsBottom.map((p) => `${p.x},${p.y}`).join(' ')

    return {
      topClip,
      bottomClip,
      linePath,
      topFibrePath,
      bottomFibrePath,
      points,
      angleDeg,
    }
  }, [prompt, tapCoords])

  // --------------------------------------------------------------------------
  // BURN GEOMETRY: 22 SEEDED CIRCLES AROUND TAP POINT WITH ORGANIC JITTER
  // --------------------------------------------------------------------------
  const burnCircles = useMemo(() => {
    const seed = hashString(prompt) + 7919
    const rand = createRng(seed)
    const circles: { cx: number; cy: number; r: number }[] = []
    const count = 22 // 18-26 circles
    for (let i = 0; i < count; i++) {
      // Offset jitter up to 18% of radius around tap point
      const angle = rand() * Math.PI * 2
      const dist = rand() * 18
      const cx = tapCoords.x + Math.cos(angle) * dist
      const cy = tapCoords.y + Math.sin(angle) * dist
      // Radius varies between 0.6 and 1.0
      const r = 0.6 + rand() * 0.4
      circles.push({ cx, cy, r })
    }
    return circles
  }, [prompt, tapCoords])

  // --------------------------------------------------------------------------
  // TEAR ANIMATION: 950MS (ANTICIPATION -> ZIP RIP -> SEPARATION)
  // --------------------------------------------------------------------------
  const startTearAnimation = useCallback(
    (initialProgress = 0) => {
      if (cardState !== 'idle' && cardState !== 'tearing') return

      if (isReducedMotion) {
        setTearProgress(1)
        setRipProgress(1)
        setTearPhase('separation')
        setCardState('revealed')
        onFlipChange?.(true)
        return
      }

      setCardState('tearing')
      clearAllAnimations()

      // Base timings multiplied by dev ?fxslow=
      const totalDur = 950 * slowMultiplier
      const anticipationDur = 120 * slowMultiplier
      const ripDur = 350 * slowMultiplier
      const sepDur = 480 * slowMultiplier

      const startT = performance.now()
      const startP = initialProgress

      const animate = (now: number) => {
        const elapsed = (now - startT) + startP * totalDur

        if (elapsed < anticipationDur) {
          // 1. Anticipation: 1px press, 2px horizontal jitter
          setTearPhase('anticipation')
          const jitterProgress = elapsed / anticipationDur
          const jx = Math.sin(jitterProgress * Math.PI * 4) * 2
          setJitterOffset({ x: jx, y: 1 })
          setTearProgress(0)
          setRipProgress(0)
          tearAnimRef.current = requestAnimationFrame(animate)
        } else if (elapsed < anticipationDur + ripDur) {
          // 2. Rip: 120-470ms (350ms). Zip opens from tap side to far side
          setTearPhase('rip')
          setJitterOffset({ x: 0, y: 0 })
          const ripElapsed = elapsed - anticipationDur
          const ripP = Math.min(1, ripElapsed / ripDur)
          setRipProgress(ripP)
          setTearProgress(ripP * 0.2) // slight start
          tearAnimRef.current = requestAnimationFrame(animate)
        } else if (elapsed < totalDur) {
          // 3. Separation: 470-950ms (480ms)
          setTearPhase('separation')
          setRipProgress(1)
          const sepElapsed = elapsed - anticipationDur - ripDur
          const raw = Math.min(1, sepElapsed / sepDur)
          // Smooth ease-out cubic
          const ease = 1 - Math.pow(1 - raw, 3)
          setTearProgress(ease)
          tearAnimRef.current = requestAnimationFrame(animate)
        } else {
          // Completed
          setTearPhase('separation')
          setRipProgress(1)
          setTearProgress(1)
          setJitterOffset({ x: 0, y: 0 })
          setCardState('revealed')
          onFlipChange?.(true)
        }
      }

      tearAnimRef.current = requestAnimationFrame(animate)
    },
    [cardState, isReducedMotion, onFlipChange, clearAllAnimations, slowMultiplier]
  )

  // --------------------------------------------------------------------------
  // TEAR REASSEMBLE: 700MS SPRING SETTLE (STIFFNESS 170, DAMPING 18, 2-3PX SETTLE)
  // --------------------------------------------------------------------------
  const startReassembleAnimation = useCallback(() => {
    if (cardState !== 'revealed' && cardState !== 'tearing') return

    clearAllAnimations()

    if (isReducedMotion) {
      setCardState('idle')
      setTearProgress(0)
      setRipProgress(0)
      setTearPhase('idle')
      setGoldSeamOpacity(0)
      onFlipChange?.(false)
      containerRef.current?.focus()
      setLiveAnnouncement('Question')
      return
    }

    setCardState('reassembling')
    const startProgress = tearProgressRef.current || 1
    const duration = 700 * slowMultiplier
    const startT = performance.now()
    let seamFired = false

    const animate = (now: number) => {
      const elapsed = now - startT
      const t = Math.min(1, elapsed / duration)

      // Spring damped fraction with 2-3px settle
      const fraction = springDampedFraction(t)
      const currentP = startProgress * fraction
      setTearProgress(currentP)
      setRipProgress(currentP)

      // Thin gold seam lights along tear line as edges meet and fades over 300ms
      if (!seamFired && currentP <= 0.08) {
        seamFired = true
        setGoldSeamOpacity(1)
        goldSeamTimeoutRef.current = setTimeout(() => {
          setGoldSeamOpacity(0)
        }, 300 * slowMultiplier)
      }

      if (t < 1) {
        tearAnimRef.current = requestAnimationFrame(animate)
      } else {
        // Complete reassembly cleanly: no leftover transforms or stray clip paths
        setTearProgress(0)
        setRipProgress(0)
        setTearPhase('idle')
        setJitterOffset({ x: 0, y: 0 })
        setCardState('idle')
        onFlipChange?.(false)

        containerRef.current?.focus()
        setLiveAnnouncement('Question')
      }
    }

    tearAnimRef.current = requestAnimationFrame(animate)
  }, [cardState, isReducedMotion, onFlipChange, clearAllAnimations, slowMultiplier])

  // --------------------------------------------------------------------------
  // BURN ANIMATION: 1500MS (IGNITION -> ORGANIC EXPANSION -> BURNOUT)
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
      setTapCoords({ x: originX, y: originY })

      if (isReducedMotion || isLowEndDevice) {
        setBurnProgress(1)
        setBurnPhase('burnout')
        setCardState('revealed')
        onFlipChange?.(true)
        return
      }

      setCardState('burning')
      clearAllAnimations()

      // Spawn 16 rising embers and 4 soft smoke puffs
      const newEmbers: EmberSpeck[] = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: originX + (Math.random() - 0.5) * 30,
        y: originY + (Math.random() - 0.5) * 20,
        driftY: 40 + Math.random() * 70, // 40-110px rise
        driftX: (Math.random() - 0.5) * 35, // sideways curl
        size: 2 + Math.random() * 2.5,
        opacity: 0.6 + Math.random() * 0.4,
      }))
      setEmbers(newEmbers)

      const newSmoke: SmokePuff[] = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        x: originX + (Math.random() - 0.5) * 25,
        y: originY + (Math.random() - 0.5) * 15,
        driftY: 30 + Math.random() * 45,
        size: 14 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.1, // <= 0.25 opacity
      }))
      setSmokePuffs(newSmoke)

      const totalDur = 1500 * slowMultiplier
      const ignitionDur = 200 * slowMultiplier
      const spreadDur = 1100 * slowMultiplier

      const startT = performance.now()
      const startP = initialProgress

      const animate = (now: number) => {
        const elapsed = (now - startT) + startP * totalDur

        if (elapsed < ignitionDur) {
          // 0-200ms: Ignition. Tap point chars dark, tiny 6px ember glows
          setBurnPhase('ignition')
          const p = elapsed / ignitionDur
          setBurnProgress(p * 0.04)
          burnAnimRef.current = requestAnimationFrame(animate)
        } else if (elapsed < ignitionDur + spreadDur) {
          // 200-1300ms: Spread. Hole expands organically to corners
          setBurnPhase('spread')
          const spreadElapsed = elapsed - ignitionDur
          const raw = spreadElapsed / spreadDur
          // Accelerating then settling (ease-in-out cubic)
          const ease = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2
          setBurnProgress(0.04 + ease * 0.96)
          burnAnimRef.current = requestAnimationFrame(animate)
        } else if (elapsed < totalDur) {
          // 1300-1500ms: Burn out. Embers cool to char, rim fades, answer clear
          setBurnPhase('burnout')
          setBurnProgress(1)
          burnAnimRef.current = requestAnimationFrame(animate)
        } else {
          // Completed
          setBurnProgress(1)
          setBurnPhase('burnout')
          setEmbers([])
          setSmokePuffs([])
          setCardState('revealed')
          onFlipChange?.(true)
        }
      }

      burnAnimRef.current = requestAnimationFrame(animate)
    },
    [cardState, isReducedMotion, isLowEndDevice, onFlipChange, clearAllAnimations, slowMultiplier]
  )

  // --------------------------------------------------------------------------
  // BURN REWIND: 950MS (HOLE CLOSES, PARTICLES REVERSE, ENDS CLEAN)
  // --------------------------------------------------------------------------
  const startRewindAnimation = useCallback(() => {
    if (cardState !== 'revealed' && cardState !== 'burning') return

    clearAllAnimations()

    if (isReducedMotion || isLowEndDevice) {
      setBurnProgress(0)
      setBurnPhase('idle')
      setEmbers([])
      setSmokePuffs([])
      setCardState('idle')
      onFlipChange?.(false)
      containerRef.current?.focus()
      setLiveAnnouncement('Question')
      return
    }

    setCardState('rewinding')
    const startP = burnProgressRef.current || 1
    const duration = 950 * slowMultiplier
    const startT = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startT
      const t = Math.min(1, elapsed / duration)
      // Ease-in-out rewind
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const currentP = Math.max(0, startP * (1 - ease))
      setBurnProgress(currentP)

      if (t < 1) {
        burnAnimRef.current = requestAnimationFrame(animate)
      } else {
        // Ends clean: no char marks, no particles, no leftover mask
        setBurnProgress(0)
        setBurnPhase('idle')
        setEmbers([])
        setSmokePuffs([])
        setCardState('idle')
        onFlipChange?.(false)

        containerRef.current?.focus()
        setLiveAnnouncement('Question')
      }
    }

    burnAnimRef.current = requestAnimationFrame(animate)
  }, [cardState, isReducedMotion, isLowEndDevice, onFlipChange, clearAllAnimations, slowMultiplier])

  // --------------------------------------------------------------------------
  // RESTORE BUTTON & UNDERLAY CLICK HANDLERS
  // --------------------------------------------------------------------------
  const handleRestoreClick = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent | React.PointerEvent) => {
      e?.stopPropagation()
      if (cardState === 'tearing' || cardState === 'burning') {
        resetToCleanIdle()
        return
      }
      if (activeVariant === 'burn') {
        startRewindAnimation()
      } else {
        startReassembleAnimation()
      }
    },
    [cardState, activeVariant, resetToCleanIdle, startRewindAnimation, startReassembleAnimation]
  )

  const handleUnderlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // FIX A: Allow tapping/clicking anywhere on the revealed answer card to restore
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) return
      if (cardState === 'revealed') {
        handleRestoreClick(e)
      }
    },
    [cardState, handleRestoreClick]
  )

  // --------------------------------------------------------------------------
  // POINTER DRAG & TAP HANDLING
  // --------------------------------------------------------------------------
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // FIX A: Allow tapping or clicking the revealed answer card to restore
    if (cardState === 'revealed') {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) return
      handleRestoreClick(e)
      return
    }

    // FIX A: Interruption safety - tapping again mid-animation (tearing, burning, reassembling, rewinding)
    // cleanly settles in idle immediately
    if (
      cardState === 'tearing' ||
      cardState === 'burning' ||
      cardState === 'reassembling' ||
      cardState === 'rewinding'
    ) {
      resetToCleanIdle()
      return
    }

    if (cardState !== 'idle') return
    if (e.button !== 0) return

    const container = containerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
      setTapCoords({ x: Math.max(5, Math.min(95, x)), y: Math.max(15, Math.min(85, y)) })
    }

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
        // Vertical scroll intent -> do not capture or block scroll
        setIsDragging(false)
        return
      }
    }

    if (hasClaimedRef.current && containerRef.current && activeVariant === 'tear') {
      const width = containerRef.current.clientWidth || 300
      const progress = Math.min(1, Math.max(0, Math.abs(dx) / (width * 0.45)))
      setTearProgress(progress)
      setRipProgress(Math.min(1, progress * 1.5))
    }
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)

    if (hasClaimedRef.current && activeVariant === 'tear') {
      if (tearProgress >= 0.35) {
        startTearAnimation(tearProgress)
      } else {
        startReassembleAnimation()
      }
    } else {
      // Direct tap or click without dragging
      if (activeVariant === 'burn') {
        startBurnAnimation(e.clientX, e.clientY)
      } else {
        startTearAnimation(0)
      }
    }

    pointerStartRef.current = null
    hasClaimedRef.current = false
  }

  const handlePointerCancel = () => {
    if (cardState === 'tearing' || cardState === 'burning') {
      resetToCleanIdle()
      return
    }
    setIsDragging(false)
    hasClaimedRef.current = false
    pointerStartRef.current = null
    if (cardState === 'idle') {
      setTearProgress(0)
      setRipProgress(0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement
      if (target.closest('.flip-restore-btn')) return
      e.preventDefault()

      // Center coordinates for keyboard triggers
      setTapCoords({ x: 50, y: 50 })

      if (cardState === 'revealed') {
        handleRestoreClick(e)
      } else if (cardState === 'idle') {
        if (activeVariant === 'burn') {
          startBurnAnimation()
        } else {
          startTearAnimation(0)
        }
      } else if (
        cardState === 'tearing' ||
        cardState === 'burning' ||
        cardState === 'reassembling' ||
        cardState === 'rewinding'
      ) {
        // Interruption: immediate clean idle
        resetToCleanIdle()
      }
    }
  }

  // --------------------------------------------------------------------------
  // DYNAMIC STYLES: TEAR PIECES & BURN LAYERS
  // --------------------------------------------------------------------------
  const isTearActive = cardState === 'tearing' || cardState === 'reassembling'

  // Zip origin: anchored at the far side from the tap point
  const zipOrigin = useMemo(() => {
    const farX = tapCoords.x < 50 ? '100%' : '0%'
    return `${farX} ${tapCoords.y}%`
  }, [tapCoords])

  // Top half transform:
  // Phase 2 (Rip): rotate -2deg with transform-origin at far edge
  // Phase 3 (Separation): translate -5% x, -12% y, rotate -7deg, fade 1 to 0
  const topHalfStyle = useMemo(() => {
    if (cardState === 'idle') {
      return {
        transform: `translate(${jitterOffset.x}px, ${jitterOffset.y}px)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }
    if (cardState === 'revealed') {
      return {
        transform: 'translate(-5%, -12%) rotate(-7deg)',
        opacity: 0,
        pointerEvents: 'none' as const,
        transformOrigin: zipOrigin,
      }
    }

    if (tearPhase === 'anticipation') {
      return {
        transform: `translate(${jitterOffset.x}px, ${jitterOffset.y}px)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }

    if (tearPhase === 'rip') {
      const rot = -ripProgress * 2.2
      return {
        transform: `rotate(${rot}deg)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }

    // Separation & Reassembly
    const p = tearProgress
    const tx = -5 * p
    const ty = -12 * p
    const rot = -7 * p
    const op = Math.max(0, 1 - p)
    return {
      transform: `translate(${tx}%, ${ty}%) rotate(${rot}deg)`,
      opacity: op,
      filter: isTearActive
        ? `drop-shadow(0 ${4 + p * 12}px ${8 + p * 16}px rgba(0, 0, 0, ${0.25 + p * 0.25}))`
        : undefined,
      pointerEvents: p > 0.8 ? ('none' as const) : ('auto' as const),
      transformOrigin: zipOrigin,
    }
  }, [cardState, tearPhase, jitterOffset, zipOrigin, ripProgress, tearProgress, isTearActive])

  // Bottom half transform:
  // Phase 2 (Rip): rotate +1.6deg with transform-origin at far edge
  // Phase 3 (Separation): translate +4% x, +10% y, rotate +5deg, fade 1 to 0
  const bottomHalfStyle = useMemo(() => {
    if (cardState === 'idle') {
      return {
        transform: `translate(${jitterOffset.x}px, ${jitterOffset.y}px)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }
    if (cardState === 'revealed') {
      return {
        transform: 'translate(4%, 10%) rotate(5deg)',
        opacity: 0,
        pointerEvents: 'none' as const,
        transformOrigin: zipOrigin,
      }
    }

    if (tearPhase === 'anticipation') {
      return {
        transform: `translate(${jitterOffset.x}px, ${jitterOffset.y}px)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }

    if (tearPhase === 'rip') {
      const rot = ripProgress * 1.6
      return {
        transform: `rotate(${rot}deg)`,
        opacity: 1,
        transformOrigin: zipOrigin,
      }
    }

    // Separation & Reassembly
    const p = tearProgress
    const tx = 4 * p
    const ty = 10 * p
    const rot = 5 * p
    const op = Math.max(0, 1 - p)
    return {
      transform: `translate(${tx}%, ${ty}%) rotate(${rot}deg)`,
      opacity: op,
      filter: isTearActive
        ? `drop-shadow(0 ${4 + p * 12}px ${8 + p * 16}px rgba(0, 0, 0, ${0.25 + p * 0.25}))`
        : undefined,
      pointerEvents: p > 0.8 ? ('none' as const) : ('auto' as const),
      transformOrigin: zipOrigin,
    }
  }, [cardState, tearPhase, jitterOffset, zipOrigin, ripProgress, tearProgress, isTearActive])

  // Underlay answer opacity
  const underlayOpacity = useMemo(() => {
    if (cardState === 'idle') return 0
    if (cardState === 'revealed') return 1
    if (activeVariant === 'burn') return Math.min(1, burnProgress * 1.2)
    return tearProgress
  }, [cardState, activeVariant, burnProgress, tearProgress])

  // SINGLE HINT TEXT AT BOTTOM CENTER
  const singleHintText = useMemo(() => {
    if (activeVariant === 'burn') {
      return canHover ? 'Click to burn the page' : 'Tap to burn the page'
    }
    return canHover ? 'Click to tear the page' : 'Tap to tear the page'
  }, [activeVariant, canHover])

  // Front card content renderer (shared identical front)
  const renderFrontFace = () => (
    <div className="flip-card-face-content">
      {/* Top Header Badge */}
      <div className="flip-card-header">
        <div className="flip-badge">
          {activeVariant === 'burn' ? (
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
      </div>

      {/* Question Text Vertically Centered */}
      <p className="flip-prompt-text">{prompt}</p>

      {/* EXACTLY ONE HINT AT BOTTOM CENTER */}
      <div className="flip-footer-hint">
        <span>{singleHintText}</span>
      </div>
    </div>
  )

  const buttonLabel = activeVariant === 'tear' ? 'Put the page back together' : 'Restore the page'
  const burnRadiusPct = burnProgress * 140

  return (
    <div
      ref={containerRef}
      className={`flip-card-perspective-container ${className} ${
        activeVariant === 'burn' ? 'is-burn-variant' : 'is-tear-variant'
      } state-${cardState}`}
      data-burn-phase={activeVariant === 'burn' ? burnPhase : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Interactive ${activeVariant} card: ${prompt}`}
      aria-expanded={cardState === 'revealed'}
    >
      {/* Screen-reader live announcement for accessibility */}
      <span className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </span>

      <div className="flip-card-grid-container">
        {/* ================================================================== */}
        {/* 1. UNDERLAY REVEALED ANSWER LAYER (NORMAL FLOW SETS CARD HEIGHT)   */}
        {/* ================================================================== */}
        <div
          className={`flip-card-layer flip-card-underlay ${
            cardState === 'revealed' ? 'is-active' : ''
          }`}
          style={{
            opacity: underlayOpacity,
            pointerEvents: cardState === 'revealed' ? 'auto' : 'none',
          }}
          onClick={handleUnderlayClick}
          aria-hidden={cardState === 'idle'}
        >
          <div className="flip-card-face-content">
            <div className="flip-card-header">
              <div className="flip-badge flip-badge-back">
                <Sparkles size={14} className="text-gold" aria-hidden="true" />
                <span>THE ANSWER</span>
              </div>
            </div>

            <p className="flip-reveal-text">{reveal}</p>

            <div className="flip-card-answer-footer">
              <div className="flip-source-line">
                <CheckCircle2 size={13} className="text-success" aria-hidden="true" />
                <span>{source}</span>
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
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. TEAR VARIANT: DUAL IDENTICAL FRONT COPIES CLIPPED TO TEAR LINE  */}
        {/* ================================================================== */}
        {activeVariant === 'tear' && (
          <div
            className={`flip-card-layer flip-card-tear-wrapper ${
              cardState === 'revealed' ? 'is-torn' : ''
            }`}
            aria-hidden={cardState === 'revealed'}
          >
            {/* TOP HALF COPY */}
            <div
              className={`tear-half tear-top-half ${
                isTearActive ? 'is-active' : ''
              }`}
              style={{
                clipPath: tearData.topClip,
                WebkitClipPath: tearData.topClip,
                ...topHalfStyle,
              }}
            >
              <div className="tear-half-inner">{renderFrontFace()}</div>
              {/* Pale fibrous edge along the jagged line */}
              <svg
                className="tear-fibre-edge-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={tearData.topFibrePath}
                  fill="none"
                  stroke="var(--tear-fibre-color, rgba(255, 255, 255, 0.75))"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* BOTTOM HALF COPY */}
            <div
              className={`tear-half tear-bottom-half ${
                isTearActive ? 'is-active' : ''
              }`}
              style={{
                clipPath: tearData.bottomClip,
                WebkitClipPath: tearData.bottomClip,
                ...bottomHalfStyle,
              }}
            >
              <div className="tear-half-inner">{renderFrontFace()}</div>
              {/* Pale fibrous edge along the jagged line */}
              <svg
                className="tear-fibre-edge-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={tearData.bottomFibrePath}
                  fill="none"
                  stroke="var(--tear-fibre-color, rgba(255, 255, 255, 0.75))"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* THIN GOLD SEAM: LIGHTS ALONG TEAR LINE & FADES OVER 300MS */}
            {goldSeamOpacity > 0 && (
              <svg
                className="tear-gold-seam-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{
                  opacity: goldSeamOpacity,
                  transition: `opacity ${300 * slowMultiplier}ms ease`,
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
        )}

        {/* ================================================================== */}
        {/* 3. BURN VARIANT: ORGANIC HOLE WITH 4 EDGE LAYERS & PARTICLES       */}
        {/* ================================================================== */}
        {activeVariant === 'burn' && (
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
                    mask: burnProgress > 0 ? `url(#${maskId})` : 'none',
                    WebkitMask: burnProgress > 0 ? `url(#${maskId})` : 'none',
                    opacity: cardState === 'revealed' ? 0 : 1,
                    pointerEvents: cardState === 'revealed' ? 'none' : 'auto',
                  }
            }
          >
            {/* SVG Defs for organic turbulence displacement filter and hole mask */}
            <svg
              className="burn-defs-svg"
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <defs>
                <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04"
                    numOctaves="3"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="12"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
                <mask id={maskId}>
                  {/* White background: front surface intact */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Black filtered group: burns away organic hole */}
                  {burnProgress > 0 && (
                    <g filter={`url(#${filterId})`} fill="black">
                      {burnCircles.map((c, i) => (
                        <circle
                          key={i}
                          cx={`${c.cx}%`}
                          cy={`${c.cy}%`}
                          r={`${Math.max(0, c.r * burnRadiusPct)}%`}
                        />
                      ))}
                    </g>
                  )}
                </mask>
              </defs>
            </svg>

            {/* Front Surface Content */}
            <div className="burn-front-inner">{renderFrontFace()}</div>

            {/* 4 EDGE LAYERS OVER HOLE: SCORCHED BAND, CHAR RIM, EMBER RIM */}
            {(cardState === 'burning' || cardState === 'rewinding') &&
              !isLowEndDevice &&
              !isReducedMotion &&
              burnProgress > 0 && (
                <svg
                  className="burn-edge-layers-svg"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  <g filter={`url(#${filterId})`}>
                    {/* Layer 4: Scorched Paper Gradient Band (30-40px) */}
                    {burnCircles.map((c, i) => (
                      <circle
                        key={`scorch-${i}`}
                        cx={`${c.cx}%`}
                        cy={`${c.cy}%`}
                        r={`${Math.max(0, c.r * burnRadiusPct + 4)}%`}
                        fill="none"
                        stroke="rgba(58, 25, 10, 0.45)"
                        strokeWidth="18"
                        vectorEffect="non-scaling-stroke"
                        opacity={Math.min(0.85, burnProgress * 1.5)}
                      />
                    ))}

                    {/* Layer 3: Near-Black Char Rim (10-16px) */}
                    {burnCircles.map((c, i) => (
                      <circle
                        key={`char-${i}`}
                        cx={`${c.cx}%`}
                        cy={`${c.cy}%`}
                        r={`${Math.max(0, c.r * burnRadiusPct + 1)}%`}
                        fill="none"
                        stroke="#1a0d05"
                        strokeWidth="12"
                        vectorEffect="non-scaling-stroke"
                        opacity={Math.min(0.95, burnProgress * 1.8)}
                      />
                    ))}

                    {/* Layer 2: Glowing Ember Rim (3-5px, pulsating <= 15% at <= 2Hz) */}
                    {burnCircles.map((c, i) => (
                      <circle
                        key={`ember-${i}`}
                        cx={`${c.cx}%`}
                        cy={`${c.cy}%`}
                        r={`${Math.max(0, c.r * burnRadiusPct - 0.5)}%`}
                        fill="none"
                        stroke="#ff5a1f"
                        strokeWidth="4"
                        vectorEffect="non-scaling-stroke"
                        className="burn-pulsing-ember-rim"
                        opacity={Math.min(1, burnProgress * 2)}
                      />
                    ))}
                  </g>
                </svg>
              )}

            {/* 16 RISING / REWINDING EMBER PARTICLES */}
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
                    transform: `translate(${speck.driftX * burnProgress}px, -${
                      speck.driftY * burnProgress
                    }px)`,
                    opacity: speck.opacity * Math.max(0, 1 - burnProgress * 0.4),
                  }}
                  aria-hidden="true"
                />
              ))}

            {/* 4 SOFT SMOKE PUFFS (OPACITY <= 0.25) */}
            {(cardState === 'burning' || cardState === 'rewinding') &&
              !isLowEndDevice &&
              !isReducedMotion &&
              smokePuffs.map((puff) => (
                <span
                  key={puff.id}
                  className="burn-smoke-puff"
                  style={{
                    left: `${puff.x}%`,
                    top: `${puff.y}%`,
                    width: `${puff.size}px`,
                    height: `${puff.size}px`,
                    transform: `translateY(-${puff.driftY * burnProgress}px) scale(${
                      1 + burnProgress * 0.8
                    })`,
                    opacity: puff.opacity * Math.max(0, 1 - burnProgress * 0.7),
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
