export type Theme = 'light' | 'dark'
export type ThemeMode = 'system' | 'light' | 'dark'

export type CourseLevel = 'Foundation' | 'Core' | 'Applied'
export type UserRole = 'learner' | 'editor' | 'reviewer' | 'admin' | 'superadmin'
export type UserTier = 'free' | 'pro' | 'patron'

export interface ExplainerGlossaryTerm {
  term: string
  definition: string
  citation?: string
}

export interface ScenarioChoice {
  id: string
  text: string
  isConstitutional: boolean
  outcome: string
  articleRef: string
}

export interface CitizenExample {
  title: string
  situation: string
  law: string
  action: string
}

export interface InteractiveLessonCard {
  id: string
  kicker: string
  title: string
  summary: string
  simplifiedSummary?: string
  officialArticleNumber?: string
  officialArticleText?: string
  landmarkCase?: string
  glossaryTerms?: ExplainerGlossaryTerm[]
  didYouKnow?: { front: string; back: string }
  scenario?: {
    prompt: string
    choices: ScenarioChoice[]
  }
  takeaway: string
  citizenExample?: CitizenExample
}

export interface Lesson {
  id: string
  courseId: string
  chapterId: string
  title: string
  durationMinutes: number
  summary: string
  content: string[]
  example: string
  takeaways: string[]
  quizId?: string
  interactiveCards?: InteractiveLessonCard[]
}

export interface Chapter {
  id: string
  title: string
  lessonIds: string[]
}

export interface Course {
  id: string
  title: string
  tagline: string
  description: string
  level: CourseLevel
  category: string
  estimatedHours: number
  lessonCount: number
  chapters: Chapter[]
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'match_pairs'
  | 'order_steps'
  | 'fill_blank'
  | 'spot_violation'

export interface MatchPair {
  id: string
  left: string
  right: string
}

export interface QuizQuestion {
  id: string
  type?: QuestionType
  prompt: string
  options?: { id: string; label: string }[]
  correctOptionId?: string
  explanation: string
  citation?: string
  // For Match Pairs
  pairs?: MatchPair[]
  // For Order Steps
  steps?: { id: string; label: string; order: number }[]
  // For Fill in Blank
  sentenceWithBlank?: string // e.g. "Under Article 21, no person shall be deprived of his life or [blank] except according to procedure established by law."
  blankCorrectWord?: string
  wordBank?: string[]
  // For Spot the Violation
  spotSentences?: { id: string; text: string; isViolation: boolean }[]
}

export interface Quiz {
  id: string
  courseId: string
  lessonId: string
  title: string
  questions: QuizQuestion[]
}

export interface ConstitutionTopic {
  id: string
  title: string
  part: string
  summary: string
  sections: { heading: string; body: string }[]
  relatedLessonIds: string[]
  sourceNote: string
}

export interface LibraryDocument {
  id: string
  title: string
  category: string
  summary: string
  updatedLabel: string
  sourceLabel: string
  isSample: true
  body: string[]
  tags: string[]
}

export interface AskMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  sources?: { title: string; note: string }[]
  nextSteps?: string[]
  isMock?: boolean
}

export interface AskConversation {
  id: string
  title: string
  messages: AskMessage[]
}

export interface ActivityItem {
  id: string
  label: string
  at: string
  href: string
}

export interface DemoUser {
  id?: string
  name: string
  email: string
  interests: string[]
  role?: UserRole
  tier?: UserTier
  aiUsageToday?: number
}

export interface ProgressState {
  completedLessonIds: string[]
  quizScores: Record<string, number>
  bookmarks: string[]
  savedLessonIds: string[]
  history: ActivityItem[]
  xp: number
  streak: number
  dailyGoal: number
  soundEnabled: boolean
  mascotEnabled: boolean
  streakFreezes: number
  badges: string[]
  weeklyHistory?: { day: string; xp: number; completed: boolean }[]
  chestsOpened?: string[]
}

export interface LearningUnitLesson {
  id: string
  title: string
  subtitle: string
  durationMinutes: number
  xp: number
  articleCitation: string
  cards: InteractiveLessonCard[]
  quizQuestions?: QuizQuestion[]
}

export interface LearningUnit {
  id: number
  slug: string
  kicker: string
  title: string
  description: string
  lessons: LearningUnitLesson[]
}

