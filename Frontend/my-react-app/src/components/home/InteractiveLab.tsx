import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight, Sparkles, ShieldAlert, Award, Flame, RotateCcw } from 'lucide-react'
import { Mor } from '../mascot/Mor'

export function InteractiveLab() {
  // Torn Page Codex State
  const [isTorn, setIsTorn] = useState(false)

  // Mini-Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const quizQuestion = {
    prompt: 'Can an Indian citizen be compelled to be a witness against themselves during police interrogation?',
    options: [
      { text: 'Yes, if ordered by an investigating officer', isCorrect: false },
      { text: 'No, Article 20(3) guarantees immunity against self-incrimination', isCorrect: true },
      { text: 'Yes, but only in non-cognizable offenses', isCorrect: false },
    ],
    explanation:
      'Article 20(3) of the Constitution guarantees: "No person accused of any offence shall be compelled to be a witness against himself." This safeguards personal dignity and prevents custodial coercion.',
    lessonUrl: '/learn/fundamental-rights-in-practice/freedom-and-personal-liberty',
  }

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return
    setSelectedOption(idx)
    setQuizSubmitted(true)
  }

  return (
    <section className="interactive-lab-section container" aria-labelledby="interactive-lab-title" style={{ margin: '3.5rem auto' }}>
      <header className="section-head" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={13} className="text-gold" aria-hidden="true" />
          Interactive Citizen Lab
        </span>
        <h2 id="interactive-lab-title" className="section-title">
          Test your civic intuition in 10 seconds
        </h2>
        <p className="section-desc" style={{ maxWidth: '38rem', margin: '0 auto' }}>
          Touch, flip, and test real everyday constitutional rights before opening a full lesson.
        </p>
      </header>

      <div className="interactive-lab-grid">
        {/* TOUCHPOINT 1: TORN PARCHMENT REVEAL CARD */}
        <div className="page-tear-card-wrap">
          <div
            className={`page-tear-card ${isTorn ? 'is-torn' : ''}`}
            onClick={() => setIsTorn(!isTorn)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsTorn(!isTorn)
              }
            }}
            aria-label={`Did you know card. ${isTorn ? 'Showing statutory answer. Tap to restore page.' : 'Showing question. Tap to tear page and unveil safeguard.'}`}
          >
            {/* UNDERLAY FACE (REVEALED ANSWER) */}
            <div className="page-tear-underlay">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="page-tear-badge text-success">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Article 22(2) Safeguard
                  </span>
                  <span className="page-tear-action-hint">
                    <RotateCcw size={12} aria-hidden="true" /> Restore Page
                  </span>
                </div>
                <h3 className="page-tear-reveal-title">
                  Maximum 24 Hours Mandate
                </h3>
                <p className="page-tear-reveal-desc">
                  Under <strong>Article 22(2)</strong> of the Constitution of India and Section 57 CrPC / BNSS, every arrested person must be produced before the nearest Magistrate within <strong>24 hours</strong> of arrest (excluding travel time). Detention beyond 24 hours without judicial sanction is unconstitutional.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                <Link
                  to="/constitution"
                  className="btn btn-outline btn-sm"
                  style={{ width: 'fit-content' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Read Article 22</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  Tap card to close
                </span>
              </div>
            </div>

            {/* TOP OVERLAY FACE (PARCHMENT SHEET THAT TEARS / BURNS AWAY) */}
            <div className="page-tear-overlay">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="page-tear-badge text-gold">
                    <ShieldAlert size={14} aria-hidden="true" />
                    Citizen Safeguard
                  </span>
                  <span className="page-tear-action-hint text-amber">
                    <Flame size={13} aria-hidden="true" /> Tap to Tear & Reveal
                  </span>
                </div>
                <h3 className="page-tear-prompt-title">
                  Can the police keep an arrested citizen in custody for 3 days without a court order?
                </h3>
                <p className="page-tear-prompt-desc">
                  Many citizens believe custody can extend indefinitely during preliminary questioning. Tap this codex page to tear and uncover the strict constitutional deadline.
                </p>
              </div>

              <div className="page-tear-bottom-row">
                <span className="page-tear-cta-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Tear Page to Reveal 24h Law</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
                <span className="page-tear-tag">Constitutional Codex</span>
              </div>

              {/* Glowing Ember Burn Edge along bottom */}
              <div className="page-tear-ember-edge" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* TOUCHPOINT 2: 1-QUESTION INTERACTIVE MINI-QUIZ */}
        <div className="mini-quiz-card" role="region" aria-label="Interactive mini-quiz">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="flip-hint-badge">
                <Award size={14} aria-hidden="true" />
                Live Civic Knowledge Check
              </span>
              {quizSubmitted && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedOption === 1 ? '#22c55e' : '#ef4444' }}>
                  {selectedOption === 1 ? 'Correct! +15 XP' : 'Keep Learning'}
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
