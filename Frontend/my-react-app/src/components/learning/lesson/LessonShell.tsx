import { useState, useEffect, useCallback } from 'react'
import { LessonTopBar } from './LessonTopBar'
import { LessonCardStage } from './LessonCardStage'
import { BottomBar } from './BottomBar'
import { AskSamvidhanModal } from '../../assistant/AskSamvidhanModal'
import type { InteractiveLessonCard, QuizQuestion } from '../../../types'
import { useAppState } from '../../../context/useAppState'
import './lesson.css'

export interface LessonShellProps {
  lessonTitle: string
  articleCitation: string
  cards: InteractiveLessonCard[]
  quizQuestions?: QuizQuestion[]
  onComplete: () => void
  onExit: () => void
  onStartQuiz?: () => void
  streak?: number
  xpReward?: number
}

export function LessonShell({
  lessonTitle,
  articleCitation,
  cards,
  quizQuestions = [],
  onComplete,
  onExit,
  onStartQuiz,
  streak,
  xpReward = 15,
}: LessonShellProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [confirmExitOpen, setConfirmExitOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const { playSound, progress } = useAppState()

  const currentStreak = streak ?? (progress?.streak || 3)
  const currentCard = cards[cardIndex] || cards[0]
  const totalCards = cards.length

  const handleNext = useCallback(() => {
    playSound('pop')
    if (cardIndex < totalCards - 1) {
      setCardIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      if (quizQuestions.length > 0 && onStartQuiz) {
        onStartQuiz()
      } else {
        onComplete()
      }
    }
  }, [cardIndex, totalCards, quizQuestions.length, onStartQuiz, onComplete, playSound])

  const handlePrev = useCallback(() => {
    if (cardIndex > 0) {
      playSound('pop')
      setCardIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [cardIndex, playSound])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs or textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setConfirmExitOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  const nextButtonLabel =
    cardIndex < totalCards - 1
      ? 'Continue'
      : quizQuestions.length > 0
      ? 'Understood! Take the 2-Minute Quiz'
      : 'Complete Lesson'

  return (
    <div className="samvidhan-lesson-shell" role="main" aria-label={`Lesson: ${lessonTitle}`}>
      {/* 1. Sticky Focus Top Bar */}
      <LessonTopBar
        totalSegments={totalCards}
        currentIndex={cardIndex}
        streak={currentStreak}
        xp={xpReward}
        onCloseClick={() => setConfirmExitOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />

      {/* 2. Scrollable Lesson Content Stage */}
      <main className="lesson-stage-container">
        <LessonCardStage
          key={currentCard.id}
          card={currentCard}
          cardIndex={cardIndex}
          totalCards={totalCards}
          articleCitation={articleCitation}
        />
      </main>

      {/* 3. Sticky Action Bottom Bar */}
      <BottomBar
        cardIndex={cardIndex}
        totalCards={totalCards}
        onNext={handleNext}
        onPrev={cardIndex > 0 ? handlePrev : undefined}
        nextLabel={nextButtonLabel}
      />

      {/* 4. Exit Confirmation Modal */}
      {confirmExitOpen && (
        <div
          className="lesson-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-exit-title"
        >
          <div className="confirm-exit-card">
            <h2 id="confirm-exit-title" className="exit-title">
              Pause your constitutional lesson?
            </h2>
            <p className="exit-desc">
              Your progress is saved on this device. Complete today’s lesson to protect your{' '}
              <strong>{currentStreak}-day civic streak</strong>!
            </p>
            <div className="exit-actions-row">
              <button
                type="button"
                className="btn btn-secondary modal-stay-btn"
                onClick={() => setConfirmExitOpen(false)}
                autoFocus
              >
                Keep Learning
              </button>
              <button
                type="button"
                className="btn btn-outline modal-leave-btn"
                onClick={onExit}
              >
                Exit to Curriculum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Integrated Ask Samvidhan Assistant */}
      <AskSamvidhanModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
