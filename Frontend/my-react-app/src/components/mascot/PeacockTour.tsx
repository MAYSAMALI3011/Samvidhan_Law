import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mor, type MorMood } from './Mor'
import { ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, Compass } from 'lucide-react'
import './peacock-tour.css'

export interface TourStep {
  id: string
  targetId: string
  title: string
  text: string
  mood: MorMood
  actionLabel?: string
  actionUrl?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: 'hero-mascot-companion',
    title: 'Hi! I am Mor, your peacock friend.',
    text: 'Welcome to Samvidhan! You never have to guess what to do. I will show you around in 1 minute so you always know where to click.',
    mood: 'wave',
  },
  {
    id: 'guided-path',
    targetId: 'guided-journey-strip',
    title: '1. Your Simple 3-Step Path',
    text: 'Follow these 3 easy steps anytime: 1. Read a 3-minute lesson, 2. Try an interactive practice card, and 3. Get help for real situations.',
    mood: 'encourage',
  },
  {
    id: 'hero-lesson',
    targetId: 'hero-cta-buttons',
    title: '2. Start a Free Lesson (No Sign-Up)',
    text: 'Touch this golden button anytime to begin. Lessons take only 3 minutes, use simple English words, and are 100% free for all citizens.',
    mood: 'reading',
  },
  {
    id: 'burn-card',
    targetId: 'interactive-lab-section',
    title: '3. Test Your Rights (Burn the Card!)',
    text: 'Touch or tap this card! It burns away to reveal a surprising real law about police and arrest rights. You can also take the quick quiz right next to it.',
    mood: 'thinking',
  },
  {
    id: 'situations',
    targetId: 'situations-section',
    title: '4. Help for Daily Life Problems',
    text: 'Have a question about police, landlord rent, or defective products? Touch any situation card for clear steps you can follow.',
    mood: 'encourage',
  },
  {
    id: 'ask-assistant',
    targetId: 'ask-preview-section',
    title: '5. Ask Me Any Legal Question',
    text: 'Have a question on your mind? Touch "Ask a Legal Question" and ask anything in simple words. I will explain what Indian law says!',
    mood: 'thinking',
  },
  {
    id: 'ready',
    targetId: 'hero-cta-buttons',
    title: 'You Are All Set!',
    text: 'See? It is that simple! Touch "Start My Free Lesson" below and let’s learn your constitutional rights together.',
    mood: 'celebrate',
    actionLabel: 'Start My Free Lesson',
    actionUrl: '/learn/foundations-of-the-republic/preamble-we-the-people',
  },
]

export function PeacockTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAutoInvite, setShowAutoInvite] = useState(false)
  const navigate = useNavigate()

  // Listen for custom start event
  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0)
      setIsOpen(true)
      setShowAutoInvite(false)
    }

    window.addEventListener('start-peacock-tour', handleStart)
    return () => window.removeEventListener('start-peacock-tour', handleStart)
  }, [])

  // Check if first-time visitor; if so, show a polite invite after 2.2s
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('samvidhan_seen_peacock_tour')
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setShowAutoInvite(true)
        }, 2200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Close tour
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setShowAutoInvite(false)
    try {
      localStorage.setItem('samvidhan_seen_peacock_tour', 'true')
    } catch {
      // Ignore
    }
    // Remove all highlights
    document.querySelectorAll('.peacock-tour-target-active').forEach((el) => {
      el.classList.remove('peacock-tour-target-active')
    })
  }, [])

  const handleFinish = useCallback(() => {
    const step = TOUR_STEPS[currentStep]
    handleClose()
    if (step && step.actionUrl) {
      navigate(step.actionUrl)
    }
  }, [currentStep, handleClose, navigate])

  // Highlight and scroll to target
  useEffect(() => {
    if (!isOpen) return

    // Clean old highlights
    document.querySelectorAll('.peacock-tour-target-active').forEach((el) => {
      el.classList.remove('peacock-tour-target-active')
    })

    const step = TOUR_STEPS[currentStep]
    if (!step) return

    const targetEl = document.getElementById(step.targetId)
    if (targetEl) {
      targetEl.classList.add('peacock-tour-target-active')
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Handle Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep((s) => s + 1)
        } else {
          handleFinish()
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((s) => s - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (targetEl) {
        targetEl.classList.remove('peacock-tour-target-active')
      }
    }
  }, [isOpen, currentStep, handleClose, handleFinish])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const activeStep = TOUR_STEPS[currentStep]

  return (
    <>
      {/* 1. First-Time Gentle Floating Invite Bubble (Bottom-Left) */}
      {showAutoInvite && !isOpen && (
        <aside
          className="peacock-auto-invite-bubble"
          role="region"
          aria-label="Guided tour invitation"
        >
          <div className="peacock-invite-avatar">
            <Mor mood="wave" size={56} animate decorative />
          </div>
          <div className="peacock-invite-body">
            <div className="peacock-invite-header">
              <span className="peacock-invite-tag">
                <Sparkles size={11} aria-hidden="true" />
                Meet Your Guide
              </span>
              <button
                type="button"
                className="peacock-invite-close"
                onClick={() => {
                  setShowAutoInvite(false)
                  try {
                    localStorage.setItem('samvidhan_seen_peacock_tour', 'true')
                  } catch {
                    // Ignore
                  }
                }}
                aria-label="Dismiss tour invite"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
            <p className="peacock-invite-text">
              &ldquo;New here? Want me to show you where to start in 1 minute?&rdquo;
            </p>
            <div className="peacock-invite-btn-row">
              <button
                type="button"
                className="btn btn-primary btn-sm peacock-invite-start-btn"
                onClick={() => {
                  setCurrentStep(0)
                  setIsOpen(true)
                  setShowAutoInvite(false)
                }}
              >
                <span>Yes, show me!</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setShowAutoInvite(false)
                  try {
                    localStorage.setItem('samvidhan_seen_peacock_tour', 'true')
                  } catch {
                    // Ignore
                  }
                }}
              >
                <span>I&apos;ll explore</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Persistent Floating Pill (Bottom-Left) */}
      {!isOpen && !showAutoInvite && (
        <button
          type="button"
          className="peacock-tour-trigger-pill"
          onClick={() => {
            setCurrentStep(0)
            setIsOpen(true)
          }}
          title="Take a 1-minute guided tour with Mor the Peacock"
          aria-label="Take a 1-minute guided tour with Mor the Peacock"
        >
          <div className="trigger-avatar-wrap">
            <Mor mood="wave" size={32} animate decorative />
          </div>
          <div className="trigger-text-wrap">
            <span className="trigger-badge">Peacock Guide</span>
            <span className="trigger-sub">1-Min Tour</span>
          </div>
          <Compass size={14} className="trigger-compass-icon text-gold" aria-hidden="true" />
        </button>
      )}

      {/* 3. The Interactive Tour Overlay & Modal */}
      {isOpen && activeStep && (
        <div className="peacock-tour-backdrop-layer" role="dialog" aria-modal="true" aria-labelledby="peacock-step-title">
          <div className="peacock-tour-backdrop" onClick={handleClose} />

          <div className="peacock-tour-modal-card samvidhan-glow-card">
            {/* Mascot Avatar Column */}
            <div className="peacock-modal-mascot-col">
              <div className="peacock-mascot-pulse-ring">
                <Mor mood={activeStep.mood} size={84} animate decorative />
              </div>
            </div>

            {/* Dialog Content Column */}
            <div className="peacock-modal-content-col">
              <div className="peacock-modal-top-row">
                <span className="peacock-step-pill">
                  <Sparkles size={11} aria-hidden="true" />
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
                <button
                  type="button"
                  className="peacock-modal-skip-btn"
                  onClick={handleClose}
                  aria-label="Close tour"
                >
                  <X size={15} aria-hidden="true" />
                  <span>Skip tour</span>
                </button>
              </div>

              <h2 id="peacock-step-title" className="peacock-step-heading">
                {activeStep.title}
              </h2>

              <p className="peacock-step-body">
                {activeStep.text}
              </p>

              {/* Progress Dots & Navigation Buttons */}
              <div className="peacock-modal-footer">
                <div className="peacock-dots-row" aria-hidden="true">
                  {TOUR_STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`peacock-dot ${idx === currentStep ? 'is-active' : ''} ${idx < currentStep ? 'is-completed' : ''}`}
                    />
                  ))}
                </div>

                <div className="peacock-actions-row">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm peacock-nav-btn"
                      onClick={handlePrev}
                      aria-label="Previous step"
                    >
                      <ArrowLeft size={14} aria-hidden="true" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm peacock-nav-btn"
                    onClick={handleNext}
                    autoFocus
                  >
                    <span>
                      {currentStep === TOUR_STEPS.length - 1
                        ? activeStep.actionLabel || 'Start Learning'
                        : 'Next step'}
                    </span>
                    {currentStep === TOUR_STEPS.length - 1 ? (
                      <CheckCircle2 size={15} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={15} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
