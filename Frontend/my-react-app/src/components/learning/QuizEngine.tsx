import { useState, useEffect } from 'react'
import {
  X,
  Zap,
  ArrowRight,
  Flame,
  Check,
  RotateCcw,
  Flag,
  Send,
} from 'lucide-react'
import { useAppState } from '../../context/useAppState'
import { FeedbackBar } from './FeedbackBar'
import { CompletionScreen } from './CompletionScreen'
import { evaluateQuizAnswer } from './quizScoring.ts'
import type { QuizQuestion } from '../../types/index.ts'

interface QuizEngineProps {
  quizTitle: string
  questions: QuizQuestion[]
  onComplete: (score: number) => void
  onExit: () => void
}

export function QuizEngine({
  quizTitle,
  questions,
  onComplete,
  onExit,
}: QuizEngineProps) {
  const { playSound, addXp, progress } = useAppState()

  // State
  const [questionQueue, setQuestionQueue] = useState<QuizQuestion[]>(() => [...questions])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [combo, setCombo] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [firstAttemptErrors, setFirstAttemptErrors] = useState<Set<string>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

  // Question-specific answer states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  // For match pairs
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  // For order steps
  const [orderedSteps, setOrderedSteps] = useState<{ id: string; label: string; order: number }[]>(() => {
    const q0 = questions[0]
    return q0?.type === 'order_steps' && q0.steps ? [...q0.steps].reverse() : []
  })
  // For fill blank
  const [filledWord, setFilledWord] = useState<string | null>(null)
  // For spot violation
  const [spottedSentenceId, setSpottedSentenceId] = useState<string | null>(null)

  // Report a mistake modal
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const currentQ = questionQueue[currentIndex]
  const progressPercent = Math.min(100, Math.round((currentIndex / questionQueue.length) * 100))

  // Sync state when moving to next question (adjust state during render)
  const [prevIndex, setPrevIndex] = useState(0)
  if (prevIndex !== currentIndex) {
    setPrevIndex(currentIndex)
    setSelectedOptionId(null)
    setMatchedPairs({})
    setSelectedLeft(null)
    setFilledWord(null)
    setSpottedSentenceId(null)
    setFeedback(null)
    if (currentQ?.type === 'order_steps' && currentQ.steps) {
      setOrderedSteps([...currentQ.steps].reverse())
    }
  }

  const canCheckAnswer = (): boolean => {
    if (!currentQ) return false
    if (currentQ.type === 'match_pairs') {
      return Object.keys(matchedPairs).length === (currentQ.pairs?.length || 0)
    }
    if (currentQ.type === 'fill_blank') {
      return filledWord !== null
    }
    if (currentQ.type === 'order_steps') {
      return true
    }
    if (currentQ.type === 'spot_violation') {
      return spottedSentenceId !== null
    }
    return selectedOptionId !== null
  }

  const checkAnswer = () => {
    if (!currentQ) return

    const isCorrect = evaluateQuizAnswer(currentQ, {
      selectedOptionId,
      matchedPairs,
      orderedSteps,
      filledWord,
      spottedSentenceId,
    })

    if (isCorrect) {
      setFeedback('correct')
      const nextCombo = combo + 1
      setCombo(nextCombo)
      if (nextCombo >= 3) {
        playSound('combo')
      } else {
        playSound('correct')
      }
    } else {
      setFeedback('wrong')
      setCombo(0)
      playSound('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)

      // Add to errors set
      setFirstAttemptErrors((prev) => new Set(prev).add(currentQ.id))

      // Duolingo Mastery Rule: Repeat missed question at the end
      setQuestionQueue((prev) => [...prev, currentQ])
    }
  }

  // Keyboard 1-4 shortcuts for multiple choice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== null || !currentQ || currentQ.type === 'match_pairs' || currentQ.type === 'order_steps') return

      if (currentQ.options) {
        const num = parseInt(e.key, 10)
        if (!isNaN(num) && num >= 1 && num <= currentQ.options.length) {
          setSelectedOptionId(currentQ.options[num - 1].id)
          playSound('pop')
        }
      }

      if (e.key === 'Enter' && canCheckAnswer() && feedback === null) {
        checkAnswer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!currentQ && !isCompleted) return null

  const handleContinue = () => {
    setFeedback(null)
    if (currentIndex + 1 < questionQueue.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Quiz Complete
      const totalInitial = questions.length
      const missedCount = firstAttemptErrors.size
      const accuracy = Math.round(((totalInitial - missedCount) / totalInitial) * 100)
      const earnedXp = accuracy >= 80 ? 25 : 15
      addXp(earnedXp)
      onComplete(accuracy)
      setIsCompleted(true)
    }
  }

  // Handlers for Match Pairs
  const handleMatchLeft = (leftText: string) => {
    playSound('pop')
    setSelectedLeft(leftText)
  }

  const handleMatchRight = (rightText: string) => {
    if (!selectedLeft) return
    playSound('pop')
    setMatchedPairs((prev) => ({ ...prev, [selectedLeft]: rightText }))
    setSelectedLeft(null)
  }

  // Handlers for Order Steps
  const moveStep = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedSteps.length) return
    playSound('pop')
    const updated = [...orderedSteps]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    setOrderedSteps(updated)
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReportSubmitted(true)
    // Save to local reports store
    try {
      const reports = JSON.parse(localStorage.getItem('samvidhan-mistake-reports') || '[]')
      reports.push({
        id: Math.random().toString(36).slice(2, 9),
        questionId: currentQ?.id,
        prompt: currentQ?.prompt,
        reason: reportReason,
        createdAt: new Date().toISOString(),
        status: 'New',
      })
      localStorage.setItem('samvidhan-mistake-reports', JSON.stringify(reports))
    } catch {
      /* ignore storage errors */
    }
    setTimeout(() => {
      setReportModalOpen(false)
      setReportSubmitted(false)
      setReportReason('')
    }, 1800)
  }

  if (isCompleted) {
    const totalInitial = questions.length
    const missedCount = firstAttemptErrors.size
    const accuracy = Math.round(((totalInitial - missedCount) / totalInitial) * 100)
    const earnedXp = accuracy >= 80 ? 25 : 15

    return (
      <div className="focused-lesson-player">
        <CompletionScreen
          title={quizTitle}
          xpEarned={earnedXp}
          accuracy={accuracy}
          streak={progress.streak || 3}
          onContinue={onExit}
        />
      </div>
    )
  }

  return (
    <div className="focused-lesson-player duo-quiz-fullscreen" role="dialog" aria-modal="true" aria-label={quizTitle}>
      {/* Top Header */}
      <header className="player-topbar">
        <button type="button" className="player-close-btn" onClick={onExit} aria-label="Exit quiz">
          <X size={22} aria-hidden="true" />
        </button>

        {/* Progress Bar */}
        <div className="player-progress-track">
          <div
            className="player-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Combo Counter Badge */}
        {combo > 1 && (
          <div className="quiz-combo-badge" title="Combo Streak!">
            <Flame size={15} className="flame-icon pulsing-flame" aria-hidden="true" />
            <span>{combo} in a row!</span>
          </div>
        )}

        <div className="player-top-chips">
          <div className="chip xp-chip">
            <Zap size={14} aria-hidden="true" />
            <span>+25 XP</span>
          </div>
        </div>
      </header>

      {/* Main Question Body */}
      <main className="player-body-container">
        <div className={`player-card samvidhan-glow-card ${isShaking ? 'shake-animation' : ''}`}>
          <div className="quiz-card-head">
            <div className="quiz-type-kicker">
              {currentQ.type === 'match_pairs'
                ? 'MATCH THE CONSTITUTIONAL PAIRS'
                : currentQ.type === 'order_steps'
                ? 'SEQUENCE THE LEGAL PROCEDURE'
                : currentQ.type === 'fill_blank'
                ? 'FILL IN THE BLANK'
                : currentQ.type === 'spot_violation'
                ? 'SPOT THE CONSTITUTIONAL VIOLATION'
                : 'STATUTORY KNOWLEDGE CHECK'}
            </div>

            <button
              type="button"
              className="report-mistake-link"
              onClick={() => setReportModalOpen(true)}
              title="Report an error in this legal question"
            >
              <Flag size={13} aria-hidden="true" />
              <span>Report issue</span>
            </button>
          </div>

          <h2 className="quiz-question-prompt">{currentQ.prompt}</h2>

          {/* 1. MATCH PAIRS QUESTION TYPE */}
          {currentQ.type === 'match_pairs' && currentQ.pairs && (
            <div className="match-pairs-container">
              <div className="match-column">
                <span className="match-col-label">Constitutional Terms:</span>
                {currentQ.pairs.map((pair) => {
                  const isPaired = matchedPairs[pair.left] !== undefined
                  const isSelected = selectedLeft === pair.left
                  return (
                    <button
                      key={pair.left}
                      type="button"
                      disabled={feedback !== null || isPaired}
                      className={`match-tile-btn ${isSelected ? 'is-selected' : ''} ${isPaired ? 'is-paired' : ''}`}
                      onClick={() => handleMatchLeft(pair.left)}
                    >
                      <span>{pair.left}</span>
                      {isPaired && <Check size={16} className="text-emerald" />}
                    </button>
                  )
                })}
              </div>

              <div className="match-column">
                <span className="match-col-label">Plain-English Meanings:</span>
                {currentQ.pairs.map((pair) => {
                  const isMatchedToThis = Object.values(matchedPairs).includes(pair.right)
                  return (
                    <button
                      key={pair.right}
                      type="button"
                      disabled={feedback !== null || isMatchedToThis || !selectedLeft}
                      className={`match-tile-btn ${isMatchedToThis ? 'is-paired' : ''}`}
                      onClick={() => handleMatchRight(pair.right)}
                    >
                      <span>{pair.right}</span>
                      {isMatchedToThis && <Check size={16} className="text-emerald" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. ORDER STEPS QUESTION TYPE */}
          {currentQ.type === 'order_steps' && (
            <div className="order-steps-container">
              <p className="order-hint">Use the arrows to place the legal steps in correct sequence from first to last:</p>
              <div className="order-steps-list">
                {orderedSteps.map((step, idx) => (
                  <div key={step.id} className="order-step-tile">
                    <span className="order-step-num">{idx + 1}</span>
                    <span className="order-step-text">{step.label}</span>
                    <div className="order-step-controls">
                      <button
                        type="button"
                        className="order-btn"
                        disabled={idx === 0 || feedback !== null}
                        onClick={() => moveStep(idx, idx - 1)}
                        aria-label="Move step up"
                      >
                        ?
                      </button>
                      <button
                        type="button"
                        className="order-btn"
                        disabled={idx === orderedSteps.length - 1 || feedback !== null}
                        onClick={() => moveStep(idx, idx + 1)}
                        aria-label="Move step down"
                      >
                        ?
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. FILL IN THE BLANK QUESTION TYPE */}
          {currentQ.type === 'fill_blank' && (
            <div className="fill-blank-container">
              <div className="fill-sentence-card">
                {currentQ.sentenceWithBlank?.split('[blank]').map((part, i, arr) => (
                  <div key={i}>
                    <span>{part}</span>
                    {i < arr.length - 1 && (
                      <span className={`blank-drop-target ${filledWord ? 'has-word' : ''}`}>
                        {filledWord || '_______'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {filledWord && !feedback && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost reset-blank-btn"
                  onClick={() => setFilledWord(null)}
                >
                  <RotateCcw size={14} /> Clear choice
                </button>
              )}

              <span className="wordbank-label">Tap a word to fill the blank:</span>
              <div className="wordbank-grid">
                {currentQ.wordBank?.map((word) => (
                  <button
                    key={word}
                    type="button"
                    disabled={feedback !== null || filledWord === word}
                    className={`wordbank-tile ${filledWord === word ? 'is-selected' : ''}`}
                    onClick={() => {
                      playSound('pop')
                      setFilledWord(word)
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. SPOT THE VIOLATION QUESTION TYPE */}
          {currentQ.type === 'spot_violation' && currentQ.spotSentences && (
            <div className="spot-violation-container">
              <div className="spot-sentences-list">
                {currentQ.spotSentences.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={feedback !== null}
                    className={`spot-sentence-tile ${spottedSentenceId === s.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      playSound('pop')
                      setSpottedSentenceId(s.id)
                    }}
                  >
                    <span className="spot-number">{idx + 1}</span>
                    <span className="spot-text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. MULTIPLE CHOICE / TRUE-FALSE TILES */}
          {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false' || !currentQ.type) && currentQ.options && (
            <div className="quiz-options-tiles-grid">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOptionId === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={feedback !== null}
                    className={`quiz-tile-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      playSound('pop')
                      setSelectedOptionId(opt.id)
                    }}
                  >
                    <span className="tile-num-badge">{optIdx + 1}</span>
                    <span className="tile-label">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Check Answer Button */}
          {!feedback && (
            <div className="quiz-bottom-actions">
              <button
                type="button"
                className="btn btn-primary check-answer-btn"
                disabled={!canCheckAnswer()}
                onClick={checkAnswer}
              >
                <span>Check Answer</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Duolingo Slide-Up Feedback Bar */}
      <FeedbackBar
        status={feedback}
        explanation={currentQ.explanation}
        citation={currentQ.citation || 'Constitution of India'}
        onContinue={handleContinue}
      />

      {/* Report a Mistake Modal */}
      {reportModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <div className="report-modal samvidhan-glow-card">
            <h3 id="report-modal-title">Report an Issue with This Question</h3>
            <p className="report-sub">Help our legal reviewers keep every constitutional question verified and accurate.</p>

            {reportSubmitted ? (
              <div className="report-success-state">
                <Check size={28} className="text-emerald" />
                <p>Thank you! Your report has been submitted to the legal review queue.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <label htmlFor="report-reason" className="field-label">
                  What is inaccurate or confusing?
                </label>
                <textarea
                  id="report-reason"
                  required
                  rows={4}
                  className="report-textarea"
                  placeholder="e.g. The citation for Article 14 references the Royappa doctrine, but the explanation could clarify..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="report-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={15} />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
