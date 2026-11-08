import { useQuery } from '@tanstack/react-query'
import {
  fetchCoursesApi,
  fetchCourseApi,
  fetchLessonApi,
  fetchUnitsApi,
  fetchQuizApi,
  fetchConstitutionTopicsApi,
  fetchConstitutionTopicApi,
  fetchLibraryDocumentsApi,
  fetchLibraryDocumentApi,
} from '../services/catalogService'
import { fetchProgress } from '../services/progressService'
import { searchAll } from '../services/searchService'

export const queryKeys = {
  courses: ['courses'] as const,
  course: (id: string) => ['courses', id] as const,
  lesson: (id: string) => ['lessons', id] as const,
  units: ['units'] as const,
  quiz: (id: string) => ['quizzes', id] as const,
  topics: ['topics'] as const,
  topic: (id: string) => ['topics', id] as const,
  documents: (params?: { category?: string; tag?: string }) => ['documents', params] as const,
  document: (id: string) => ['documents', id] as const,
  progress: ['progress'] as const,
  search: (query: string) => ['search', query] as const,
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: queryKeys.courses,
    queryFn: fetchCoursesApi,
  })
}

export function useCourseQuery(courseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.course(courseId || ''),
    queryFn: () => (courseId ? fetchCourseApi(courseId) : undefined),
    enabled: Boolean(courseId),
  })
}

export function useLessonQuery(lessonId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lesson(lessonId || ''),
    queryFn: () => (lessonId ? fetchLessonApi(lessonId) : undefined),
    enabled: Boolean(lessonId),
  })
}

export function useUnitsQuery() {
  return useQuery({
    queryKey: queryKeys.units,
    queryFn: fetchUnitsApi,
  })
}

export function useQuizQuery(quizId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quiz(quizId || ''),
    queryFn: () => (quizId ? fetchQuizApi(quizId) : undefined),
    enabled: Boolean(quizId),
  })
}

export function useConstitutionTopicsQuery() {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: fetchConstitutionTopicsApi,
  })
}

export function useConstitutionTopicQuery(topicId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.topic(topicId || ''),
    queryFn: () => (topicId ? fetchConstitutionTopicApi(topicId) : undefined),
    enabled: Boolean(topicId),
  })
}

export function useLibraryDocumentsQuery(params?: { category?: string; tag?: string }) {
  return useQuery({
    queryKey: queryKeys.documents(params),
    queryFn: () => fetchLibraryDocumentsApi(params),
  })
}

export function useLibraryDocumentQuery(documentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.document(documentId || ''),
    queryFn: () => (documentId ? fetchLibraryDocumentApi(documentId) : undefined),
    enabled: Boolean(documentId),
  })
}

export function useProgressQuery() {
  return useQuery({
    queryKey: queryKeys.progress,
    queryFn: fetchProgress,
  })
}

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => searchAll(query),
    enabled: Boolean(query.trim()),
  })
}
