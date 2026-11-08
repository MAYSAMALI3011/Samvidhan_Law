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
  completeLesson: (lessonId: string, title: string) => void | Promise<void>
  saveQuizScore: (quizId: string, score: number, title: string) => void | Promise<void>
  toggleBookmark: (lessonId: string) => void | Promise<void>
  toggleSaved: (lessonId: string) => void | Promise<void>
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
  setDailyGoal: (goal: number) => void | Promise<void>
  playSound: (type: SoundEffectType) => void
  openChest: (chestId: string, xpBonus?: number) => void | Promise<void>
  awardBadge: (badgeId: string) => void | Promise<void>
  useStreakFreeze: () => void | Promise<void>
  setUserTier: (tier: UserTier) => void
  incrementAiUsage: () => number
}

export const AppStateContext = createContext<AppState | null>(null)

export type { ActivityItem }
