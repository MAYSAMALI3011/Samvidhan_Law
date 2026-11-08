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
  AskConversation,
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
  AskConversation,
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

export interface UserSettings {
  dailyGoal: number
  soundEnabled: boolean
  mascotEnabled: boolean
  reduceMotion: boolean
  compact: boolean
}

export interface SubscriptionPlan {
  tier: UserTier
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  validUntil?: string
  aiUsageToday: number
  aiDailyLimit: number
}

export interface CheckoutSessionResponse {
  success: boolean
  checkoutUrl?: string
  clientSecret?: string
  message?: string
}

export interface ReferralMilestone {
  milestone: number
  label: string
  reward: string
  unlocked: boolean
}

export interface ReferralStats {
  referralCode: string
  invitesCount: number
  earnedXp: number
  milestones: ReferralMilestone[]
}

export interface AffiliateStats {
  clicks: number
  conversions: number
  earnings: number
  payoutStatus: string
}

export interface AffiliateApplicationPayload {
  name: string
  email: string
  organization?: string
  audienceSize?: string
  message: string
}
