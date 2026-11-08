import { useState } from 'react'
import type { InteractiveLessonCard, QuizQuestion } from '../../types'
import { LessonShell } from './lesson/LessonShell'
import { QuizEngine } from './QuizEngine'

export interface LessonPlayerProps {
  lessonTitle: string
  articleCitation: string
  cards: InteractiveLessonCard[]
  quizQuestions?: QuizQuestion[]
  onComplete: () => void
  onExit: () => void
}

export function LessonPlayer({
  lessonTitle,
  articleCitation,
  cards,
  quizQuestions = [],
  onComplete,
  onExit,
}: LessonPlayerProps) {
  const [stage, setStage] = useState<'learn' | 'quiz'>('learn')

  // Transition to Quiz phase after the lesson topic has been taught
  if (stage === 'quiz' && quizQuestions && quizQuestions.length > 0) {
    return (
      <QuizEngine
        quizTitle={`${lessonTitle} — Knowledge Check`}
        questions={quizQuestions}
        onComplete={onComplete}
        onExit={onExit}
      />
    )
  }

  return (
    <LessonShell
      lessonTitle={lessonTitle}
      articleCitation={articleCitation}
      cards={cards}
      quizQuestions={quizQuestions}
      onComplete={onComplete}
      onExit={onExit}
      onStartQuiz={() => setStage('quiz')}
    />
  )
}
