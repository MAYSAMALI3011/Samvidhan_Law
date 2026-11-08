import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  completeLessonEvent,
  submitQuizEvent,
  openChestEvent,
  useStreakFreezeEvent,
} from '../services/progressService'
import { toggleBookmarkApi, toggleSavedApi } from '../services/bookmarksService'
import { queryKeys } from './useQueries'
import type { ProgressState } from '../types'

export function useCompleteLessonMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeLessonEvent,
    onSuccess: (data) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, data.progress)
    },
  })
}

export function useSubmitQuizMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitQuizEvent,
    onSuccess: (data) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, data.progress)
    },
  })
}

export function useOpenChestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: openChestEvent,
    onSuccess: (data) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, data.progress)
    },
  })
}

export function useStreakFreezeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: useStreakFreezeEvent,
    onSuccess: (data) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, data)
    },
  })
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleBookmarkApi,
    onSuccess: (updatedBookmarks) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, (prev) => {
        if (!prev) return prev
        return { ...prev, bookmarks: updatedBookmarks }
      })
    },
  })
}

export function useToggleSavedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleSavedApi,
    onSuccess: (updatedSaved) => {
      queryClient.setQueryData<ProgressState>(queryKeys.progress, (prev) => {
        if (!prev) return prev
        return { ...prev, savedLessonIds: updatedSaved }
      })
    },
  })
}
