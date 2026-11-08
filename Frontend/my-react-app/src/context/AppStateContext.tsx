import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { nowLabel } from '../utils/format'
import { readJson, removeKey, writeJson } from '../utils/storage'
import { playSoundEffect, type SoundEffectType } from '../utils/audio'
import type { ActivityItem, DemoUser, ProgressState, UserTier } from '../types'
import { AppStateContext } from './AppState'
import type { ToastItem } from './AppState'
import { isMockMode } from '../api/config'
import {
  completeLessonEvent,
  submitQuizEvent,
  openChestEvent,
  useStreakFreezeEvent,
  setDailyGoalEvent,
  fetchProgress,
} from '../api/services/progressService'
import { toggleBookmarkApi, toggleSavedApi } from '../api/services/bookmarksService'

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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => {
    const saved = readJson<DemoUser | null>('user', null)
    if (saved) {
      let changed = false
      // Migrate legacy 'user' role to 'learner'
      if ((saved.role as string) === 'user') {
        saved.role = 'learner'
        changed = true
      }
      if (!saved.tier) {
        saved.tier = 'free'
        changed = true
      }
      if (typeof saved.aiUsageToday !== 'number') {
        saved.aiUsageToday = 0
        changed = true
      }
      if (changed) {
        writeJson('user', saved)
      }
      return saved
    }
    return null
  })
  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = readJson<ProgressState>('progress', emptyProgress)
    return {
      ...emptyProgress,
      ...saved,
    }
  })
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const persist = useCallback((next: ProgressState) => {
    setProgress(next)
    writeJson('progress', next)
  }, [])

  const demoSignIn = useCallback((next: DemoUser) => {
    const normalized: DemoUser = {
      ...next,
      role: (next.role as string) === 'user' ? 'learner' : (next.role || 'learner'),
      tier: next.tier || 'free',
      aiUsageToday: typeof next.aiUsageToday === 'number' ? next.aiUsageToday : 0,
    }
    setUser(normalized)
    writeJson('user', normalized)
  }, [])

  const demoSignOut = useCallback(() => {
    setUser(null)
    removeKey('user')
  }, [])

  const playSound = useCallback(
    (type: SoundEffectType) => {
      if (progress.soundEnabled) {
        playSoundEffect(type)
      }
    },
    [progress.soundEnabled],
  )

  const pushToast = useCallback(
    (
      message: string,
      tone: ToastItem['tone'] = 'info',
      action?: { label: string; onAction: () => void },
      duration = 4500,
    ) => {
      const id = uid()
      setToasts((list) => [...list, { id, message, tone, action, duration }])
      window.setTimeout(() => {
        setToasts((list) => list.filter((t) => t.id !== id))
      }, duration)
    },
    [],
  )

  const addXp = useCallback(
    (amount: number) => {
      setProgress((current) => {
        const nextXp = (current.xp || 0) + amount
        const next = { ...current, xp: nextXp }
        writeJson('progress', next)
        return next
      })
      pushToast(`+${amount} XP earned! Keep going!`, 'success')
    },
    [pushToast],
  )

  const toggleSound = useCallback(() => {
    setProgress((current) => {
      const next = { ...current, soundEnabled: !current.soundEnabled }
      writeJson('progress', next)
      return next
    })
  }, [])

  const toggleMascot = useCallback(() => {
    setProgress((current) => {
      const next = { ...current, mascotEnabled: !current.mascotEnabled }
      writeJson('progress', next)
      return next
    })
  }, [])

  useEffect(() => {
    if (user && !isMockMode()) {
      fetchProgress()
        .then((serverProgress) => {
          setProgress(serverProgress)
          writeJson('progress', serverProgress)
        })
        .catch(() => {})
    }
  }, [user])

  const setDailyGoal = useCallback(async (goal: number) => {
    setProgress((current) => {
      const next = { ...current, dailyGoal: goal }
      writeJson('progress', next)
      return next
    })
    try {
      await setDailyGoalEvent(goal)
    } catch {
      // non-blocking
    }
  }, [])

  const openChest = useCallback(
    async (chestId: string, xpBonus: number = 20) => {
      if (progress.chestsOpened?.includes(chestId)) return
      try {
        const res = await openChestEvent({ chestId, xpBonus })
        setProgress(res.progress)
        writeJson('progress', res.progress)
        playSound('chest')
        pushToast(`Treasure unlocked! +${res.bonusXp} Bonus XP`, 'success')
      } catch {
        pushToast('Unable to open chest.', 'error')
      }
    },
    [playSound, progress.chestsOpened, pushToast],
  )

  const awardBadge = useCallback(
    (badgeId: string) => {
      if (progress.badges?.includes(badgeId)) return
      setProgress((current) => {
        const badges = [...(current.badges || []), badgeId]
        const next = { ...current, badges }
        writeJson('progress', next)
        return next
      })
      playSound('complete')
      pushToast(`New Badge Earned!`, 'success')
    },
    [playSound, progress.badges, pushToast],
  )

  const useStreakFreeze = useCallback(async () => {
    if ((progress.streakFreezes || 0) <= 0) return
    try {
      const nextProgress = await useStreakFreezeEvent()
      setProgress(nextProgress)
      writeJson('progress', nextProgress)
      pushToast('Streak Freeze activated! Your streak is protected for today.', 'info')
    } catch {
      pushToast('Unable to activate streak freeze.', 'error')
    }
  }, [progress.streakFreezes, pushToast])

  const recordActivity = useCallback(
    (label: string, href: string) => {
      setProgress((current) => {
        const item: ActivityItem = { id: uid(), label, at: nowLabel(), href }
        const next = { ...current, history: [item, ...current.history].slice(0, 12) }
        writeJson('progress', next)
        return next
      })
    },
    [],
  )

  const completeLesson = useCallback(
    async (lessonId: string, title: string) => {
      try {
        const res = await completeLessonEvent({ lessonId, title })
        setProgress(res.progress)
        writeJson('progress', res.progress)
        if (progress.soundEnabled) {
          playSoundEffect('complete')
        }
        pushToast(`Lesson completed! +${res.earnedXp} XP`, 'success')
      } catch (err) {
        console.error('Failed to complete lesson:', err)
        pushToast('Unable to sync lesson completion with server.', 'error')
      }
    },
    [progress.soundEnabled, pushToast],
  )

  const saveQuizScore = useCallback(
    async (quizId: string, score: number, title: string) => {
      try {
        const res = await submitQuizEvent({ quizId, score, title })
        setProgress(res.progress)
        writeJson('progress', res.progress)
        if (progress.soundEnabled) {
          playSoundEffect(score >= 70 ? 'complete' : 'correct')
        }
        pushToast(`Quiz submitted: ${score}%! (+${res.earnedXp} XP)`, 'success')
      } catch (err) {
        console.error('Failed to record quiz score:', err)
        pushToast('Unable to sync quiz score with server.', 'error')
      }
    },
    [progress.soundEnabled, pushToast],
  )

  const toggleBookmark = useCallback(
    async (lessonId: string) => {
      const exists = progress.bookmarks.includes(lessonId)
      const updatedBookmarks = exists
        ? progress.bookmarks.filter((id) => id !== lessonId)
        : [...progress.bookmarks, lessonId]
      persist({
        ...progress,
        bookmarks: updatedBookmarks,
      })
      if (!isMockMode()) {
        try {
          await toggleBookmarkApi(lessonId)
        } catch {
          // fallback
        }
      }
    },
    [persist, progress],
  )

  const toggleSaved = useCallback(
    async (lessonId: string) => {
      const exists = progress.savedLessonIds.includes(lessonId)
      const updatedSaved = exists
        ? progress.savedLessonIds.filter((id) => id !== lessonId)
        : [...progress.savedLessonIds, lessonId]
      persist({
        ...progress,
        savedLessonIds: updatedSaved,
      })
      if (!isMockMode()) {
        try {
          await toggleSavedApi(lessonId)
        } catch {
          // fallback
        }
      }
    },
    [persist, progress],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const setUserTierState = useCallback((tier: UserTier) => {
    setUser((prev) => {
      if (!prev) return null
      const updated: DemoUser = { ...prev, tier }
      writeJson('user', updated)
      return updated
    })
    window.dispatchEvent(new CustomEvent('samvidhan:tier-changed', { detail: { tier } }))
  }, [])

  const incrementAiUsageState = useCallback((): number => {
    let nextUsage = 1
    setUser((prev) => {
      if (!prev) return null
      nextUsage = (prev.aiUsageToday || 0) + 1
      const updated: DemoUser = { ...prev, aiUsageToday: nextUsage }
      writeJson('user', updated)
      return updated
    })
    window.dispatchEvent(new CustomEvent('samvidhan:ai-usage-changed', { detail: { used: nextUsage } }))
    return nextUsage
  }, [])

  const value = useMemo(
    () => ({
      user,
      progress,
      toasts,
      demoSignIn,
      demoSignOut,
      completeLesson,
      saveQuizScore,
      toggleBookmark,
      toggleSaved,
      recordActivity,
      pushToast,
      dismissToast,
      addXp,
      toggleSound,
      toggleMascot,
      setDailyGoal,
      playSound,
      openChest,
      awardBadge,
      useStreakFreeze,
      setUserTier: setUserTierState,
      incrementAiUsage: incrementAiUsageState,
    }),
    [
      user,
      progress,
      toasts,
      demoSignIn,
      demoSignOut,
      completeLesson,
      saveQuizScore,
      toggleBookmark,
      toggleSaved,
      recordActivity,
      pushToast,
      dismissToast,
      addXp,
      toggleSound,
      toggleMascot,
      setDailyGoal,
      playSound,
      openChest,
      awardBadge,
      useStreakFreeze,
      setUserTierState,
      incrementAiUsageState,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
