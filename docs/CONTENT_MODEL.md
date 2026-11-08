# Samvidhan Unified Content Model Specification

> **Status:** Draft / Ready for Approval  
> **Target Release:** Phase 3 Content Architecture Unification  
> **Scope:** Canonical Lesson IDs, Complete Old-to-New ID Matrix, Curriculum Hierarchy (Units vs Chapters), Inline Quizzes, Dynamic Lesson XP, URL Redirects, Stable Unit Slugs, `quizScores` Remapping, and Zero-Data-Loss Migration.

---

## 1. Problem Statement & Historical Context

The codebase contains three distinct content models that evolved across previous prototypes:

1. **Curriculum Catalog** (`src/data/mock/curriculum.ts`): Courses $\rightarrow$ Chapters $\rightarrow$ Lessons with separate `quizzes: Quiz[]`. Lesson IDs use course prefixes like `cf-preamble`, `fr-equality`, `el-consumer`.
2. **Interactive Units** (`src/data/mock/learningUnits.ts`): Units with numeric IDs and slugs (`foundations-of-the-republic`), containing lessons with rich interactive cards and inline `quizQuestions`. IDs use semantic names like `preamble-we-the-people`, `basic-structure-limits`, `article-14-equality-safeguard`.
3. **Admin Content Seed** (`src/api/services/adminService.ts`): Administrative content inventory with IDs like `lesson-preamble-1`, `lesson-basic-structure-2`, `lesson-article-14-3`, and `draft-directive-principles-4`.

This document establishes the single canonical content model, resolves all collisions, and specifies zero-data-loss migrations.

---

## 2. Complete Old-to-New ID Mapping Matrix

Every entity in the current codebase is mapped below. Any item that exists in only one source model is explicitly flagged.

### A. Courses / Tracks

| Source Model | Old Course ID | Canonical Course / Track Slug | Title | Presence / Notes |
|---|---|---|---|---|
| `curriculum.ts` | `constitution-foundations` | `constitution-foundations` | Constitution Foundations | In catalog |
| `curriculum.ts` | `fundamental-rights` | `fundamental-rights` | Fundamental Rights | In catalog |
| `curriculum.ts` | `everyday-law` | `everyday-law` | Everyday Legal Knowledge | In catalog |
| `curriculum.ts` | `digital-privacy` | `digital-privacy` | Cybercrime and Digital Privacy | In catalog |

### B. Units & Chapters

| Source Model | Old Unit / Chapter ID | Canonical Unit Slug | Numeric Order (`unitId`) | Title | Presence / Notes |
|---|---|---|---|---|---|
| `learningUnits.ts` / `curriculum.ts` | `1` / `cf-1` | `foundations-of-the-republic` | 1 | Foundations of the Republic | In both models |
| `curriculum.ts` | `cf-2` | `institutions-of-the-state` | 2 | Institutions: Parliament & Courts | *Only in curriculum.ts* |
| `learningUnits.ts` / `curriculum.ts` | `2` / `fr-1` | `fundamental-rights-in-practice` | 3 | Fundamental Rights in Practice | In both models |
| `curriculum.ts` | `el-1` | `consumer-and-workplace-law` | 4 | Everyday Law: Markets & Work | *Only in curriculum.ts* |
| `curriculum.ts` | `el-2` | `campus-and-civic-life` | 5 | Everyday Law: Campus & Civic Life | *Only in curriculum.ts* |
| `curriculum.ts` | `dp-1` | `cybercrime-and-digital-privacy` | 6 | Cybercrime & Digital Privacy | *Only in curriculum.ts* |
| `adminService.ts` | `unitId: 3` | `directive-principles-and-policy` | 7 | Directive Principles of State Policy | *Only in admin seed* (`draft-directive-principles-4`) |

### C. Lessons

| Canonical Lesson ID | Title | Unit Slug | Declared `xp` | Old Curriculum ID | Old LearningUnits ID | Old Admin Seed ID | Presence Status |
|---|---|---|---|---|---|---|---|
| `preamble-we-the-people` | We, The People: The Source of Power | `foundations-of-the-republic` | 15 | `cf-preamble` | `preamble-we-the-people` | `lesson-preamble-1` | **In all 3 models** |
| `basic-structure-limits` | Basic Structure: Can Parliament Change Anything? | `foundations-of-the-republic` | 20 | *None* | `basic-structure-limits` | `lesson-basic-structure-2` | **In learningUnits & admin only** (*Flag: missing in curriculum.ts*) |
| `parts-schedules-map` | Parts, Schedules & Constitutional Map | `foundations-of-the-republic` | 15 | `cf-parts` | *None* | *None* | **In curriculum.ts only** |
| `parliament-union-executive` | Parliament & The Union Executive | `institutions-of-the-state` | 15 | `cf-parliament` | *None* | *None* | **In curriculum.ts only** |
| `judiciary-court-hierarchy` | Supreme Court, High Courts & Hierarchy | `institutions-of-the-state` | 15 | `cf-courts` | *None* | *None* | **In curriculum.ts only** |
| `fundamental-rights-framework` | Architecture of Part III Rights | `fundamental-rights-in-practice` | 15 | `fr-overview` | *None* | *None* | **In curriculum.ts only** |
| `article-14-equality` | Equality Before Law & Non-Arbitrariness | `fundamental-rights-in-practice` | 15 | `fr-equality` | `article-14-equality-safeguard` | `lesson-article-14-3` | **In all 3 models** (names reconciled) |
| `article-21-life-liberty` | Protection of Life & Personal Liberty | `fundamental-rights-in-practice` | 20 | `fr-liberty` | *None* | *None* | **In curriculum.ts only** |
| `consumer-protection-basics` | Consumer Protection & Unfair Practices | `consumer-and-workplace-law` | 15 | `el-consumer` | *None* | *None* | **In curriculum.ts only** |
| `workplace-rights-basics` | Workplace Safeguards & Fair Treatment | `consumer-and-workplace-law` | 15 | `el-work` | *None* | *None* | **In curriculum.ts only** |
| `campus-student-rights` | Campus Discipline & Student Safeguards | `campus-and-civic-life` | 15 | `el-student` | *None* | *None* | **In curriculum.ts only** |
| `filing-police-complaint-fir` | Police Encounters, Grievance & FIRs | `campus-and-civic-life` | 20 | `el-complaint` | *None* | *None* | **In curriculum.ts only** |
| `online-offences-cybercrime` | Cyber Harassment, Fraud & IT Act | `cybercrime-and-digital-privacy` | 15 | `dp-offences` | *None* | *None* | **In curriculum.ts only** |
| `digital-privacy-data-protection` | Personal Data Privacy & Consent | `cybercrime-and-digital-privacy` | 15 | `dp-privacy` | *None* | *None* | **In curriculum.ts only** |
| `directive-principles-policy` | Directive Principles & Uniform Civil Code | `directive-principles-and-policy` | 15 | *None* | *None* | `draft-directive-principles-4` | **In admin seed only** (*Flag: draft status*) |

### D. Quizzes

In the unified model, every quiz is canonically referenced by its associated lesson ID:

| Old Quiz ID (`curriculum.ts`) | Associated Canonical Lesson ID | Canonical Quiz ID | Question Source |
|---|---|---|---|
| `quiz-cf-preamble` | `preamble-we-the-people` | `quiz:preamble-we-the-people` | Merged inline questions |
| *None* | `basic-structure-limits` | `quiz:basic-structure-limits` | Inline questions from `learningUnits.ts` |
| `quiz-cf-parts` | `parts-schedules-map` | `quiz:parts-schedules-map` | From `curriculum.ts` questions |
| `quiz-cf-parliament` | `parliament-union-executive` | `quiz:parliament-union-executive` | From `curriculum.ts` questions |
| `quiz-cf-courts` | `judiciary-court-hierarchy` | `quiz:judiciary-court-hierarchy` | From `curriculum.ts` questions |
| `quiz-fr-overview` | `fundamental-rights-framework` | `quiz:fundamental-rights-framework` | From `curriculum.ts` questions |
| `quiz-fr-equality` | `article-14-equality` | `quiz:article-14-equality` | Merged inline questions |
| `quiz-fr-liberty` | `article-21-life-liberty` | `quiz:article-21-life-liberty` | From `curriculum.ts` questions |
| `quiz-el-consumer` | `consumer-protection-basics` | `quiz:consumer-protection-basics` | From `curriculum.ts` questions |
| `quiz-el-work` | `workplace-rights-basics` | `quiz:workplace-rights-basics` | From `curriculum.ts` questions |
| `quiz-el-student` | `campus-student-rights` | `quiz:campus-student-rights` | From `curriculum.ts` questions |
| `quiz-el-complaint` | `filing-police-complaint-fir` | `quiz:filing-police-complaint-fir` | From `curriculum.ts` questions |
| `quiz-dp-offences` | `online-offences-cybercrime` | `quiz:online-offences-cybercrime` | From `curriculum.ts` questions |
| `quiz-dp-privacy` | `digital-privacy-data-protection` | `quiz:digital-privacy-data-protection` | From `curriculum.ts` questions |

---

## 3. Hierarchy & Stable Slug Keys for Units

Units are the primary organizational container for both the Duolingo-style winding path (`LearningPath`) and sidebar navigation.

### Dual Key Representation
Every unit defines both a numeric display order (`order` / `id: number`) and a stable kebab-case `slug`:
```ts
export interface CanonicalUnit {
  id: number // Numeric sequence for visual badges (e.g. 1 for "Unit 1")
  slug: string // Stable URL & API key, e.g. "foundations-of-the-republic"
  kicker: string // "UNIT 1"
  title: string // "Foundations of the Republic"
  description: string
  courseSlug: string // Foreign key to Course / Track
  lessons: CanonicalLesson[]
}
```

### URL Navigation Stability
Routes and helper functions (`getUnit`, `lessonsForUnit`) accept **both** the numeric string and the slug:
- `/learn/unit/1` $\rightarrow$ resolves Unit 1
- `/learn/unit/foundations-of-the-republic` $\rightarrow$ resolves Unit 1
- If reordered in the future, the stable `slug` remains permanent in bookmarks and URLs.

---

## 4. Per-Lesson XP & Quiz Bonus Computation

### A. Dynamic Lesson XP (No Hardcoded 15 XP)
1. Each lesson in the canonical catalog declares its own `xp` property based on depth and complexity:
   - Standard lesson: `xp: 15` (e.g. `preamble-we-the-people`, `article-14-equality`)
   - Advanced / Landmark case study lesson: `xp: 20` (e.g. `basic-structure-limits`, `article-21-life-liberty`, `filing-police-complaint-fir`)
2. **Server-Authoritative Award:**  
   When the client calls `POST /api/progress/complete-lesson`:
   - In Live Mode (`VITE_USE_MOCKS=false`), the server inspects the lesson record from the database, retrieves `lesson.xp`, and awards that exact amount.
   - In Mock Mode (`VITE_USE_MOCKS=true`), `progressService.ts` looks up `getLesson(payload.lessonId)?.xp ?? 15` and awards it dynamically instead of hardcoding 15.
   - If a lesson was already completed previously by this user, the server/service awards `earnedXp: 0` and does not duplicate XP.

### B. Quiz Bonus XP Formula
When the client calls `POST /api/progress/submit-quiz`:
1. **First Attempt Scoring:**
   - Mastery ($\text{Score} \ge 80\%$): Awards **25 XP** bonus.
   - Participation ($\text{Score} < 80\%$): Awards **15 XP** bonus.
2. **Retake & Upgrade Policy:**
   - If previous score was $< 80\%$ (15 XP awarded) and new score is $\ge 80\%$, the server awards the delta: $+10\text{ XP}$ ($25 - 15$).
   - If previous score was already $\ge 80\%$, subsequent retakes award `0 XP` bonus to prevent infinite XP farming.
   - The stored score in `quizScores[lessonId]` is always updated to `Math.max(previousScore, newScore)`.

---

## 5. Client-Side URL Redirects

To prevent broken links from external shares, browser history, or bookmarks, client-side route redirects will be registered in `App.tsx` / `LearnPages.tsx`:

### Redirect Rules

| Incoming Request URL | Redirect Target URL | HTTP / Navigation Type |
|---|---|---|
| `/learn/:courseId/cf-preamble` | `/learn/:courseId/preamble-we-the-people` | 301 / `Navigate replace` |
| `/learn/:courseId/cf-parts` | `/learn/:courseId/parts-schedules-map` | 301 / `Navigate replace` |
| `/learn/:courseId/cf-parliament` | `/learn/:courseId/parliament-union-executive` | 301 / `Navigate replace` |
| `/learn/:courseId/cf-courts` | `/learn/:courseId/judiciary-court-hierarchy` | 301 / `Navigate replace` |
| `/learn/:courseId/fr-overview` | `/learn/:courseId/fundamental-rights-framework` | 301 / `Navigate replace` |
| `/learn/:courseId/fr-equality` | `/learn/:courseId/article-14-equality` | 301 / `Navigate replace` |
| `/learn/:courseId/article-14-equality-safeguard` | `/learn/:courseId/article-14-equality` | 301 / `Navigate replace` |
| `/learn/:courseId/fr-liberty` | `/learn/:courseId/article-21-life-liberty` | 301 / `Navigate replace` |
| `/learn/:courseId/el-consumer` | `/learn/:courseId/consumer-protection-basics` | 301 / `Navigate replace` |
| `/learn/:courseId/el-work` | `/learn/:courseId/workplace-rights-basics` | 301 / `Navigate replace` |
| `/learn/:courseId/el-student` | `/learn/:courseId/campus-student-rights` | 301 / `Navigate replace` |
| `/learn/:courseId/el-complaint` | `/learn/:courseId/filing-police-complaint-fir` | 301 / `Navigate replace` |
| `/learn/:courseId/dp-offences` | `/learn/:courseId/online-offences-cybercrime` | 301 / `Navigate replace` |
| `/learn/:courseId/dp-privacy` | `/learn/:courseId/digital-privacy-data-protection` | 301 / `Navigate replace` |
| `/quiz/quiz-:legacyId` | `/quiz/:canonicalLessonId` | 301 / `Navigate replace` |
| `/quiz/:legacyId` | `/quiz/:canonicalLessonId` | 301 / `Navigate replace` |
| `/quiz/:legacyId/results` | `/quiz/:canonicalLessonId/results` | 301 / `Navigate replace` |

---

## 6. Zero-Data-Loss Migration & `quizScores` Key Remapping

### Master Alias Lookup Dictionary
```ts
export const CANONICAL_LESSON_ALIAS_MAP: Record<string, string> = {
  // Curriculum Catalog IDs
  'cf-preamble': 'preamble-we-the-people',
  'cf-parts': 'parts-schedules-map',
  'cf-parliament': 'parliament-union-executive',
  'cf-courts': 'judiciary-court-hierarchy',
  'fr-overview': 'fundamental-rights-framework',
  'fr-equality': 'article-14-equality',
  'article-14-equality-safeguard': 'article-14-equality',
  'fr-liberty': 'article-21-life-liberty',
  'el-consumer': 'consumer-protection-basics',
  'el-work': 'workplace-rights-basics',
  'el-student': 'campus-student-rights',
  'el-complaint': 'filing-police-complaint-fir',
  'dp-offences': 'online-offences-cybercrime',
  'dp-privacy': 'digital-privacy-data-protection',

  // Admin Scheme IDs
  'lesson-preamble-1': 'preamble-we-the-people',
  'lesson-basic-structure-2': 'basic-structure-limits',
  'lesson-article-14-3': 'article-14-equality',
  'draft-directive-principles-4': 'directive-principles-policy',
}
```

### Remapping `quizScores`
Old storage saved quiz scores under arbitrary prefixes like `"quiz-cf-preamble"`, `"cf-preamble"`, or `"quiz-fr-equality"`.
The migration normalizes all quiz score keys directly to the **canonical lesson ID**:
```ts
export function normalizeQuizKey(rawKey: string): string {
  // Strip 'quiz:' or 'quiz-' prefix if present
  const stripped = rawKey.replace(/^quiz[:-]/, '')
  return CANONICAL_LESSON_ALIAS_MAP[stripped] || stripped
}
```

### Complete Migration Algorithm
```ts
export function migrateProgressState(rawProgress: ProgressState): ProgressState {
  if (!rawProgress) return rawProgress

  const remap = (id: string): string => CANONICAL_LESSON_ALIAS_MAP[id] || id

  // 1. Remap and deduplicate completed lessons
  const completedLessonIds = Array.from(
    new Set((rawProgress.completedLessonIds || []).map(remap))
  )

  // 2. Remap and deduplicate bookmarks
  const bookmarks = Array.from(
    new Set((rawProgress.bookmarks || []).map(remap))
  )

  // 3. Remap and deduplicate saved lessons
  const savedLessonIds = Array.from(
    new Set((rawProgress.savedLessonIds || []).map(remap))
  )

  // 4. Remap quizScores, preserving the highest score if duplicate keys collide
  const quizScores: Record<string, number> = {}
  Object.entries(rawProgress.quizScores || {}).forEach(([key, score]) => {
    const canonicalKey = normalizeQuizKey(key)
    quizScores[canonicalKey] = Math.max(score, quizScores[canonicalKey] || 0)
  })

  // 5. Update history items hrefs
  const history = (rawProgress.history || []).map((item) => {
    let nextHref = item.href
    Object.entries(CANONICAL_LESSON_ALIAS_MAP).forEach(([oldId, newId]) => {
      if (nextHref.includes(oldId)) {
        nextHref = nextHref.replace(oldId, newId)
      }
    })
    return { ...item, href: nextHref }
  })

  return {
    ...rawProgress,
    completedLessonIds,
    bookmarks,
    savedLessonIds,
    quizScores,
    history,
  }
}
```

### Invariants & Guarantees
- **Idempotency:** Running `migrateProgressState` on already-migrated state produces identical output.
- **Empty State Safety:** Works identically with `{}` or default state.
- **No Demotions:** `Math.max` ensures no user's quiz score drops if they took both legacy and modern variants.
- **Executed on Mount:** Runs in `AppStateContext.tsx` on load and automatically writes back the clean canonical state to `localStorage`.

---

## 7. AI Quota Representation: `null` & `unlimited: true`

In both `API_CONTRACT.md` and TypeScript definitions, the Sentinel value `9999` is deprecated in favor of explicit typed unlimited representation:

```ts
// User Subscription Quota Schema
export interface SubscriptionPlanQuota {
  tier: 'free' | 'pro' | 'patron'
  dailyAiLimit: number | null // null indicates unlimited quota
  isUnlimited: boolean        // true for pro and patron
  usedToday: number
  resetsAt: string            // ISO 8601 UTC timestamp
}
```

- Free tier: `dailyAiLimit: 5`, `isUnlimited: false`
- Pro tier: `dailyAiLimit: null`, `isUnlimited: true`
- Patron tier: `dailyAiLimit: null`, `isUnlimited: true`
