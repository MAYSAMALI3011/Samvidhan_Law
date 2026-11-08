import { apiClient } from '../client'
import { isMockMode } from '../config'
import { readJson, writeJson } from '../../utils/storage'
import type { ProgressState } from '../types'

export async function toggleBookmarkApi(lessonId: string): Promise<string[]> {
  if (isMockMode()) {
    const progress = readJson<ProgressState>('progress', {
      completedLessonIds: [],
      quizScores: {},
      bookmarks: [],
      savedLessonIds: [],
      history: [],
      xp: 0,
      streak: 0,
      dailyGoal: 30,
      soundEnabled: true,
      mascotEnabled: true,
      streakFreezes: 0,
      badges: [],
    })
    const exists = progress.bookmarks.includes(lessonId)
    const updated = exists
      ? progress.bookmarks.filter((id) => id !== lessonId)
      : [...progress.bookmarks, lessonId]
    writeJson('progress', { ...progress, bookmarks: updated })
    return updated
  }

  try {
    const res = await apiClient.post<{ success: boolean; bookmarks: string[] }>('/api/bookmarks/toggle', {
      lessonId,
    })
    return res.bookmarks || []
  } catch {
    return []
  }
}

export async function toggleSavedApi(lessonId: string): Promise<string[]> {
  if (isMockMode()) {
    const progress = readJson<ProgressState>('progress', {
      completedLessonIds: [],
      quizScores: {},
      bookmarks: [],
      savedLessonIds: [],
      history: [],
      xp: 0,
      streak: 0,
      dailyGoal: 30,
      soundEnabled: true,
      mascotEnabled: true,
      streakFreezes: 0,
      badges: [],
    })
    const exists = progress.savedLessonIds.includes(lessonId)
    const updated = exists
      ? progress.savedLessonIds.filter((id) => id !== lessonId)
      : [...progress.savedLessonIds, lessonId]
    writeJson('progress', { ...progress, savedLessonIds: updated })
    return updated
  }

  try {
    const res = await apiClient.post<{ success: boolean; savedLessonIds: string[] }>('/api/saved/toggle', {
      lessonId,
    })
    return res.savedLessonIds || []
  } catch {
    return []
  }
}
