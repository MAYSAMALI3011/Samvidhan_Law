import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Award } from 'lucide-react'
import { Mor } from '../mascot/Mor'
import { FlipCard } from '../learning/lesson/FlipCard'

export function InteractiveLab() {
  const [searchParams] = useSearchParams()
  // FIX B: Landing page "Try it" card uses variant="burn" by default; supports dev ?fx= override
  const cardVariant =
    import.meta.env.DEV && searchParams.get('fx')
      ? (searchParams.get('fx') === 'tear' ? 'tear' : 'burn')
      : (searchParams.get('variant') === 'tear' ? 'tear' : 'burn')

  const [isCardFlipped, setIsCardFlipped] = useState(false)

  // Mini-Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const quizQuestion = {
    prompt: 'Can the police force an accused person to speak against themselves during questioning?',
    options: [
      { text: 'Yes, if the police officer orders it', isCorrect: false },
      { text: 'No, Article 20(3) protects you from speaking against yourself', isCorrect: true },
      { text: 'Yes, but only for minor crimes', isCorrect: false },
    ],
    explanation:
      'Article 20(3) of the Constitution says that no accused person can be forced to give evidence or speak against themselves. This rule protects everyone from police pressure.',
    lessonUrl: '/learn/fundamental-rights-in-practice/freedom-and-personal-liberty',
  }

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return
    setSelectedOption(idx)
    setQuizSubmitted(true)
  }

  return (
    <section
      id="interactive-lab-section"
      className="interactive-lab-section container"
      aria-labelledby="interactive-lab-title"
      style={{ margin: '3.5rem auto' }}
    >
      <header className="section-head" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={13} className="text-gold" aria-hidden="true" />
          Interactive Practice
        </span>
        <h2 id="interactive-lab-title" className="section-title">
          Test what you know in 10 seconds
        </h2>
        <p className="section-desc" style={{ maxWidth: '38rem', margin: '0 auto' }}>
          Tap, flip, and test your everyday rights before starting a full lesson.
        </p>
      </header>

      <div className="interactive-lab-grid">
        {/* TOUCHPOINT 1: INTERACTIVE CITIZEN SAFEGUARD CARD */}
        <FlipCard
          variant={cardVariant}
          className="interactive-lab-card"
          isFlipped={isCardFlipped}
          onFlipChange={setIsCardFlipped}
          prompt="Can the police keep an arrested person in jail for 3 days without a court order? Many people think police can hold someone as long as they want."
          reveal="No. Under Article 22(2) and Section 57 CrPC / BNSS, police must bring any arrested person before a judge (Magistrate) within 24 hours. Keeping someone longer without a judge's order is against the law."
          source="Article 22(2) & Section 57 CrPC / BNSS"
        />

        {/* TOUCHPOINT 2: 1-QUESTION INTERACTIVE MINI-QUIZ */}
        <div className="mini-quiz-card" role="region" aria-label="Interactive mini-quiz">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="flip-hint-badge">
                <Award size={14} aria-hidden="true" />
                Quick Rights Quiz
              </span>
              {quizSubmitted && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedOption === 1 ? '#22c55e' : '#ef4444' }}>
                  {selectedOption === 1 ? 'Correct! +15 XP' : 'Nice try! Keep learning'}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', lineHeight: 1.4, margin: '0 0 0.85rem' }}>
              {quizQuestion.prompt}
            </h3>

            <div className="mini-quiz-options">
              {quizQuestion.options.map((opt, idx) => {
                let btnClass = 'mini-quiz-option-btn'
                if (quizSubmitted) {
                  if (opt.isCorrect) btnClass += ' is-correct'
                  else if (selectedOption === idx) btnClass += ' is-incorrect'
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    className={btnClass}
                    onClick={() => handleSelectOption(idx)}
                    aria-label={`Option: ${opt.text}`}
                  >
                    <span>{opt.text}</span>
                    {quizSubmitted && opt.isCorrect && <CheckCircle2 size={16} aria-hidden="true" />}
                    {quizSubmitted && selectedOption === idx && !opt.isCorrect && <XCircle size={16} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Instant Rationale & Mascot Celebration */}
          {quizSubmitted && (
            <div style={{ borderTop: '1px solid rgba(176, 141, 87, 0.25)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mor mood={selectedOption === 1 ? 'celebrate' : 'thinking'} size={50} animate decorative />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.84rem', lineHeight: 1.45, margin: '0 0 0.5rem' }}>
                    {quizQuestion.explanation}
                  </p>
                  <Link
                    to={quizQuestion.lessonUrl}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    <span>Continue this lesson</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
