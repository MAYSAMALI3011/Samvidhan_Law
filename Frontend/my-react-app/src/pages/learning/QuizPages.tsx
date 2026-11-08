import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, RotateCcw, XCircle, ArrowRight } from 'lucide-react'
import { EmptyState } from '../../components/feedback/Toasts'
import { QuizEngine } from '../../components/learning/QuizEngine'
import { useAppState } from '../../context/useAppState'
import { getQuiz } from '../../services/catalog'
import { unitsData } from '../../data/mock/learningUnits'
import { usePageMeta } from '../../hooks/usePageMeta'
import { readJson } from '../../utils/storage'
import { BackButton } from '../../components/common/BackButton'

export function QuizPage() {
  const { quizId = '' } = useParams()
  const navigate = useNavigate()
  const { saveQuizScore } = useAppState()

  usePageMeta({
    title: 'Knowledge Check ? Samvidhan',
    description: 'Interactive statutory quiz check for Samvidhan lessons.',
    path: `/quiz/${quizId}`,
  })

  // First check if quiz belongs to unitsData
  let targetTitle = 'Statutory Mastery Quiz'
  let targetQuestions = null

  for (const unit of unitsData) {
    for (const l of unit.lessons) {
      if (l.id === quizId || `quiz-${l.id}` === quizId) {
        targetTitle = `${l.title} ? Quiz`
        targetQuestions = l.quizQuestions
        break
      }
    }
  }

  // Fallback to catalog mock quizzes
  if (!targetQuestions) {
    const fallbackQuiz = getQuiz(quizId)
    if (fallbackQuiz) {
      targetTitle = fallbackQuiz.title
      targetQuestions = fallbackQuiz.questions
    }
  }

  if (!targetQuestions || targetQuestions.length === 0) {
    // If quiz is not found by exact id, provide unit 1 milestone quiz questions
    const defaultLesson = unitsData[0].lessons[0]
    targetTitle = `${defaultLesson.title} — Quiz`
    targetQuestions = defaultLesson.quizQuestions || []
  }

  return (
    <QuizEngine
      quizTitle={targetTitle}
      questions={targetQuestions || []}
      onComplete={(score) => {
        saveQuizScore(quizId, score, targetTitle)
      }}
      onExit={() => navigate('/learn')}
    />
  )
}

export function QuizResultsPage() {
  const { quizId = '' } = useParams()
  const quiz = getQuiz(quizId)
  const answers = readJson<Record<string, string>>(`quiz:${quizId}`, {})

  usePageMeta({
    title: 'Quiz Review ? Samvidhan',
    description: 'Detailed question-by-question review of constitutional questions.',
    path: `/quiz/${quizId}/results`,
  })

  if (!quiz) return <EmptyState title="Results unavailable" body="Quiz not found." />

  const total = quiz.questions.length
  const correct = quiz.questions.filter((q) => answers[q.id] === q.correctOptionId).length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const isPassed = score >= 70

  return (
    <div className="container page-hero reading-layout">
      <BackButton to="/learn" label="Back to Curriculum" />
      <span className="section-eyebrow">Statutory Evaluation</span>
      <h1 className="page-title-main">{quiz.title} ? Review</h1>

      {/* Scorecard */}
      <div className="quiz-scorecard samvidhan-glow-card">
        <div className="quiz-score-num">{score}%</div>
        <h3 className="quiz-score-status">
          {isPassed ? 'Knowledge Check Passed!' : 'Good Effort! Keep Reviewing'}
        </h3>
        <p className="quiz-score-desc">
          You answered {correct} out of {total} questions correctly on your initial attempt.
        </p>

        <div className="quiz-score-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.location.href = `/quiz/${quiz.id}`}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Retake Quiz</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.href = '/learn'}
          >
            <span>Continue Curriculum</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>Detailed Question Explanations</h2>

      {quiz.questions.map((q, idx) => {
        const userChoiceId = answers[q.id]
        const isCorrect = userChoiceId === q.correctOptionId
        const userChoice = q.options?.find((o) => o.id === userChoiceId)
        const correctChoice = q.options?.find((o) => o.id === q.correctOptionId)

        return (
          <article className="quiz-review-card samvidhan-glow-card" key={q.id}>
            <div className="quiz-review-top">
              <span className="eyebrow">Question {idx + 1}</span>
              <span className={`quiz-status-pill ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={14} aria-hidden="true" /> Correct
                  </>
                ) : (
                  <>
                    <XCircle size={14} aria-hidden="true" /> Review
                  </>
                )}
              </span>
            </div>

            <h3 className="quiz-review-prompt">{q.prompt}</h3>

            <div className="quiz-review-choices">
              <p>
                <strong>Your answer: </strong>
                <span style={{ color: isCorrect ? 'var(--emerald)' : 'var(--danger)' }}>
                  {userChoice ? userChoice.label : 'None selected'}
                </span>
              </p>
              {!isCorrect && correctChoice && (
                <p>
                  <strong>Correct answer: </strong>
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{correctChoice.label}</span>
                </p>
              )}
            </div>

            <div className="quiz-review-rationale">
              <strong>Constitutional Rationale: </strong>
              {q.explanation}
            </div>
          </article>
        )
      })}
    </div>
  )
}
