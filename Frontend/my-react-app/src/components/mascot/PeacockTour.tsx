import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mor, type MorMood } from './Mor'
import { ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAppState } from '../../context/useAppState'
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
  const { user } = useAppState()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  // Storage key is scoped to user email if logged in, or guest if not
  const userEmail = user?.email
  const storageKey = userEmail ? `samvidhan_tour_seen_${userEmail}` : 'samvidhan_tour_seen_guest'

  // Listen for custom start event (e.g. from buttons)
  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0)
      setIsOpen(true)
    }

    window.addEventListener('start-peacock-tour', handleStart)
    return () => window.removeEventListener('start-peacock-tour', handleStart)
  }, [])

  // Auto-show ONLY if user is logging in or using for the first time
  useEffect(() => {
    try {
      const hasSeenSpecific = localStorage.getItem(storageKey)
      const hasSeenGlobal = localStorage.getItem('samvidhan_tour_completed')

      // If user has never seen it before, open automatically once
      if (!hasSeenSpecific && !hasSeenGlobal) {
        const timer = setTimeout(() => {
          setCurrentStep(0)
          setIsOpen(true)
        }, 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey])

  // Close tour and mark as seen so it never auto-shows again
  const handleClose = useCallback(() => {
    setIsOpen(false)
    try {
      localStorage.setItem(storageKey, 'true')
      localStorage.setItem('samvidhan_tour_completed', 'true')
    } catch {
      // Ignore
    }
    // Remove all highlights
    document.querySelectorAll('.peacock-tour-target-active').forEach((el) => {
      el.classList.remove('peacock-tour-target-active')
    })
  }, [storageKey])

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
      {/* The Interactive Tour Overlay & Modal */}
      {isOpen && activeStep && (
        <div
          className="peacock-tour-backdrop-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="peacock-step-title"
        >
          <div
            className="peacock-tour-backdrop"
            onClick={handleClose}
            title="Click to skip tour"
          />

          <div className="peacock-tour-modal-card samvidhan-glow-card">
            {/* Desktop Mascot Column */}
            <div className="peacock-modal-mascot-col">
              <div className="peacock-mascot-pulse-ring">
                <Mor mood={activeStep.mood} size={76} animate decorative />
              </div>
            </div>

            {/* Content Column */}
            <div className="peacock-modal-content-col">
              <div className="peacock-modal-top-row">
                <span className="peacock-step-pill">
                  <Sparkles size={11} aria-hidden="true" />
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>

                {/* Prominent Skip Button */}
                <button
                  type="button"
                  className="peacock-modal-skip-btn"
                  onClick={handleClose}
                  aria-label="Skip tour"
                  title="Skip tour anytime"
                >
                  <X size={16} aria-hidden="true" />
                  <span>Skip tour</span>
                </button>
              </div>

              <h2 id="peacock-step-title" className="peacock-step-heading">
                {activeStep.title}
              </h2>

              <p className="peacock-step-body">
                {activeStep.text}
              </p>

              {/* Footer with Skip, Progress Dots, and Next/Back */}
              <div className="peacock-modal-footer">
                <div className="peacock-footer-mobile-meta">
                  <button
                    type="button"
                    className="peacock-footer-skip-btn"
                    onClick={handleClose}
                    aria-label="Skip tour"
                  >
                    Skip tour
                  </button>

                  <div className="peacock-dots-row" aria-hidden="true">
                    {TOUR_STEPS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`peacock-dot ${idx === currentStep ? 'is-active' : ''} ${idx < currentStep ? 'is-completed' : ''}`}
                      />
                    ))}
                  </div>
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
