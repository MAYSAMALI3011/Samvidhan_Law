import { z } from 'zod'
import { ApiError } from './client.ts'

/**
 * Role and Tier Schemas
 */
export const userRoleSchema = z.enum(['learner', 'editor', 'reviewer', 'admin', 'superadmin'])
export const userTierSchema = z.enum(['free', 'pro', 'patron'])

/**
 * User & Auth Schemas
 */
export const userProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  interests: z.array(z.string()).default([]),
  role: userRoleSchema.default('learner'),
  tier: userTierSchema.default('free'),
  aiUsageToday: z.number().nonnegative().default(0),
}).passthrough()

export const userSettingsSchema = z.object({
  dailyGoal: z.number().default(30),
  soundEnabled: z.boolean().default(true),
  mascotEnabled: z.boolean().default(true),
  reduceMotion: z.boolean().default(false),
  compact: z.boolean().default(false),
}).passthrough()

export const subscriptionPlanSchema = z.object({
  tier: userTierSchema,
  status: z.enum(['active', 'cancelled', 'past_due', 'trialing']),
  validUntil: z.string().optional(),
  aiUsageToday: z.number().default(0),
  aiDailyLimit: z.number().default(5),
}).passthrough()

export const checkoutSessionResponseSchema = z.object({
  success: z.boolean(),
  checkoutUrl: z.string().optional(),
  clientSecret: z.string().optional(),
  message: z.string().optional(),
}).passthrough()

export const referralMilestoneSchema = z.object({
  milestone: z.number(),
  label: z.string(),
  reward: z.string(),
  unlocked: z.boolean(),
})

export const referralStatsSchema = z.object({
  referralCode: z.string(),
  invitesCount: z.number().default(0),
  earnedXp: z.number().default(0),
  milestones: z.array(referralMilestoneSchema).default([]),
}).passthrough()

export const affiliateStatsSchema = z.object({
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  earnings: z.number().default(0),
  payoutStatus: z.string().default('Active'),
}).passthrough()

export const askMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string().default(() => new Date().toISOString()),
  sources: z.array(z.object({ title: z.string(), note: z.string() })).optional(),
  nextSteps: z.array(z.string()).optional(),
}).passthrough()

export const askConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(askMessageSchema).default([]),
  updatedAt: z.string().optional(),
}).passthrough()

export const authResponseSchema = z.object({
  success: z.boolean(),
  user: userProfileSchema.optional(),
  token: z.string().optional(),
  error: z.string().optional(),
}).passthrough()

/**
 * Interactive Lesson Content Schemas
 */
export const scenarioChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  isConstitutional: z.boolean(),
  outcome: z.string(),
  articleRef: z.string(),
})

export const interactiveLessonCardSchema = z.object({
  id: z.string(),
  kicker: z.string(),
  title: z.string(),
  summary: z.string(),
  simplifiedSummary: z.string().optional(),
  officialArticleNumber: z.string().optional(),
  officialArticleText: z.string().optional(),
  landmarkCase: z.string().optional(),
  glossaryTerms: z.array(z.object({
    term: z.string(),
    definition: z.string(),
    citation: z.string().optional(),
  })).optional(),
  didYouKnow: z.object({
    front: z.string(),
    back: z.string(),
  }).optional(),
  scenario: z.object({
    prompt: z.string(),
    choices: z.array(scenarioChoiceSchema),
  }).optional(),
  takeaway: z.string(),
  citizenExample: z.object({
    title: z.string(),
    situation: z.string(),
    law: z.string(),
    action: z.string(),
  }).optional(),
}).passthrough()

export const lessonSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  chapterId: z.string(),
  title: z.string(),
  durationMinutes: z.number(),
  summary: z.string(),
  content: z.array(z.string()),
  example: z.string(),
  takeaways: z.array(z.string()),
  quizId: z.string().optional(),
  interactiveCards: z.array(interactiveLessonCardSchema).optional(),
}).passthrough()

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  lessonIds: z.array(z.string()),
})

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  level: z.enum(['Foundation', 'Core', 'Applied']),
  category: z.string(),
  estimatedHours: z.number(),
  lessonCount: z.number(),
  chapters: z.array(chapterSchema),
}).passthrough()

/**
 * Quiz Schemas
 */
export const matchPairSchema = z.object({
  id: z.string(),
  left: z.string(),
  right: z.string(),
})

export const quizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'multiple_choice',
    'true_false',
    'match_pairs',
    'order_steps',
    'fill_blank',
    'spot_violation',
  ]).optional(),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  correctOptionId: z.string().optional(),
  explanation: z.string(),
  citation: z.string().optional(),
  pairs: z.array(matchPairSchema).optional(),
  steps: z.array(z.object({ id: z.string(), label: z.string(), order: z.number() })).optional(),
  sentenceWithBlank: z.string().optional(),
  blankCorrectWord: z.string().optional(),
  wordBank: z.array(z.string()).optional(),
  spotSentences: z.array(z.object({ id: z.string(), text: z.string(), isViolation: z.boolean() })).optional(),
}).passthrough()

export const quizSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  lessonId: z.string(),
  title: z.string(),
  questions: z.array(quizQuestionSchema),
}).passthrough()

/**
 * Learning Units
 */
export const learningUnitLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  durationMinutes: z.number(),
  xp: z.number(),
  articleCitation: z.string(),
  cards: z.array(interactiveLessonCardSchema),
  quizQuestions: z.array(quizQuestionSchema).optional(),
}).passthrough()

export const learningUnitSchema = z.object({
  id: z.number(),
  slug: z.string(),
  kicker: z.string(),
  title: z.string(),
  description: z.string(),
  lessons: z.array(learningUnitLessonSchema),
}).passthrough()

/**
 * Constitution & Library Schemas
 */
export const constitutionTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  part: z.string(),
  summary: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    body: z.string(),
  })),
  relatedLessonIds: z.array(z.string()),
  sourceNote: z.string(),
}).passthrough()

export const libraryDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  summary: z.string(),
  updatedLabel: z.string(),
  sourceLabel: z.string(),
  isSample: z.literal(true),
  body: z.array(z.string()),
  tags: z.array(z.string()),
}).passthrough()

export const searchResultsSchema = z.object({
  courses: z.array(courseSchema).default([]),
  lessons: z.array(lessonSchema).default([]),
  topics: z.array(constitutionTopicSchema).default([]),
  documents: z.array(libraryDocumentSchema).default([]),
}).passthrough()

/**
 * Progress & Gamification Schemas
 */
export const activityItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  at: z.string(),
  href: z.string(),
})

export const progressStateSchema = z.object({
  completedLessonIds: z.array(z.string()).default([]),
  quizScores: z.record(z.string(), z.number()).default({}),
  bookmarks: z.array(z.string()).default([]),
  savedLessonIds: z.array(z.string()).default([]),
  history: z.array(activityItemSchema).default([]),
  xp: z.number().default(0),
  streak: z.number().default(0),
  dailyGoal: z.number().default(30),
  soundEnabled: z.boolean().default(true),
  mascotEnabled: z.boolean().default(true),
  streakFreezes: z.number().default(1),
  badges: z.array(z.string()).default([]),
  weeklyHistory: z.array(z.object({
    day: z.string(),
    xp: z.number(),
    completed: z.boolean(),
  })).optional(),
  chestsOpened: z.array(z.string()).optional(),
}).passthrough()

export const lessonCompletionResponseSchema = z.object({
  success: z.boolean(),
  progress: progressStateSchema,
  earnedXp: z.number().default(15),
  newBadges: z.array(z.string()).optional(),
  streakIncremented: z.boolean().optional(),
}).passthrough()

export const quizSubmissionResponseSchema = z.object({
  success: z.boolean(),
  progress: progressStateSchema,
  earnedXp: z.number().default(15),
  newBadges: z.array(z.string()).optional(),
}).passthrough()

export const chestOpenResponseSchema = z.object({
  success: z.boolean(),
  progress: progressStateSchema,
  bonusXp: z.number().default(20),
}).passthrough()

/**
 * Safe Zod Parser helper
 * Validates data and on failure, reports error gracefully.
 *
 * Rule:
 * For auth, progress, user profile, and subscription responses, NEVER substitute
 * a fallback over real user state. Keep existing state, report via validation event,
 * and throw ApiError so callers can preserve state and notify the user.
 * Fallbacks are permitted only for non-critical content lists.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string,
  fallback?: T,
  options?: { isCritical?: boolean },
): T {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }

  const isCriticalContext =
    options?.isCritical ||
    /^(auth|progress|user|subscription|payment|me)/i.test(context) ||
    context.includes('authService') ||
    context.includes('progressService') ||
    context.includes('subscriptionService') ||
    context.includes('userService')

  // Gracefully report validation issue
  console.warn(`[API Validation Warning${isCriticalContext ? ' CRITICAL' : ''}] ${context}:`, result.error.issues)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('samvidhan:api-validation-error', {
        detail: {
          context,
          issues: result.error.issues,
          critical: isCriticalContext,
        },
      }),
    )
  }

  // Never substitute a fallback for critical state (auth, progress, subscriptions)
  if (fallback !== undefined && !isCriticalContext) {
    return fallback
  }

  const err = new ApiError(
    `Received unexpected response structure from server (${context}).`,
    502,
    result.error.issues,
  )
  err.isValidationError = true
  throw err
}
