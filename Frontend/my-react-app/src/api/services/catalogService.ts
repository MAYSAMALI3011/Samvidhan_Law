import { z } from 'zod'
import { apiClient } from '../client.ts'
import { isMockMode } from '../config.ts'
import {
  courseSchema,
  lessonSchema,
  learningUnitSchema,
  quizSchema,
  constitutionTopicSchema,
  libraryDocumentSchema,
  safeValidate,
} from '../schemas.ts'
import type {
  Course,
  Lesson,
  LearningUnit,
  Quiz,
  ConstitutionTopic,
  LibraryDocument,
} from '../types.ts'

// Mock Data references
import { courses as mockCourses, lessons as mockLessons, quizzes as mockQuizzes } from '../../data/mock/curriculum.ts'
import { unitsData as mockUnits } from '../../data/mock/learningUnits.ts'
import { constitutionTopics as mockTopics } from '../../data/mock/constitution.ts'
import { libraryDocuments as mockDocuments } from '../../data/mock/library.ts'

/**
 * Async API Fetchers (Used by TanStack Query and live integrations)
 */
export async function fetchCoursesApi(): Promise<Course[]> {
  if (isMockMode()) {
    return mockCourses
  }
  try {
    const raw = await apiClient.get<unknown>('/api/catalog/courses')
    return safeValidate(z.array(courseSchema), raw, 'catalogService.fetchCoursesApi', mockCourses)
  } catch {
    return mockCourses
  }
}

export async function fetchCourseApi(id: string): Promise<Course | undefined> {
  if (isMockMode()) {
    return mockCourses.find((c) => c.id === id)
  }
  try {
    const raw = await apiClient.get<unknown>(`/api/catalog/courses/${encodeURIComponent(id)}`)
    return safeValidate(courseSchema, raw, `catalogService.fetchCourseApi:${id}`)
  } catch {
    return mockCourses.find((c) => c.id === id)
  }
}

export async function fetchLessonApi(id: string): Promise<Lesson | undefined> {
  if (isMockMode()) {
    return mockLessons.find((l) => l.id === id)
  }
  try {
    const raw = await apiClient.get<unknown>(`/api/catalog/lessons/${encodeURIComponent(id)}`)
    return safeValidate(lessonSchema, raw, `catalogService.fetchLessonApi:${id}`)
  } catch {
    return mockLessons.find((l) => l.id === id)
  }
}

export async function fetchUnitsApi(): Promise<LearningUnit[]> {
  if (isMockMode()) {
    return mockUnits
  }
  try {
    const raw = await apiClient.get<unknown>('/api/catalog/units')
    return safeValidate(z.array(learningUnitSchema), raw, 'catalogService.fetchUnitsApi', mockUnits)
  } catch {
    return mockUnits
  }
}

export async function fetchQuizApi(id: string): Promise<Quiz | undefined> {
  if (isMockMode()) {
    return mockQuizzes.find((q) => q.id === id)
  }
  try {
    const raw = await apiClient.get<unknown>(`/api/catalog/quizzes/${encodeURIComponent(id)}`)
    return safeValidate(quizSchema, raw, `catalogService.fetchQuizApi:${id}`)
  } catch {
    return mockQuizzes.find((q) => q.id === id)
  }
}

export async function fetchConstitutionTopicsApi(): Promise<ConstitutionTopic[]> {
  if (isMockMode()) {
    return mockTopics
  }
  try {
    const raw = await apiClient.get<unknown>('/api/constitution/topics')
    return safeValidate(z.array(constitutionTopicSchema), raw, 'catalogService.fetchConstitutionTopicsApi', mockTopics)
  } catch {
    return mockTopics
  }
}

export async function fetchConstitutionTopicApi(id: string): Promise<ConstitutionTopic | undefined> {
  if (isMockMode()) {
    return mockTopics.find((t) => t.id === id)
  }
  try {
    const raw = await apiClient.get<unknown>(`/api/constitution/topics/${encodeURIComponent(id)}`)
    return safeValidate(constitutionTopicSchema, raw, `catalogService.fetchConstitutionTopicApi:${id}`)
  } catch {
    return mockTopics.find((t) => t.id === id)
  }
}

export async function fetchLibraryDocumentsApi(params?: { category?: string; tag?: string }): Promise<LibraryDocument[]> {
  if (isMockMode()) {
    return mockDocuments.filter((d) => {
      if (params?.category && d.category.toLowerCase() !== params.category.toLowerCase()) return false
      if (params?.tag && !d.tags.includes(params.tag)) return false
      return true
    })
  }
  try {
    const raw = await apiClient.get<unknown>('/api/library/documents', { params })
    return safeValidate(z.array(libraryDocumentSchema), raw, 'catalogService.fetchLibraryDocumentsApi', mockDocuments)
  } catch {
    return mockDocuments
  }
}

export async function fetchLibraryDocumentApi(id: string): Promise<LibraryDocument | undefined> {
  if (isMockMode()) {
    return mockDocuments.find((d) => d.id === id)
  }
  try {
    const raw = await apiClient.get<unknown>(`/api/library/documents/${encodeURIComponent(id)}`)
    return safeValidate(libraryDocumentSchema, raw, `catalogService.fetchLibraryDocumentApi:${id}`)
  } catch {
    return mockDocuments.find((d) => d.id === id)
  }
}

/**
 * Synchronous Catalog Accessors & Utilities
 * Provides seamless backwards compatibility for components
 */
export async function listCourses(): Promise<Course[]> {
  return fetchCoursesApi()
}

export function getCourse(id: string): Course | undefined {
  return mockCourses.find((c) => c.id === id)
}

export function getLesson(id: string): Lesson | undefined {
  return mockLessons.find((l) => l.id === id)
}

export function lessonsForCourse(courseId: string): Lesson[] {
  return mockLessons.filter((l) => l.courseId === courseId)
}

export function continueLesson(completed: string[]): Lesson {
  return mockLessons.find((lesson) => !completed.includes(lesson.id)) ?? mockLessons[0]
}

export function getQuiz(id: string): Quiz | undefined {
  return mockQuizzes.find((q) => q.id === id)
}

export function getConstitutionTopic(id: string): ConstitutionTopic | undefined {
  return mockTopics.find((t) => t.id === id)
}

export function listConstitutionTopics(): ConstitutionTopic[] {
  return mockTopics
}

export function getLibraryDocument(id: string): LibraryDocument | undefined {
  return mockDocuments.find((d) => d.id === id)
}

export function listLibraryDocuments(): LibraryDocument[] {
  return mockDocuments
}

export function getLearningUnits(): LearningUnit[] {
  return mockUnits
}

export function neighbours(lesson: Lesson): { prev?: Lesson; next?: Lesson } {
  const list = mockLessons.filter((l) => l.courseId === lesson.courseId)
  const i = list.findIndex((l) => l.id === lesson.id)
  return { prev: list[i - 1], next: list[i + 1] }
}
