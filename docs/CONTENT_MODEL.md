# Samvidhan Unified Content Model Specification

> **Status:** Draft / Pending Review  
> **Target Release:** Phase 3 Content Architecture Unification  
> **Scope:** Canonical Lesson IDs, Curriculum Hierarchy (Units vs Chapters), Admin Content Sync, Inline Quizzes, Server XP Authority, and Zero-Data-Loss LocalStorage Migration.

---

## 1. Problem Statement & Historical Context

The codebase currently contains three separate, overlapping content ID styles and models that evolved across previous prototypes:

| Model / Source | Example Lesson ID | Hierarchy Container | Quiz Representation | Status / Usage |
|---|---|---|---|---|
| **Catalog / Courses** (`src/data/mock/curriculum.ts`) | `cf-preamble`, `fr-equality` | Course -> Chapters (`cf-1`) | Separate `quizzes: Quiz[]` via `quizId: 'quiz-cf-preamble'` | Used by legacy `catalog.ts`, course listing, library filters |
| **Interactive Units** (`src/data/mock/learningUnits.ts`) | `preamble-we-the-people`, `article-14-equality` | Units (`unitId: 1`, `slug: 'foundations-of-the-republic'`) | Rich inline interactive cards + `quizQuestions` array | Used by `LearningPath`, `LessonPlayer`, `QuizEngine` |
| **Admin Content** (`src/api/services/adminService.ts`) | `lesson-preamble-1`, `lesson-equality-1` | `unitId: 1`, `type: 'lesson'` | Abstracted `contentPreview` + `questionType` | Used by Admin Content Manager & Review Workflow |

Having three divergent ID schemes introduces:
- Redundant data lookups in `LearnPages.tsx` (looping through `unitsData` first, then falling back to `getLesson(catalogId)`).
- Risk of split progress in `localStorage` (a user bookmarking `cf-preamble` vs completing `preamble-we-the-people`).
- Disconnected admin review states that do not directly map to the learner-facing curriculum.

---

## 2. Canonical Lesson ID Specification

All lessons across the application will use a **single, canonical, semantic kebab-case ID**.

### Format Rule
`[topic-slug]-[specific-focus]` (lowercase, alphanumeric with hyphens, 3–40 characters).

### Canonical Lesson Registry & Legacy Aliases

| Canonical Lesson ID | Course / Track | Unit ID | Legacy Catalog ID | Legacy Admin ID | Title |
|---|---|---|---|---|---|
| `preamble-we-the-people` | `constitution-foundations` | 1 | `cf-preamble` | `lesson-preamble-1` | We, The People: The Source of Power |
| `parts-schedules-map` | `constitution-foundations` | 1 | `cf-parts` | `lesson-parts-1` | Parts, Schedules & Constitutional Map |
| `parliament-union-executive` | `constitution-foundations` | 1 | `cf-parliament` | `lesson-parliament-1` | Parliament & The Union Executive |
| `judiciary-court-hierarchy` | `constitution-foundations` | 1 | `cf-courts` | `lesson-judiciary-1` | Supreme Court, High Courts & Hierarchy |
| `fundamental-rights-framework` | `fundamental-rights` | 2 | `fr-overview` | `lesson-fr-overview` | Architecture of Part III Rights |
| `article-14-equality` | `fundamental-rights` | 2 | `fr-equality` | `lesson-equality-1` | Equality Before Law & Non-Arbitrariness |
| `article-21-life-liberty` | `fundamental-rights` | 2 | `fr-liberty` | `lesson-liberty-1` | Protection of Life & Personal Liberty |
| `consumer-protection-basics` | `everyday-law` | 3 | `el-consumer` | `lesson-consumer-1` | Consumer Protection & Unfair Practices |
| `workplace-rights-basics` | `everyday-law` | 3 | `el-work` | `lesson-workplace-1` | Workplace Safeguards & Fair Treatment |
| `campus-student-rights` | `everyday-law` | 3 | `el-student` | `lesson-student-1` | Campus Discipline & Student Safeguards |
| `filing-police-complaint-fir` | `everyday-law` | 3 | `el-complaint` | `lesson-fir-1` | Police Encounters, Grievance & FIRs |
| `online-offences-cybercrime` | `digital-privacy` | 4 | `dp-offences` | `lesson-cyber-1` | Cyber Harassment, Fraud & IT Act |
| `digital-privacy-data-protection` | `digital-privacy` | 4 | `dp-privacy` | `lesson-privacy-1` | Personal Data Privacy & Consent |

---

## 3. Hierarchy Reconciliation: Tracks, Units & Chapters

We reconcile the terminology into a clean 3-level educational hierarchy:

```
[Track / Course] (e.g. "Constitution Foundations", "Everyday Legal Knowledge")
   └── [Unit] (e.g. Unit 1: "Foundations of the Republic", Unit 2: "Fundamental Rights")
          └── [Lesson] (e.g. "preamble-we-the-people")
                 ├── Interactive Cards (Theory, Citizen Scenario, Law, Action, Raizada Did-You-Know)
                 └── Inline Quiz Engine (Multiple Choice, Match Pairs, Step Order, Spot Violation)
```

1. **Top Container: `Track` (or `Course`)**  
   Represents the thematic legal discipline (e.g. Constitution, Everyday Law, Digital Law).
2. **Intermediate Container: `Unit` (Canonical)**  
   The primary visual and progress milestone unit on the Duolingo-style winding path and learning sidebar. Each unit carries a numeric `unitId`, title, description, and list of canonical lessons.  
   *Chapter alias:* Legacy references to `chapterId` (e.g. `cf-1`, `cf-2`) map directly to `unitId` as a sub-grouping property (`unit.chapter = 1`), preserving compatibility with existing course catalog headers without fragmenting navigation.
3. **Leaf Node: `Lesson`**  
   The interactive learning unit identified by its canonical ID.

---

## 4. Admin Content ID Scheme Reconciliation

In the Admin Content Manager, review workflow, and audit logs:
- `AdminContentItem.id` will match the **canonical lesson ID** directly (e.g. `id: 'preamble-we-the-people'`).
- For quiz questions managed individually by reviewers, question IDs follow `[canonical-lesson-id]-q[number]` (e.g. `preamble-we-the-people-q1`).
- The admin backend SQL table will store `content_id VARCHAR(64) PRIMARY KEY` matching the canonical ID.
- Legacy admin IDs (`lesson-preamble-1`, `lesson-equality-1`) are resolved through an alias dictionary when reading legacy audit records or mistake reports.

---

## 5. Quiz Representation: Inline on Lessons

### Decision: Inline Questions on the Lesson Payload
Rather than maintaining detached `Quiz` objects in a separate array requiring cross-table joins and secondary routes:
1. Every lesson payload contains its optional `quizQuestions: QuizQuestion[]` directly.
2. The quiz questions support all four rich question types:
   - `multiple_choice`
   - `match_pairs`
   - `order_steps`
   - `spot_violation`
3. Standalone quiz routes (`/quiz/:quizId`) resolve by matching `quizId` to `canonicalLessonId` (or `quiz-[canonicalLessonId]`).
4. Result: Zero out-of-sync questions, atomic lesson reviews in admin, and instantaneous client-side question caching.

---

## 6. XP System & Server Authority

### Baseline Values
- **Lesson Completion:** 15 XP standard completion bonus.
- **Quiz Mastery:** 25 XP for score $\ge 80\%$, 15 XP for score $< 80\%$.
- **Constitutional Chests:** 20–25 XP.

### Authority Modes
- **Live Mode (`VITE_USE_MOCKS=false`):**  
  The client submits `POST /api/progress/complete-lesson` or `POST /api/progress/submit-quiz` with an `Idempotency-Key` UUID. The server calculates and returns the official updated total XP, streak, and unlocked badges. The client immediately renders the server response.
- **Mock Mode (`VITE_USE_MOCKS=true`):**  
  The client executes local optimistic calculation using the lesson's declared `xp` value, persisting to local storage.

---

## 7. Migration Adapter (Zero-Data-Loss)

### Storage Keys to Migrate in `localStorage['progress']`
1. `completedLessonIds`: `string[]`
2. `bookmarks`: `string[]`
3. `savedLessonIds`: `string[]`
4. `quizScores`: `Record<string, number>`

### Bidirectional Legacy Alias Map
```ts
export const LEGACY_LESSON_ID_MAP: Record<string, string> = {
  // Curriculum Catalog IDs -> Canonical IDs
  'cf-preamble': 'preamble-we-the-people',
  'cf-parts': 'parts-schedules-map',
  'cf-parliament': 'parliament-union-executive',
  'cf-courts': 'judiciary-court-hierarchy',
  'fr-overview': 'fundamental-rights-framework',
  'fr-equality': 'article-14-equality',
  'fr-liberty': 'article-21-life-liberty',
  'el-consumer': 'consumer-protection-basics',
  'el-work': 'workplace-rights-basics',
  'el-student': 'campus-student-rights',
  'el-complaint': 'filing-police-complaint-fir',
  'dp-offences': 'online-offences-cybercrime',
  'dp-privacy': 'digital-privacy-data-protection',

  // Admin Scheme IDs -> Canonical IDs
  'lesson-preamble-1': 'preamble-we-the-people',
  'lesson-parts-1': 'parts-schedules-map',
  'lesson-parliament-1': 'parliament-union-executive',
  'lesson-judiciary-1': 'judiciary-court-hierarchy',
  'lesson-fr-overview': 'fundamental-rights-framework',
  'lesson-equality-1': 'article-14-equality',
  'lesson-liberty-1': 'article-21-life-liberty',
  'lesson-consumer-1': 'consumer-protection-basics',
  'lesson-workplace-1': 'workplace-rights-basics',
  'lesson-student-1': 'campus-student-rights',
  'lesson-fir-1': 'filing-police-complaint-fir',
  'lesson-cyber-1': 'online-offences-cybercrime',
  'lesson-privacy-1': 'digital-privacy-data-protection',
}
```

### Migration Implementation Strategy
```ts
export function migrateProgressState(progress: ProgressState): ProgressState {
  const remapId = (id: string): string => LEGACY_LESSON_ID_MAP[id] || id

  const completed = Array.from(new Set((progress.completedLessonIds || []).map(remapId)))
  const bookmarks = Array.from(new Set((progress.bookmarks || []).map(remapId)))
  const saved = Array.from(new Set((progress.savedLessonIds || []).map(remapId)))

  const quizScores: Record<string, number> = {}
  Object.entries(progress.quizScores || {}).forEach(([key, score]) => {
    const canonicalKey = remapId(key.replace(/^quiz-/, ''))
    quizScores[canonicalKey] = Math.max(score, quizScores[canonicalKey] || 0)
  })

  return {
    ...progress,
    completedLessonIds: completed,
    bookmarks,
    savedLessonIds: saved,
    quizScores,
  }
}
```

- Runs automatically during `AppStateContext` mount and during `safeValidate(progressStateSchema, ...)` parsing.
- Idempotent: Can be run multiple times safely without altering already-canonical state.
- Deduplicating: `Set` prevents duplicates if a user had both legacy and canonical entries.

---

## 8. Verification Plan & Safety Guarantees
1. Unit tests covering:
   - Full migration of legacy `cf-preamble` / `lesson-preamble-1` into `preamble-we-the-people`.
   - Score preservation in `quizScores`.
   - Backward lookup when navigating to `/learn/constitution-foundations/cf-preamble` automatically resolving or redirecting cleanly.
2. Zero visual layout or CSS animation modifications.
3. Updating `docs/API_CONTRACT.md` and `ADMIN_BACKEND_SETUP.md` with the unified schema.
