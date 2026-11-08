import { useState, useRef, useEffect } from 'react'
import { Compass, BookOpen, ShieldCheck } from 'lucide-react'

interface Step {
  number: string
  title: string
  description: string
  icon: typeof Compass
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Discover Your Scenario',
    description:
      'Select from everyday civic situations, constitutional rights, or statutory procedures based on your learning goals.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Read Plain-English Lessons',
    description:
      'Study curated lessons written without legalese, complete with key definitions, statutory timelines, and real-life case studies.',
    icon: BookOpen,
  },
  {
    number: '03',
    title: 'Verify Official Citations',
    description:
      'Cross-reference provisions directly with verbatim extracts from the Gazette of India, the Constitution, and Supreme Court rulings.',
    icon: ShieldCheck,
  },
]

export function StepsTimeline() {
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`steps-timeline-container ${isInView ? 'is-animated' : ''}`}
      aria-label="Learning methodology steps"
    >
      {/* Connecting Horizontal Line (desktop) / Vertical Line (mobile) */}
      <div className="steps-connecting-track" aria-hidden="true">
        <div className="steps-connecting-fill" />
      </div>

      <div className="steps-grid-row">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div
              key={step.number}
              className="step-timeline-card samvidhan-glow-card"
              style={{
                transitionDelay: `${idx * 160}ms`,
              }}
            >
              <div className="step-marker-header">
                <div className="step-circle-wrap">
                  {/* SVG Animated Circle */}
                  <svg className="step-circle-svg" viewBox="0 0 54 54" aria-hidden="true">
                    <circle
                      className="step-circle-bg"
                      cx="27"
                      cy="27"
                      r="23"
                    />
                    <circle
                      className="step-circle-stroke"
                      cx="27"
                      cy="27"
                      r="23"
                    />
                  </svg>
                  <span className="step-circle-number">{step.number}</span>
                </div>

                <div className="step-icon-badge" aria-hidden="true">
                  <Icon size={18} />
                </div>
              </div>

              <h3 className="step-card-title">{step.title}</h3>
              <p className="step-card-desc">{step.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
