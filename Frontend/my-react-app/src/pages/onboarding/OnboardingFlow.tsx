import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Scale,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import { isMockMode } from '../../api/config'
import { Mor } from '../../components/mascot/Mor'
import { TagInput } from '../../components/ui/TextFields.jsx'

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState<string>('')
  const [goal, setGoal] = useState<number>(30)
  const [placementAnswer, setPlacementAnswer] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topics, setTopics] = useState<string[]>(['fundamental rights', 'consumer protection'])

  const { demoSignIn, addXp, playSound, setDailyGoal, pushToast } = useAppState()
  const navigate = useNavigate()

  const handleNextStep = () => {
    playSound('pop')
    setStep((s) => s + 1)
  }

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault()
    playSound('complete')
    setDailyGoal(goal)

    if (import.meta.env.DEV && isMockMode()) {
      demoSignIn({
        name: name || 'Citizen Scholar',
        email: email || 'citizen@samvidhan.in',
        interests: topics.length ? topics : [reason || 'Constitutional Awareness'],
        role: 'learner',
      })
      addXp(25)
      pushToast('Welcome to Samvidhan! +25 Welcome XP earned!', 'success')
      navigate('/learn')
    } else {
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : ''
      pushToast('Preferences saved! Please create an account to start your journey.', 'info')
      navigate(`/signup${emailParam}`)
    }
  }

  return (
    <div className="onboarding-viewport">
      <div className="onboarding-card samvidhan-glow-card">
        {/* Step Indicator */}
        <div className="onboarding-progress-row">
          <div className="onboarding-step-pills">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`onboarding-step-pip ${step >= s ? 'is-active' : ''}`}
              />
            ))}
          </div>
          <span className="onboarding-step-label">Step {step} of 4</span>
        </div>

        {/* STEP 1: Reason for Learning */}
        {step === 1 && (
          <div className="onboarding-step-content">
            <Mor
              mood="wave"
              size={78}
              showBubble={true}
              bubbleText="Namaste! I am Mor, your constitutional guide. What brings you to Samvidhan?"
            />

            <h2 className="onboarding-title">Why do you want to learn the Constitution?</h2>

            <div className="onboarding-tiles-grid">
              {[
                { id: 'citizen', label: 'Know my rights as a citizen', icon: <Scale size={20} /> },
                { id: 'exam', label: 'UPSC / Judiciary exam prep', icon: <GraduationCap size={20} /> },
                { id: 'student', label: 'Law or college student', icon: <BookOpen size={20} /> },
                { id: 'action', label: 'Practical civic action (RTI, FIR)', icon: <Shield size={20} /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`onboarding-tile ${reason === opt.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    playSound('pop')
                    setReason(opt.id)
                  }}
                >
                  <div className="tile-icon text-gold">{opt.icon}</div>
                  <strong className="tile-title">{opt.label}</strong>
                </button>
              ))}
            </div>

            <div className="onboarding-action-row">
              <button
                type="button"
                className="btn btn-primary onboarding-cta-btn"
                disabled={!reason}
                onClick={handleNextStep}
              >
                <span>Continue</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Daily Learning Goal */}
        {step === 2 && (
          <div className="onboarding-step-content">
            <Mor
              mood="encourage"
              size={78}
              showBubble={true}
              bubbleText="Consistency is key! Just 3-5 minutes a day builds unbreakable legal confidence."
            />

            <h2 className="onboarding-title">Choose your daily learning goal</h2>

            <div className="onboarding-tiles-grid">
              {[
                { goal: 15, time: '3 min / day', name: 'Casual', desc: '1 lesson per day. Gentle pace.' },
                { goal: 30, time: '7 min / day', name: 'Regular (Recommended)', desc: '2 lessons + review. Steady progress.' },
                { goal: 50, time: '15 min / day', name: 'Dedicated', desc: 'Master whole units rapidly.' },
              ].map((opt) => (
                <button
                  key={opt.goal}
                  type="button"
                  className={`onboarding-tile ${goal === opt.goal ? 'is-selected' : ''}`}
                  onClick={() => {
                    playSound('pop')
                    setGoal(opt.goal)
                  }}
                >
                  <div className="tile-time-pill">{opt.time}</div>
                  <strong className="tile-title">{opt.name}</strong>
                  <p className="tile-sub">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="onboarding-action-row">
              <button
                type="button"
                className="btn btn-primary onboarding-cta-btn"
                onClick={handleNextStep}
              >
                <span>Continue</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Quick Placement Micro-Lesson Check */}
        {step === 3 && (
          <div className="onboarding-step-content">
            <Mor
              mood="thinking"
              size={78}
              showBubble={true}
              bubbleText="Let us test where you stand with a quick constitutional check!"
            />

            <h2 className="onboarding-title">Can a police officer detain you without an arrest memo?</h2>

            <div className="onboarding-tiles-grid">
              {[
                { id: 'opt-a', label: 'Yes, police have discretionary power to detain for questioning.' },
                { id: 'opt-b', label: 'No. Under D.K. Basu guidelines and Sec 41B CrPC, an arrest memo is mandatory.' },
                { id: 'opt-c', label: 'Yes, but only during nighttime hours.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`onboarding-tile ${placementAnswer === opt.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    playSound('pop')
                    setPlacementAnswer(opt.id)
                  }}
                >
                  <strong className="tile-title">{opt.label}</strong>
                </button>
              ))}
            </div>

            {placementAnswer && (
              <div className={`onboarding-feedback ${placementAnswer === 'opt-b' ? 'is-correct' : 'is-wrong'}`}>
                {placementAnswer === 'opt-b' ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald" />
                    <span>Brilliant! You already know fundamental criminal procedure rights.</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-gold" />
                    <span>Good attempt! In fact, the Supreme Court ruled in D.K. Basu that an arrest memo is strictly mandatory.</span>
                  </>
                )}
              </div>
            )}

            <div className="onboarding-action-row">
              <button
                type="button"
                className="btn btn-primary onboarding-cta-btn"
                disabled={!placementAnswer}
                onClick={handleNextStep}
              >
                <span>Save & Continue</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Profile Creation */}
        {step === 4 && (
          <form onSubmit={handleComplete} className="onboarding-step-content">
            <Mor
              mood="celebrate"
              size={78}
              showBubble={true}
              bubbleText="You are ready to begin your journey! Create your profile to save your streak and badges."
            />

            <h2 className="onboarding-title">Create your citizen profile</h2>

            <div className="onboarding-form-inputs">
              <div className="field-block">
                <label htmlFor="learner-name" className="field-label">Your Name or Alias</label>
                <input
                  id="learner-name"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field-block">
                <label htmlFor="learner-email" className="field-label">Email Address</label>
                <input
                  id="learner-email"
                  type="email"
                  required
                  placeholder="citizen@example.in"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                <TagInput
                  label="Topics you care about"
                  tags={topics}
                  onChange={setTopics}
                  suggestions={['fundamental rights', 'directive principles', 'writs', 'amendments', 'police encounters', 'consumer fraud', 'rti act', 'cyber law']}
                  max={8}
                />
              </div>
            </div>

            <div className="onboarding-action-row">
              <button type="submit" className="btn btn-primary onboarding-cta-btn">
                <span>Start Learning &bull; Claim +25 XP</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
