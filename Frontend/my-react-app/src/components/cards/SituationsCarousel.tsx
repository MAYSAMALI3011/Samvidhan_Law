import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  Home,
  Scale,
  ShieldAlert,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

export interface SituationItem {
  id: string
  title: string
  badge: string
  description: string
  actionLabel: string
  to: string
  icon: LucideIcon
}

export const situationsList: SituationItem[] = [
  {
    id: 'rights',
    title: 'Fundamental Rights & Writ Petitions',
    badge: 'Part III of the Constitution',
    description:
      'Enforce Article 14 equality, Article 19 freedoms, and Article 32 constitutional remedies against arbitrary state action.',
    actionLabel: 'Examine Part III Remedies',
    to: '/constitution/part-iii',
    icon: Scale,
  },
  {
    id: 'police',
    title: 'Police Encounters & Arrest Safeguards',
    badge: 'Section 154 CrPC / D.K. Basu Guidelines',
    description:
      'Mandatory rights upon arrest, zero FIR procedure, bail fundamentals, and memo inspection.',
    actionLabel: 'Explore Arrest Safeguards',
    to: '/library/fir-checklist',
    icon: ShieldAlert,
  },
  {
    id: 'rti',
    title: 'Filing an RTI Application',
    badge: 'Right to Information Act, 2005',
    description:
      'Demand transparency from public authorities, statutory deadlines, and query drafting.',
    actionLabel: 'Read RTI Filing Guide',
    to: '/library/sample-rti-application',
    icon: FileText,
  },
  {
    id: 'consumer',
    title: 'Consumer Fraud & Defective Goods',
    badge: 'Consumer Protection Act, 2019',
    description:
      'Identify misleading advertisements, calculate compensation jurisdiction, and file statutory notices.',
    actionLabel: 'View Consumer Checklist',
    to: '/library/sample-consumer-checklist',
    icon: ShoppingBag,
  },
  {
    id: 'tenant',
    title: 'Tenant Rights & Security Deposits',
    badge: 'Model Tenancy Framework',
    description:
      'Understand lawful eviction standards, rent agreement clauses, and deposit recovery mechanisms.',
    actionLabel: 'Review Tenancy Protections',
    to: '/learn/daily-life-protections',
    icon: Home,
  },
  {
    id: 'workplace',
    title: 'Workplace Rights & Severance',
    badge: 'Industrial Relations & POSH Frameworks',
    description:
      'Legal entitlements on notice periods, workplace harassment prevention, and fair wage rules.',
    actionLabel: 'Explore Workplace Law',
    to: '/learn/applied-civic-procedures',
    icon: Briefcase,
  },
]

export function SituationsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [mousePos, setMousePos] = useState<{ [key: string]: { x: number; y: number } }>({})
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 680) setCardsPerView(1)
        else if (window.innerWidth < 1080) setCardsPerView(2)
        else setCardsPerView(3)
      }
    }
    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  const maxIndex = Math.max(0, situationsList.length - cardsPerView)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  // Automatic movement every 3.5s unless hovered/focused
  useEffect(() => {
    if (isPaused) return
    timerRef.current = window.setInterval(() => {
      handleNext()
    }, 3500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, maxIndex])

  const handleCardMouseMove = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos((prev) => ({
      ...prev,
      [id]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    }))
  }

  const handleCardMouseLeave = (id: string) => {
    setMousePos((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div
      className="situations-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Practical Legal Situations"
    >
      {/* Top Controls: Kicker & Next/Prev Navigation */}
      <div className="situations-carousel-controls">
        <div className="carousel-indicator-pills" role="tablist" aria-label="Select situation slide">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              className={`carousel-dot-btn ${idx === currentIndex ? 'is-active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span className="dot-fill" />
            </button>
          ))}
        </div>

        <div className="carousel-nav-arrows">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous situation"
            title="Previous"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleNext}
            aria-label="Next situation"
            title="Next"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The Moving Track Viewport */}
      <div className="situations-carousel-viewport">
        <div
          className="situations-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 396}px)`,
          }}
        >
          {situationsList.map((item) => {
            const Icon = item.icon
            const glow = mousePos[item.id]

            return (
              <Link
                key={item.id}
                to={item.to}
                onMouseMove={(e) => handleCardMouseMove(item.id, e)}
                onMouseLeave={() => handleCardMouseLeave(item.id)}
                className="situation-uniform-card"
                aria-label={`${item.title} — ${item.badge}`}
              >
                {/* Dynamic Cursor-Following Radial Glow */}
                {glow && (
                  <div
                    className="card-cursor-glow"
                    style={{
                      left: `${glow.x}px`,
                      top: `${glow.y}px`,
                    }}
                    aria-hidden="true"
                  />
                )}

                <div className="situation-card-header">
                  <div className="situation-icon-box">
                    <Icon size={22} className="text-gold" aria-hidden="true" />
                  </div>
                  <span className="situation-badge">{item.badge}</span>
                </div>

                <div className="situation-card-body">
                  <h3 className="situation-card-title">{item.title}</h3>
                  <p className="situation-card-desc">{item.description}</p>
                </div>

                <div className="situation-card-footer">
                  <span className="situation-action-text">{item.actionLabel}</span>
                  <ArrowRight size={16} className="situation-action-arrow text-gold" aria-hidden="true" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
