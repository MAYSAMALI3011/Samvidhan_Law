import { createContext } from 'react'
import type { ActivityItem, DemoUser, ProgressState, UserTier } from '../types'
import type { SoundEffectType } from '../utils/audio'

export interface ToastItem {
  id: string
  message: string
  tone: 'info' | 'success' | 'error'
  action?: {
    label: string
    onAction: () => void
  }
  duration?: number
}

export interface AppState {
  user: DemoUser | null
  progress: ProgressState
  toasts: ToastItem[]
  demoSignIn: (user: DemoUser) => void
  demoSignOut: () => void
  completeLesson: (lessonId: string, title: string) => void
  saveQuizScore: (quizId: string, score: number, title: string) => void
  toggleBookmark: (lessonId: string) => void
  toggleSaved: (lessonId: string) => void
  recordActivity: (label: string, href: string) => void
  pushToast: (
    message: string,
    tone?: ToastItem['tone'],
    action?: { label: string; onAction: () => void },
    duration?: number,
  ) => void
  dismissToast: (id: string) => void
  addXp: (amount: number) => void
  toggleSound: () => void
  toggleMascot: () => void
  setDailyGoal: (goal: number) => void
  playSound: (type: SoundEffectType) => void
  openChest: (chestId: string, xpBonus?: number) => void
  awardBadge: (badgeId: string) => void
  useStreakFreeze: () => void
  setUserTier: (tier: UserTier) => void
  incrementAiUsage: () => number
}

export const AppStateContext = createContext<AppState | null>(null)

export type { ActivityItem }
