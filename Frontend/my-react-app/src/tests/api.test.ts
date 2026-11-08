import test from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import {
  userProfileSchema,
  lessonCompletionResponseSchema,
  quizSubmissionResponseSchema,
  subscriptionPlanSchema,
  safeValidate,
} from '../api/schemas.ts'
import {
  getAuthStrategy,
  setAuthStrategy,
  getAuthToken,
  setAuthToken,
  isMockMode,
} from '../api/config.ts'
import { createIdempotencyKey, ApiError } from '../api/client.ts'

test('auth config: manages auth strategy and bearer token state cleanly', () => {
  assert.equal(getAuthStrategy(), 'cookie')
  setAuthStrategy('bearer')
  assert.equal(getAuthStrategy(), 'bearer')
  setAuthToken('test-token-xyz')
  assert.equal(getAuthToken(), 'test-token-xyz')

  // Reset
  setAuthToken(null)
  setAuthStrategy('cookie')
  assert.equal(getAuthToken(), null)
  assert.equal(getAuthStrategy(), 'cookie')
})

test('isMockMode: defaults correctly in dev environment', () => {
  assert.equal(typeof isMockMode(), 'boolean')
})

test('createIdempotencyKey: generates non-empty unique keys', () => {
  const k1 = createIdempotencyKey()
  const k2 = createIdempotencyKey()
  assert.ok(k1 && typeof k1 === 'string')
  assert.ok(k2 && typeof k2 === 'string')
  assert.notEqual(k1, k2)
})

test('userProfileSchema: validates and normalizes profile payload', () => {
  const raw = {
    id: 'u-123',
    name: 'Priya Sharma',
    email: 'priya@example.in',
    interests: ['Constitutional Law'],
  }
  const result = userProfileSchema.parse(raw)
  assert.equal(result.role, 'learner')
  assert.equal(result.tier, 'free')
  assert.equal(result.aiUsageToday, 0)
})

test('safeValidate: returns valid data when parsing succeeds', () => {
  const raw = {
    success: true,
    progress: {
      completedLessonIds: ['lesson-1'],
      quizScores: { 'quiz-1': 100 },
      bookmarks: [],
      savedLessonIds: [],
      history: [],
      xp: 60,
      streak: 4,
      dailyGoal: 30,
      soundEnabled: true,
      mascotEnabled: true,
      streakFreezes: 1,
      badges: ['first-step'],
    },
    earnedXp: 15,
  }
  const validated = safeValidate(lessonCompletionResponseSchema, raw, 'test.completeLesson')
  assert.equal(validated.success, true)
  assert.equal(validated.earnedXp, 15)
  assert.equal(validated.progress.xp, 60)
})

test('safeValidate: gracefully falls back for non-critical content lists', () => {
  const tagsSchema = z.array(z.string())
  const malformed = { not: 'an array' }
  const fallback = ['Preamble', 'Fundamental Rights']
  const result = safeValidate(tagsSchema, malformed, 'catalog.tags', fallback)
  assert.deepEqual(result, fallback)
})

test('safeValidate: never substitutes fallbacks over critical state (throws ApiError to preserve real state)', () => {
  const malformed = {
    name: 'Corrupted User',
    email: 'invalid-email-pattern',
  }
  const fallback = {
    name: 'Fallback User',
    email: 'fallback@example.in',
    interests: [],
    role: 'learner' as const,
    tier: 'free' as const,
    aiUsageToday: 0,
  }

  assert.throws(
    () => {
      safeValidate(userProfileSchema, malformed, 'authService.userProfile', fallback)
    },
    (err: unknown) => {
      return err instanceof ApiError && err.isValidationError === true
    },
  )
})

test('quizSubmissionResponseSchema: validates quiz submission event response', () => {
  const raw = {
    success: true,
    progress: {
      completedLessonIds: [],
      quizScores: { 'quiz-preamble-1': 85 },
      bookmarks: [],
      savedLessonIds: [],
      history: [],
      xp: 70,
      streak: 3,
      dailyGoal: 30,
      soundEnabled: true,
      mascotEnabled: true,
      streakFreezes: 1,
      badges: [],
    },
    earnedXp: 25,
  }
  const validated = safeValidate(quizSubmissionResponseSchema, raw, 'test.submitQuiz')
  assert.equal(validated.success, true)
  assert.equal(validated.earnedXp, 25)
  assert.equal(validated.progress.quizScores['quiz-preamble-1'], 85)
})

test('subscriptionPlanSchema: validates subscription plan and usage quota', () => {
  const raw = {
    tier: 'pro',
    status: 'active',
    validUntil: '2027-12-31',
    aiUsageToday: 4,
    aiDailyLimit: 9999,
  }
  const validated = safeValidate(subscriptionPlanSchema, raw, 'subscriptionService.getCurrentPlan')
  assert.equal(validated.tier, 'pro')
  assert.equal(validated.aiDailyLimit, 9999)
  assert.equal(validated.aiUsageToday, 4)
})
