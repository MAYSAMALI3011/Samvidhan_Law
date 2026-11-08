import type { QuizQuestion } from '../../types/index.ts'

export interface QuizAnswerSubmission {
  selectedOptionId?: string | null
  matchedPairs?: Record<string, string>
  orderedSteps?: { id: string; label: string; order: number }[]
  filledWord?: string | null
  spottedSentenceId?: string | null
}

/**
 * Pure evaluation function for checking a learner's quiz question response.
 * Used by QuizEngine and verified by automated characterization tests.
 */
export function evaluateQuizAnswer(
  question: QuizQuestion,
  answer: QuizAnswerSubmission,
): boolean {
  if (question.type === 'match_pairs' && question.pairs) {
    const pairs = answer.matchedPairs || {}
    return question.pairs.every((pair) => pairs[pair.left] === pair.right)
  }
  if (question.type === 'order_steps' && answer.orderedSteps) {
    return answer.orderedSteps.every((step, idx) => step.order === idx + 1)
  }
  if (question.type === 'fill_blank') {
    return answer.filledWord?.toLowerCase() === question.blankCorrectWord?.toLowerCase()
  }
  if (question.type === 'spot_violation' && question.spotSentences) {
    const chosen = question.spotSentences.find((s) => s.id === answer.spottedSentenceId)
    return chosen?.isViolation === true
  }
  return answer.selectedOptionId === question.correctOptionId
}
