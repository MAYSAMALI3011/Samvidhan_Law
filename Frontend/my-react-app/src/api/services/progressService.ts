import { apiClient, createIdempotencyKey } from '../client.ts'
import { isMockMode } from '../config.ts'
import {
  progressStateSchema,
  lessonCompletionResponseSchema,
  quizSubmissionResponseSchema,
  chestOpenResponseSchema,
  safeValidate,
} from '../schemas.ts'
import type {
  ProgressState,
  LessonCompletionResponse,
  QuizSubmissionResponse,
  ChestOpenResponse,
  ActivityItem,
} from '../types.ts'
import { readJson, writeJson } from '../../utils/storage.ts'
import { nowLabel } from '../../utils/format.ts'

const emptyProgress: ProgressState = {
  completedLessonIds: [],
  quizScores: {},
  bookmarks: [],
  savedLessonIds: [],
  history: [],
  xp: 45,
  streak: 3,
  dailyGoal: 30,
  soundEnabled: true,
  mascotEnabled: true,
  streakFreezes: 1,
  badges: ['first-step'],
  chestsOpened: [],
  weeklyHistory: [
    { day: 'M', xp: 30, completed: true },
    { day: 'T', xp: 45, completed: true },
    { day: 'W', xp: 15, completed: true },
    { day: 'T', xp: 0, completed: false },
    { day: 'F', xp: 0, completed: false },
    { day: 'S', xp: 0, completed: false },
    { day: 'S', xp: 0, completed: false },
  ],
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export async function fetchProgress(): Promise<ProgressState> {
  if (isMockMode()) {
    const saved = readJson<ProgressState>('progress', emptyProgress)
    return { ...emptyProgress, ...saved }
  }

  try {
    const raw = await apiClient.get<unknown>('/api/progress')
    return safeValidate(progressStateSchema, raw, 'progressService.fetchProgress', emptyProgress)
  } catch {
    const saved = readJson<ProgressState>('progress', emptyProgress)
    return { ...emptyProgress, ...saved }
  }
}

export async function completeLessonEvent(payload: {
  lessonId: string
  title: string
  idempotencyKey?: string
}): Promise<LessonCompletionResponse> {
  if (isMockMode()) {
    const current = readJson<ProgressState>('progress', emptyProgress)
    const completedLessonIds = current.completedLessonIds.includes(payload.lessonId)
      ? current.completedLessonIds
      : [...current.completedLessonIds, payload.lessonId]
    const item: ActivityItem = {
      id: uid(),
      label: `Completed: ${payload.title}`,
      at: nowLabel(),
      href: `/search?q=${encodeURIComponent(payload.title)}`,
    }
    const nextXp = (current.xp || 0) + 15
    const next: ProgressState = {
      ...current,
      completedLessonIds,
      xp: nextXp,
      history: [item, ...(current.history || [])].slice(0, 12),
    }
    writeJson('progress', next)
    return {
      success: true,
      progress: next,
      earnedXp: 15,
      streakIncremented: false,
    }
  }

  // Live Mode: Server-authoritative calculation with Idempotency-Key
  const idempotencyKey = payload.idempotencyKey || createIdempotencyKey()
  const raw = await apiClient.post<unknown>(
    '/api/progress/complete-lesson',
    { lessonId: payload.lessonId, title: payload.title },
    { idempotencyKey },
  )
  return safeValidate(lessonCompletionResponseSchema, raw, 'progressService.completeLessonEvent')
}

export async function submitQuizEvent(payload: {
  quizId: string
  score: number
  title: string
  idempotencyKey?: string
}): Promise<QuizSubmissionResponse> {
  if (isMockMode()) {
    const current = readJson<ProgressState>('progress', emptyProgress)
    const item: ActivityItem = {
      id: uid(),
      label: `Quiz: ${payload.title} (${payload.score}%)`,
      at: nowLabel(),
      href: `/quiz/${payload.quizId}/results`,
    }
    const bonusXp = payload.score >= 80 ? 25 : 15
    const nextXp = (current.xp || 0) + bonusXp
    const next: ProgressState = {
      ...current,
      quizScores: { ...(current.quizScores || {}), [payload.quizId]: payload.score },
      xp: nextXp,
      history: [item, ...(current.history || [])].slice(0, 12),
    }
    writeJson('progress', next)
    return {
      success: true,
      progress: next,
      earnedXp: bonusXp,
    }
  }

  // Live Mode: Server-authoritative calculation with Idempotency-Key
  const idempotencyKey = payload.idempotencyKey || createIdempotencyKey()
  const raw = await apiClient.post<unknown>(
    '/api/progress/submit-quiz',
    { quizId: payload.quizId, score: payload.score, title: payload.title },
    { idempotencyKey },
  )
  return safeValidate(quizSubmissionResponseSchema, raw, 'progressService.submitQuizEvent')
}

export async function openChestEvent(payload: {
  chestId: string
  xpBonus?: number
  idempotencyKey?: string
}): Promise<ChestOpenResponse> {
  if (isMockMode()) {
    const current = readJson<ProgressState>('progress', emptyProgress)
    const bonus = payload.xpBonus ?? 20
    if (current.chestsOpened?.includes(payload.chestId)) {
      return { success: true, progress: current, bonusXp: 0 }
    }
    const opened = [...(current.chestsOpened || []), payload.chestId]
    const next: ProgressState = {
      ...current,
      chestsOpened: opened,
      xp: (current.xp || 0) + bonus,
    }
    writeJson('progress', next)
    return { success: true, progress: next, bonusXp: bonus }
  }

  const idempotencyKey = payload.idempotencyKey || createIdempotencyKey()
  const raw = await apiClient.post<unknown>(
    '/api/progress/open-chest',
    { chestId: payload.chestId, xpBonus: payload.xpBonus },
    { idempotencyKey },
  )
  return safeValidate(chestOpenResponseSchema, raw, 'progressService.openChestEvent')
}

export async function activateStreakFreezeEvent(idempotencyKey?: string): Promise<ProgressState> {
  if (isMockMode()) {
    const current = readJson<ProgressState>('progress', emptyProgress)
    const next: ProgressState = {
      ...current,
      streakFreezes: Math.max(0, (current.streakFreezes || 0) - 1),
    }
    writeJson('progress', next)
    return next
  }

  const key = idempotencyKey || createIdempotencyKey()
  const raw = await apiClient.post<unknown>('/api/progress/streak-freeze', {}, { idempotencyKey: key })
  const res = safeValidate(progressStateSchema, raw, 'progressService.activateStreakFreezeEvent')
  return res
}

export async function setDailyGoalEvent(goal: number): Promise<number> {
  if (isMockMode()) {
    const current = readJson<ProgressState>('progress', emptyProgress)
    const next = { ...current, dailyGoal: goal }
    writeJson('progress', next)
    return goal
  }

  const raw = await apiClient.post<{ success: boolean; dailyGoal: number }>('/api/progress/set-goal', { goal })
  return raw.dailyGoal ?? goal
}
