import type {
  Course,
  Lesson,
  LearningUnit,
  Quiz,
  QuizQuestion,
  QuestionType,
  ConstitutionTopic,
  LibraryDocument,
  ProgressState,
  DemoUser,
  UserRole,
  UserTier,
  ActivityItem,
  AskMessage,
} from '../types'

export type {
  Course,
  Lesson,
  LearningUnit,
  Quiz,
  QuizQuestion,
  QuestionType,
  ConstitutionTopic,
  LibraryDocument,
  ProgressState,
  DemoUser,
  UserRole,
  UserTier,
  ActivityItem,
  AskMessage,
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface AuthSessionResponse {
  success: boolean
  user?: DemoUser
  token?: string
  error?: string
}

export interface LessonCompletionEventPayload {
  lessonId: string
  title?: string
}

export interface LessonCompletionResponse {
  success: boolean
  progress: ProgressState
  earnedXp: number
  newBadges?: string[]
  streakIncremented?: boolean
}

export interface QuizSubmissionEventPayload {
  quizId: string
  score: number
  title?: string
}

export interface QuizSubmissionResponse {
  success: boolean
  progress: ProgressState
  earnedXp: number
  newBadges?: string[]
}

export interface ChestOpenEventPayload {
  chestId: string
}

export interface ChestOpenResponse {
  success: boolean
  progress: ProgressState
  bonusXp: number
}

export interface SearchResults {
  courses: Course[]
  lessons: Lesson[]
  topics: ConstitutionTopic[]
  documents: LibraryDocument[]
}

export interface StreamChunk {
  token?: string
  citation?: { label: string; url: string; summary: string }
  followUps?: string[]
  done?: boolean
}

export interface MistakeReportPayload {
  questionId?: string
  cardId?: string
  prompt?: string
  reason: string
}

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export interface NewsletterPayload {
  email: string
}
