import assert from 'node:assert'
import test from 'node:test'

// Polyfill in-memory localStorage for Node.js test runner environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as unknown as Storage
}

import {
  getCourse,
  getLesson,
  lessonsForCourse,
  neighbours,
  continueLesson,
} from '../api/services/catalogService.ts'
import { searchAll } from '../api/services/searchService.ts'
import { completeLessonEvent, submitQuizEvent } from '../api/services/progressService.ts'
import { toggleBookmarkApi, toggleSavedApi } from '../api/services/bookmarksService.ts'
import { removeKey, readJson, writeJson } from '../utils/storage.ts'
import type { ProgressState, QuizQuestion } from '../types/index.ts'

// ============================================================================
// 1. CATALOG LOOKUPS CHARACTERIZATION TESTS
// ============================================================================

test('catalog characterization: getCourse retrieves course metadata and chapters', () => {
  const course = getCourse('constitution-foundations')
  assert.ok(course, 'Course constitution-foundations should exist')
  assert.strictEqual(course?.title, 'Constitution Foundations')
  assert.strictEqual(course?.level, 'Foundation')
  assert.strictEqual(course?.category, 'Constitution')
  assert.strictEqual(course?.chapters.length, 2)
  assert.deepStrictEqual(course?.chapters[0].lessonIds, ['cf-preamble', 'cf-parts'])

  // Non-existent course
  assert.strictEqual(getCourse('non-existent-course-id'), undefined)
})

test('catalog characterization: getLesson retrieves lesson content and quiz linkage', () => {
  const lesson = getLesson('cf-preamble')
  assert.ok(lesson, 'Lesson cf-preamble should exist')
  assert.strictEqual(lesson?.courseId, 'constitution-foundations')
  assert.strictEqual(lesson?.chapterId, 'cf-1')
  assert.strictEqual(lesson?.title, 'The Preamble as a key to reading the Constitution')
  assert.strictEqual(lesson?.quizId, 'quiz-cf-preamble')
  assert.ok(Array.isArray(lesson?.content) && lesson.content.length > 0)
  assert.ok(Array.isArray(lesson?.takeaways) && lesson.takeaways.length > 0)

  // Non-existent lesson
  assert.strictEqual(getLesson('unknown-lesson-id'), undefined)
})

test('catalog characterization: lessonsForCourse retrieves ordered lessons in course', () => {
  const lessons = lessonsForCourse('constitution-foundations')
  assert.strictEqual(lessons.length, 4)
  const ids = lessons.map((l) => l.id)
  assert.deepStrictEqual(ids, ['cf-preamble', 'cf-parts', 'cf-parliament', 'cf-courts'])

  const empty = lessonsForCourse('non-existent-course')
  assert.deepStrictEqual(empty, [])
})

test('catalog characterization: neighbours finds previous and next lesson in course', () => {
  const middle = getLesson('cf-parts')
  assert.ok(middle)
  const navMiddle = neighbours(middle)
  assert.strictEqual(navMiddle.prev?.id, 'cf-preamble')
  assert.strictEqual(navMiddle.next?.id, 'cf-parliament')

  // First lesson has no previous
  const first = getLesson('cf-preamble')
  assert.ok(first)
  const navFirst = neighbours(first)
  assert.strictEqual(navFirst.prev, undefined)
  assert.strictEqual(navFirst.next?.id, 'cf-parts')

  // Last lesson has no next
  const last = getLesson('cf-courts')
  assert.ok(last)
  const navLast = neighbours(last)
  assert.strictEqual(navLast.prev?.id, 'cf-parliament')
  assert.strictEqual(navLast.next, undefined)
})

test('catalog characterization: continueLesson returns the first uncompleted lesson', () => {
  // None completed -> returns first lesson
  const nextFromEmpty = continueLesson([])
  assert.strictEqual(nextFromEmpty.id, 'cf-preamble')

  // Preamble completed -> returns cf-parts
  const nextFromOne = continueLesson(['cf-preamble'])
  assert.strictEqual(nextFromOne.id, 'cf-parts')

  // Both completed -> returns cf-parliament
  const nextFromTwo = continueLesson(['cf-preamble', 'cf-parts'])
  assert.strictEqual(nextFromTwo.id, 'cf-parliament')
})

test('catalog characterization: searchAll matches across courses, lessons, topics, and library documents', async () => {
  const resultsPreamble = await searchAll('preamble')
  assert.ok(resultsPreamble.lessons.some((l) => l.id === 'cf-preamble'), 'Should find cf-preamble lesson')
  assert.ok(resultsPreamble.topics.some((t) => t.id === 'preamble'), 'Should find preamble topic')

  const resultsCourse = await searchAll('constitution')
  assert.ok(resultsCourse.courses.length >= 1, 'Should match course with constitution query')

  const emptyResults = await searchAll('xyz999nonexistentquery')
  assert.strictEqual(emptyResults.courses.length, 0)
  assert.strictEqual(emptyResults.lessons.length, 0)
  assert.strictEqual(emptyResults.topics.length, 0)
  assert.strictEqual(emptyResults.documents.length, 0)
})

// ============================================================================
// 2. PROGRESS MUTATIONS CHARACTERIZATION TESTS
// ============================================================================

test('progress characterization: completeLessonEvent updates completedLessonIds, awards XP, and records history', async () => {
  removeKey('progress')
  const initialProgress: ProgressState = {
    completedLessonIds: [],
    quizScores: {},
    bookmarks: [],
    savedLessonIds: [],
    history: [],
    xp: 20,
    streak: 2,
    dailyGoal: 30,
    soundEnabled: true,
    mascotEnabled: true,
    streakFreezes: 0,
    badges: [],
  }
  writeJson('progress', initialProgress)

  const res = await completeLessonEvent({
    lessonId: 'cf-preamble',
    title: 'The Preamble',
  })

  assert.strictEqual(res.success, true)
  assert.strictEqual(res.earnedXp, 15)
  assert.ok(res.progress.completedLessonIds.includes('cf-preamble'))
  assert.strictEqual(res.progress.xp, 35) // 20 + 15
  assert.strictEqual(res.progress.history.length, 1)
  assert.ok(res.progress.history[0].label.includes('The Preamble'))

  // Re-completing the same lesson does not duplicate ID in completedLessonIds
  const resDuplicate = await completeLessonEvent({
    lessonId: 'cf-preamble',
    title: 'The Preamble',
  })
  assert.strictEqual(resDuplicate.progress.completedLessonIds.filter((id) => id === 'cf-preamble').length, 1)
  assert.strictEqual(resDuplicate.earnedXp, 15)
})

test('progress characterization: submitQuizEvent awards tiered bonus XP and records quizScores', async () => {
  removeKey('progress')
  const initialProgress: ProgressState = {
    completedLessonIds: [],
    quizScores: {},
    bookmarks: [],
    savedLessonIds: [],
    history: [],
    xp: 50,
    streak: 1,
    dailyGoal: 30,
    soundEnabled: true,
    mascotEnabled: true,
    streakFreezes: 0,
    badges: [],
  }
  writeJson('progress', initialProgress)

  // High score (>= 80%) awards 25 XP
  const resHigh = await submitQuizEvent({
    quizId: 'quiz-cf-preamble',
    title: 'Preamble Mastery',
    score: 100,
  })
  assert.strictEqual(resHigh.success, true)
  assert.strictEqual(resHigh.earnedXp, 25)
  assert.strictEqual(resHigh.progress.xp, 75) // 50 + 25
  assert.strictEqual(resHigh.progress.quizScores['quiz-cf-preamble'], 100)

  // Lower score (< 80%) awards 15 XP
  const resLow = await submitQuizEvent({
    quizId: 'quiz-cf-parts',
    title: 'Constitutional Parts',
    score: 60,
  })
  assert.strictEqual(resLow.earnedXp, 15)
  assert.strictEqual(resLow.progress.xp, 90) // 75 + 15
  assert.strictEqual(resLow.progress.quizScores['quiz-cf-parts'], 60)
})

test('progress characterization: toggleBookmarkApi and toggleSavedApi toggle presence cleanly', async () => {
  removeKey('progress')
  const initial: ProgressState = {
    completedLessonIds: [],
    quizScores: {},
    bookmarks: [],
    savedLessonIds: [],
    history: [],
    xp: 0,
    streak: 0,
    dailyGoal: 30,
    soundEnabled: true,
    mascotEnabled: true,
    streakFreezes: 0,
    badges: [],
  }
  writeJson('progress', initial)

  // Bookmark toggle on
  const bookmarks1 = await toggleBookmarkApi('cf-preamble')
  assert.deepStrictEqual(bookmarks1, ['cf-preamble'])
  assert.ok(readJson<ProgressState>('progress', initial).bookmarks.includes('cf-preamble'))

  // Bookmark toggle off
  const bookmarks2 = await toggleBookmarkApi('cf-preamble')
  assert.deepStrictEqual(bookmarks2, [])
  assert.ok(!readJson<ProgressState>('progress', initial).bookmarks.includes('cf-preamble'))

  // Saved lesson toggle on
  const saved1 = await toggleSavedApi('cf-preamble')
  assert.deepStrictEqual(saved1, ['cf-preamble'])

  // Saved lesson toggle off
  const saved2 = await toggleSavedApi('cf-preamble')
  assert.deepStrictEqual(saved2, [])
})

// ============================================================================
// 3. QUIZ ENGINE SCORING CHARACTERIZATION TESTS (ALL 6 QUESTION TYPES)
// ============================================================================

function scoreQuestion(
  q: QuizQuestion,
  answers: {
    selectedOptionId?: string | null
    matchedPairs?: Record<string, string>
    orderedSteps?: { id: string; label: string; order: number }[]
    filledWord?: string | null
    spottedSentenceId?: string | null
  },
): boolean {
  if (q.type === 'match_pairs' && q.pairs) {
    const pairs = answers.matchedPairs || {}
    return q.pairs.every((pair) => pairs[pair.left] === pair.right)
  }
  if (q.type === 'order_steps' && answers.orderedSteps) {
    return answers.orderedSteps.every((step, idx) => step.order === idx + 1)
  }
  if (q.type === 'fill_blank') {
    return answers.filledWord?.toLowerCase() === q.blankCorrectWord?.toLowerCase()
  }
  if (q.type === 'spot_violation' && q.spotSentences) {
    const chosen = q.spotSentences.find((s) => s.id === answers.spottedSentenceId)
    return chosen?.isViolation === true
  }
  return answers.selectedOptionId === q.correctOptionId
}

test('quiz engine characterization: multiple_choice evaluation', () => {
  const mcq: QuizQuestion = {
    id: 'q-mcq-1',
    type: 'multiple_choice',
    prompt: 'Who holds sovereign authority in India?',
    options: [
      { id: 'opt-1', label: 'The President' },
      { id: 'opt-2', label: 'The People of India' },
      { id: 'opt-3', label: 'The Supreme Court' },
    ],
    correctOptionId: 'opt-2',
    explanation: 'The Preamble begins with We, The People of India.',
  }

  assert.strictEqual(scoreQuestion(mcq, { selectedOptionId: 'opt-2' }), true)
  assert.strictEqual(scoreQuestion(mcq, { selectedOptionId: 'opt-1' }), false)
  assert.strictEqual(scoreQuestion(mcq, { selectedOptionId: null }), false)
})

test('quiz engine characterization: true_false evaluation', () => {
  const tf: QuizQuestion = {
    id: 'q-tf-1',
    type: 'true_false',
    prompt: 'The Constitution can be amended to destroy its basic structure.',
    options: [
      { id: 'true', label: 'True' },
      { id: 'false', label: 'False' },
    ],
    correctOptionId: 'false',
    explanation: 'Kesavananda Bharati (1973) held that the basic structure cannot be destroyed.',
  }

  assert.strictEqual(scoreQuestion(tf, { selectedOptionId: 'false' }), true)
  assert.strictEqual(scoreQuestion(tf, { selectedOptionId: 'true' }), false)
})

test('quiz engine characterization: match_pairs evaluation', () => {
  const matchQ: QuizQuestion = {
    id: 'q-match-1',
    type: 'match_pairs',
    prompt: 'Match constitutional articles to their core guarantees',
    pairs: [
      { id: 'p1', left: 'Article 14', right: 'Equality Before Law' },
      { id: 'p2', left: 'Article 19', right: 'Six Democratic Freedoms' },
      { id: 'p3', left: 'Article 21', right: 'Life & Personal Liberty' },
    ],
    explanation: 'Core Fundamental Rights in Part III.',
  }

  // All pairs matched correctly
  assert.strictEqual(
    scoreQuestion(matchQ, {
      matchedPairs: {
        'Article 14': 'Equality Before Law',
        'Article 19': 'Six Democratic Freedoms',
        'Article 21': 'Life & Personal Liberty',
      },
    }),
    true,
  )

  // One pair mismatched
  assert.strictEqual(
    scoreQuestion(matchQ, {
      matchedPairs: {
        'Article 14': 'Six Democratic Freedoms',
        'Article 19': 'Equality Before Law',
        'Article 21': 'Life & Personal Liberty',
      },
    }),
    false,
  )

  // Incomplete pairs
  assert.strictEqual(
    scoreQuestion(matchQ, {
      matchedPairs: {
        'Article 14': 'Equality Before Law',
      },
    }),
    false,
  )
})

test('quiz engine characterization: order_steps evaluation', () => {
  const orderQ: QuizQuestion = {
    id: 'q-order-1',
    type: 'order_steps',
    prompt: 'Arrange the sequence of an arrest procedure under D.K. Basu guidelines',
    steps: [
      { id: 's1', label: 'Identification of arresting officer with clear badge', order: 1 },
      { id: 's2', label: 'Preparation of Memo of Arrest signed by a witness', order: 2 },
      { id: 's3', label: 'Notification of friend/relative within 8-12 hours', order: 3 },
      { id: 's4', label: 'Production before magistrate within 24 hours', order: 4 },
    ],
    explanation: 'Safeguards under Article 22 and D.K. Basu guidelines.',
  }

  // Correct 1, 2, 3, 4 order
  assert.strictEqual(
    scoreQuestion(orderQ, {
      orderedSteps: [
        { id: 's1', label: 'Step 1', order: 1 },
        { id: 's2', label: 'Step 2', order: 2 },
        { id: 's3', label: 'Step 3', order: 3 },
        { id: 's4', label: 'Step 4', order: 4 },
      ],
    }),
    true,
  )

  // Swapped order
  assert.strictEqual(
    scoreQuestion(orderQ, {
      orderedSteps: [
        { id: 's2', label: 'Step 2', order: 2 },
        { id: 's1', label: 'Step 1', order: 1 },
        { id: 's3', label: 'Step 3', order: 3 },
        { id: 's4', label: 'Step 4', order: 4 },
      ],
    }),
    false,
  )
})

test('quiz engine characterization: fill_blank evaluation (case-insensitive)', () => {
  const fillQ: QuizQuestion = {
    id: 'q-fill-1',
    type: 'fill_blank',
    prompt: 'Fill in the constitutional guarantee',
    sentenceWithBlank: 'Article 21 protects life and personal [blank].',
    blankCorrectWord: 'liberty',
    wordBank: ['liberty', 'property', 'employment', 'privilege'],
    explanation: 'Article 21 guarantees life and personal liberty.',
  }

  assert.strictEqual(scoreQuestion(fillQ, { filledWord: 'liberty' }), true)
  assert.strictEqual(scoreQuestion(fillQ, { filledWord: 'LIBERTY' }), true)
  assert.strictEqual(scoreQuestion(fillQ, { filledWord: 'Liberty' }), true)
  assert.strictEqual(scoreQuestion(fillQ, { filledWord: 'property' }), false)
  assert.strictEqual(scoreQuestion(fillQ, { filledWord: null }), false)
})

test('quiz engine characterization: spot_violation evaluation', () => {
  const spotQ: QuizQuestion = {
    id: 'q-spot-1',
    type: 'spot_violation',
    prompt: 'Identify the unconstitutional action in this scenario',
    spotSentences: [
      { id: 'sent-1', text: 'Ramesh was questioned politely by the officer.', isViolation: false },
      { id: 'sent-2', text: 'The officer detained him for 48 hours without producing him before a Magistrate.', isViolation: true },
      { id: 'sent-3', text: 'His lawyer was notified the following morning.', isViolation: false },
    ],
    explanation: 'Article 22(2) requires production before nearest magistrate within 24 hours of arrest.',
  }

  assert.strictEqual(scoreQuestion(spotQ, { spottedSentenceId: 'sent-2' }), true)
  assert.strictEqual(scoreQuestion(spotQ, { spottedSentenceId: 'sent-1' }), false)
  assert.strictEqual(scoreQuestion(spotQ, { spottedSentenceId: 'sent-3' }), false)
  assert.strictEqual(scoreQuestion(spotQ, { spottedSentenceId: null }), false)
})
