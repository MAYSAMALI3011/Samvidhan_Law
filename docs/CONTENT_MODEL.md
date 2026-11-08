# Samvidhan Unified Content Model Specification

> **Status:** Draft / Updated per User Feedback — Pending Review  
> **Target Release:** Phase 3 Content Architecture Unification  
> **Scope:** Canonical Lesson IDs, Complete Old-to-New ID Matrix, Gaps & Fallbacks, Provisional Unit Slugs, Identity Rules, Current XP & Score Invariants, Client-Side Redirects, Anonymous Local Progress Import, and Click-Through Verification List.

---

## 1. Characterization Test Proof & Real Code Execution

As mandated, all characterization tests call the **real production code** without duplicates or mocks:

1. **Pure Quiz Scoring Extraction (`src/components/learning/quizScoring.ts`)**:
   - The question evaluation logic was extracted from `QuizEngine.tsx` into a pure function `evaluateQuizAnswer(question: QuizQuestion, answer: unknown): boolean`.
   - `QuizEngine.tsx` imports and uses `evaluateQuizAnswer` directly in its scoring handlers.
   - `src/tests/contentCharacterization.test.ts` imports and exercises `evaluateQuizAnswer` directly across all 6 question types (`multiple_choice`, `true_false`, `match_pairs`, `order_steps`, `fill_blank`, `spot_violation`).
2. **Catalog & Progress Real Services**:
   - Tests directly import `getCourse`, `getLesson`, `lessonsForCourse`, `neighbours`, `continueLesson`, and `searchAll` from `src/api/services/catalogService.ts` and `src/data/mock/catalog.ts`.
   - Tests directly import `completeLessonEvent` and `submitQuizEvent` from `src/api/services/progressService.ts`.
   - Tests directly import `toggleBookmarkApi` and `toggleSavedApi` from `src/api/services/bookmarksService.ts`.
   - No mock duplicates exist in the test suite. All 40 unit and characterization tests run and pass via Node's native runner (`node --experimental-strip-types --test src/tests/*.test.ts`).

---

## 2. Canonical Identity Rules & Hierarchy

### Canonical Identity vs Display Order
- **Slug is the sole canonical identity** for lessons and units across URLs, database records, and API payloads (e.g. `preamble-we-the-people`, `foundations-of-the-republic`).
- **Numeric unit ID (`order: number`) is display order only**. It is used purely for UI sorting and visual badges ("Unit 1", "Unit 2").
- **No interchangeable resolution:** Services and routes do NOT resolve numeric IDs and slugs interchangeably. Lookups by unit query the canonical slug. Legacy numeric IDs (e.g. `/learn/unit/1`) live strictly in the client-side redirect and migration map.

### Canonical Unit Schema
```ts
export interface CanonicalUnit {
  slug: string         // Sole canonical identifier (e.g. "foundations-of-the-republic")
  order: number        // Pure display sequence (1, 2, 3...)
  kicker: string       // "UNIT 1"
  title: string        // "Foundations of the Republic"
  description: string
  courseSlug: string   // Parent Track slug ("constitution-foundations")
  lessons: CanonicalLesson[]
}
```

---

## 3. Provisional Unit Slugs Table (For User Review)

> [!IMPORTANT]
> The slugs below are **provisional** and presented for your explicit review and approval. **No URLs or routes will be created from these slugs until you confirm.**

| Numeric Order (`order`) | Provisional Unit Slug | Unit Title | Parent Course Track | Status |
|---|---|---|---|---|
| 1 | `foundations-of-the-republic` | Foundations of the Republic | `constitution-foundations` | Provisional — Pending Approval |
| 2 | `institutions-of-the-state` | Institutions: Parliament & Courts | `constitution-foundations` | Provisional — Pending Approval |
| 3 | `fundamental-rights-in-practice` | Fundamental Rights in Practice | `fundamental-rights` | Provisional — Pending Approval |
| 4 | `consumer-and-workplace-law` | Everyday Law: Markets & Work | `everyday-law` | Provisional — Pending Approval |
| 5 | `campus-and-civic-life` | Everyday Law: Campus & Civic Life | `everyday-law` | Provisional — Pending Approval |
| 6 | `cybercrime-and-digital-privacy` | Cybercrime & Digital Privacy | `digital-privacy` | Provisional — Pending Approval |
| 7 | `directive-principles-and-policy` | Directive Principles of State Policy | `constitution-foundations` | Provisional — Pending Approval (Draft Seed) |

---

## 4. Complete Old-to-New ID Mapping Matrix

Every entity in the current codebase is mapped below, with legacy sources and flags:

### A. Courses / Tracks

| Source Model | Old Course ID | Canonical Course Slug | Title | Presence / Notes |
|---|---|---|---|---|
| `curriculum.ts` | `constitution-foundations` | `constitution-foundations` | Constitution Foundations | In catalog |
| `curriculum.ts` | `fundamental-rights` | `fundamental-rights` | Fundamental Rights | In catalog |
| `curriculum.ts` | `everyday-law` | `everyday-law` | Everyday Legal Knowledge | In catalog |
| `curriculum.ts` | `digital-privacy` | `digital-privacy` | Cybercrime and Digital Privacy | In catalog |

### B. Lessons

| Canonical Lesson Slug (ID) | Title | Unit Slug | Declared `xp` | Old Curriculum ID | Old LearningUnits ID | Old Admin Seed ID | Presence Status |
|---|---|---|---|---|---|---|---|
| `preamble-we-the-people` | We, The People: The Source of Power | `foundations-of-the-republic` | 15 | `cf-preamble` | `preamble-we-the-people` | `lesson-preamble-1` | **In all 3 models** |
| `basic-structure-limits` | Basic Structure: Can Parliament Change Anything? | `foundations-of-the-republic` | 15 | *None* | `basic-structure-limits` | `lesson-basic-structure-2` | **In learningUnits & admin only** (*Flag: missing in curriculum.ts*) |
| `parts-schedules-map` | Parts, Schedules & Constitutional Map | `foundations-of-the-republic` | 15 | `cf-parts` | *None* | *None* | **In curriculum.ts only** |
| `parliament-union-executive` | Parliament & The Union Executive | `institutions-of-the-state` | 15 | `cf-parliament` | *None* | *None* | **In curriculum.ts only** |
| `judiciary-court-hierarchy` | Supreme Court, High Courts & Hierarchy | `institutions-of-the-state` | 15 | `cf-courts` | *None* | *None* | **In curriculum.ts only** |
| `fundamental-rights-framework` | Architecture of Part III Rights | `fundamental-rights-in-practice` | 15 | `fr-overview` | *None* | *None* | **In curriculum.ts only** |
| `article-14-equality` | Equality Before Law & Non-Arbitrariness | `fundamental-rights-in-practice` | 15 | `fr-equality` | `article-14-equality-safeguard` | `lesson-article-14-3` | **In all 3 models** (names reconciled) |
| `article-21-life-liberty` | Protection of Life & Personal Liberty | `fundamental-rights-in-practice` | 15 | `fr-liberty` | *None* | *None* | **In curriculum.ts only** |
| `consumer-protection-basics` | Consumer Protection & Unfair Practices | `consumer-and-workplace-law` | 15 | `el-consumer` | *None* | *None* | **In curriculum.ts only** |
| `workplace-rights-basics` | Workplace Safeguards & Fair Treatment | `consumer-and-workplace-law` | 15 | `el-work` | *None* | *None* | **In curriculum.ts only** |
| `campus-student-rights` | Campus Discipline & Student Safeguards | `campus-and-civic-life` | 15 | `el-student` | *None* | *None* | **In curriculum.ts only** |
| `filing-police-complaint-fir` | Police Encounters, Grievance & FIRs | `campus-and-civic-life` | 15 | `el-complaint` | *None* | *None* | **In curriculum.ts only** |
| `online-offences-cybercrime` | Cyber Harassment, Fraud & IT Act | `cybercrime-and-digital-privacy` | 15 | `dp-offences` | *None* | *None* | **In curriculum.ts only** |
| `digital-privacy-data-protection` | Personal Data Privacy & Consent | `cybercrime-and-digital-privacy` | 15 | `dp-privacy` | *None* | *None* | **In curriculum.ts only** |
| `directive-principles-policy` | Directive Principles & Uniform Civil Code | `directive-principles-and-policy` | 15 | *None* | *None* | `draft-directive-principles-4` | **In admin seed only** (*Flag: draft status*) |

### C. Quizzes

Every quiz is canonically identified by its associated lesson slug:

| Old Quiz ID (`curriculum.ts`) | Canonical Lesson Slug | Canonical Quiz ID | Question Source |
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

## 5. Gaps & Rendering Fallbacks

Because some lessons historically existed in only one model, their content shapes differ. The lesson reader component handles these gaps gracefully without missing UI sections:

### 1. Lessons Existing Only in `learningUnits.ts` (`basic-structure-limits`)
- **Missing Fields:** Top-level `content: string[]`, `example?: { scenario, application }`, and `takeaways?: string[]`.
- **Reader Fallback Behavior:**
  - The reader checks if `lesson.cards` exists.
  - When `cards` are present and `content` is absent, the reader renders the interactive card stack (Summary card, Deep Dive card, Citizen Scenario card) as the primary reader view.
  - The citizen scenario card automatically populates the Practical Example callout.
  - Key Takeaways are derived from the card summaries so the bottom summary section is never empty.

### 2. Lessons Existing Only in `curriculum.ts` (12 lessons, e.g. `parts-schedules-map`, `parliament-union-executive`)
- **Missing Fields:** Interactive `cards?: LearningCard[]`.
- **Reader Fallback Behavior:**
  - The reader renders the structured article content: `content: string[]` paragraphs, the dedicated `example` scenario box, and bulleted `takeaways`.
  - If a card-based view mode is selected, each paragraph in `content` is adapted on the fly as a sequential reading slide.

### 3. Draft Admin Seed Lessons (`directive-principles-policy`)
- Marked with `status: 'draft'`.
- Not visible in public course listings; visible only in Admin Content Manager.

### 4. Attribute Defaults
- **Missing `xp`:** Defaults to `15` XP.
- **Missing `articleCitation`:** Defaults to `""` (empty string).
  - *Admin Guard:* The admin publish validation check (`validateLessonPublishable` in `adminService.ts` / `AdminContentManager.tsx`) strictly blocks publishing any lesson if `articleCitation.length < 6` ("Statutory or constitutional citation required"). Draft items without citations remain drafts.

---

## 6. XP & Quiz Scoring Invariants (Current Behavior Preserved)

As requested, all invented XP rules (such as `+10/0` retakes and arbitrary `20 XP` values) have been **removed**. The unified model adheres strictly to the codebase's existing behavior:

### A. Current Lesson XP Invariant
- **Behavior:** Lesson completion awards declared `lesson.xp` if present; if not declared, it awards `15` XP.
- In mock mode (`progressService.ts`):
  ```ts
  const declaredXp = catalogLesson?.xp ?? 15
  nextXp = (current.xp || 0) + declaredXp
  ```
- Re-completion on the current codebase awards `0` additional XP if the lesson is already in `completedLessonIds`.

### B. Current Quiz Bonus Invariant
- **Behavior:** On **every attempt**:
  - Score $\ge 80\%$: Awards **25 XP**.
  - Score $< 80\%$: Awards **15 XP**.
- In mock mode (`progressService.ts`):
  ```ts
  const bonusXp = payload.score >= 80 ? 25 : 15
  nextXp = (current.xp || 0) + bonusXp
  ```

### C. Current Score Retention: Latest-Score vs Best-Score
- **Current Behavior in Code:** **LATEST-SCORE**.
  In `progressService.ts` line 124:
  ```ts
  quizScores: {
    ...(current.quizScores || {}),
    [payload.quizId]: payload.score, // Overwrites with latest score unconditionally
  }
  ```
  If a user scores 100%, retakes the quiz, and gets 40%, the stored score becomes 40%.

### D. Proposed Change for Your Approval: Best-Score Retention
> [!NOTE] Proposal for User Approval
> In a gamified learning platform, users generally expect retakes to preserve their **personal best**.
> **Proposed policy:** Change `quizScores` storage to:
> ```ts
> const existingScore = current.quizScores?.[payload.quizId] ?? 0
> quizScores: {
>   ...(current.quizScores || {}),
>   [payload.quizId]: Math.max(existingScore, payload.score),
> }
> ```
> *This will only be enabled if you explicitly approve it. Otherwise, current latest-score behavior will be maintained.*

---

## 7. Client-Side Redirects & Hosting Strategy

### Client-Side Navigation
Client-side `<Navigate replace>` routes in `App.tsx` and `LearnPages.tsx` intercept legacy URLs and seamlessly redirect to the canonical path:

| Incoming Request URL | Canonical Redirect Destination |
|---|---|
| `/learn/:courseId/cf-preamble` | `/learn/:courseId/preamble-we-the-people` |
| `/learn/:courseId/cf-parts` | `/learn/:courseId/parts-schedules-map` |
| `/learn/:courseId/cf-parliament` | `/learn/:courseId/parliament-union-executive` |
| `/learn/:courseId/cf-courts` | `/learn/:courseId/judiciary-court-hierarchy` |
| `/learn/:courseId/fr-overview` | `/learn/:courseId/fundamental-rights-framework` |
| `/learn/:courseId/fr-equality` | `/learn/:courseId/article-14-equality` |
| `/learn/:courseId/article-14-equality-safeguard` | `/learn/:courseId/article-14-equality` |
| `/learn/:courseId/fr-liberty` | `/learn/:courseId/article-21-life-liberty` |
| `/learn/:courseId/el-consumer` | `/learn/:courseId/consumer-protection-basics` |
| `/learn/:courseId/el-work` | `/learn/:courseId/workplace-rights-basics` |
| `/learn/:courseId/el-student` | `/learn/:courseId/campus-student-rights` |
| `/learn/:courseId/el-complaint` | `/learn/:courseId/filing-police-complaint-fir` |
| `/learn/:courseId/dp-offences` | `/learn/:courseId/online-offences-cybercrime` |
| `/learn/:courseId/dp-privacy` | `/learn/:courseId/digital-privacy-data-protection` |
| `/quiz/quiz-:legacyId` | `/quiz/:canonicalLessonId` |
| `/quiz/:legacyId` | `/quiz/:canonicalLessonId` |
| `/quiz/:legacyId/results` | `/quiz/:canonicalLessonId/results` |

### Hosting Layer Note (Phase 6)
Client-side redirects ensure SPA navigation and direct bookmarks work immediately. In **Phase 6: Hosting & Production Hardening**, permanent HTTP 301 redirect rules will be written to the edge host configuration (`_redirects` for Netlify/Cloudflare Pages or `vercel.json` rewrites) to preserve search engine indexing and eliminate extra roundtrips.

---

## 8. Anonymous Local Progress Import to Server

When an anonymous user studies before signing in, their progress resides in `localStorage`. Upon first authentication (registration or login), the client performs an idempotent one-time sync to the server:

### Endpoint: `POST /api/progress/import-local`
- **Authentication:** Required (`Bearer` token or session cookie).
- **Header:** `Idempotency-Key: <uuid>`.
- **Request Body:**
  ```json
  {
    "completedLessonIds": ["preamble-we-the-people", "article-14-equality"],
    "quizScores": {
      "preamble-we-the-people": 100,
      "article-14-equality": 80
    },
    "bookmarks": ["preamble-we-the-people"],
    "savedLessonIds": [],
    "history": [
      {
        "lessonId": "preamble-we-the-people",
        "title": "We, The People",
        "href": "/learn/constitution-foundations/preamble-we-the-people",
        "timestamp": "2026-11-08T10:00:00Z"
      }
    ],
    "xp": 30
  }
  ```
- **Server Merge Policy:**
  - `completedLessonIds`: Set union of server set $\cup$ client set (never revokes completed lessons).
  - `bookmarks` / `savedLessonIds`: Set union.
  - `quizScores`: For each key, retain $\max(\text{serverScore}, \text{clientScore})$.
  - `xp`: Server re-verifies completed lessons and quiz scores, computing authoritative total XP to prevent forged client totals.
- **Client Follow-Up:**
  On HTTP 200/201 response, client sets `hasSyncedLocalProgress: true` in storage and discards the unauthenticated local copy in favor of the server response.

---

## 9. Migration & Key Remapping Algorithm

The master remapping table normalizes old keys from all sources:

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

### Migration Function
```ts
export function normalizeQuizKey(rawKey: string): string {
  const stripped = rawKey.replace(/^quiz[:-]/, '')
  return CANONICAL_LESSON_ALIAS_MAP[stripped] || stripped
}

export function migrateProgressState(rawProgress: ProgressState): ProgressState {
  if (!rawProgress) return rawProgress

  const remap = (id: string): string => CANONICAL_LESSON_ALIAS_MAP[id] || id

  const completedLessonIds = Array.from(
    new Set((rawProgress.completedLessonIds || []).map(remap))
  )
  const bookmarks = Array.from(
    new Set((rawProgress.bookmarks || []).map(remap))
  )
  const savedLessonIds = Array.from(
    new Set((rawProgress.savedLessonIds || []).map(remap))
  )

  const quizScores: Record<string, number> = {}
  Object.entries(rawProgress.quizScores || {}).forEach(([key, score]) => {
    const canonicalKey = normalizeQuizKey(key)
    quizScores[canonicalKey] = Math.max(score, quizScores[canonicalKey] || 0)
  })

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

---

## 10. Click-Through Verification List

Once implemented, every merged path must be verified using this click-through checklist:

### A. Catalog & Navigation
- [ ] Visit `/learn` — verify all courses render with correct lesson counts.
- [ ] Click course **"Constitution Foundations"** (`/learn/constitution-foundations`) — verify lessons list shows canonical titles and XP badges.
- [ ] Verify unit kickers ("UNIT 1", "UNIT 2") and sequence order are intact.

### B. Legacy URL Redirects
- [ ] Navigate to `/learn/constitution-foundations/cf-preamble` — verify URL immediately replaces to `/learn/constitution-foundations/preamble-we-the-people` and renders lesson.
- [ ] Navigate to `/learn/fundamental-rights/fr-equality` — verify URL immediately replaces to `/learn/fundamental-rights/article-14-equality`.
- [ ] Navigate to `/quiz/quiz-cf-preamble` — verify URL replaces to `/quiz/preamble-we-the-people` and loads quiz.

### C. Lesson Reader Rendering (Both Models)
- [ ] **Dual-model lesson:** Open `/learn/constitution-foundations/preamble-we-the-people` — verify cards, practical example, takeaways, and "Take Quiz" CTA render cleanly.
- [ ] **Curriculum-only lesson:** Open `/learn/constitution-foundations/parts-schedules-map` — verify structured content paragraphs, scenario box, and key takeaways render cleanly without broken card components.
- [ ] **LearningUnits-only lesson:** Open `/learn/constitution-foundations/basic-structure-limits` — verify card stack renders seamlessly with summary, deep dive, and scenario.

### D. Quiz Engine Verification
- [ ] Start quiz at `/quiz/preamble-we-the-people` — complete all questions.
- [ ] Verify score screen displays score, XP awarded (+25 XP for $\ge 80\%$, +15 XP for $< 80\%$).
- [ ] Retake quiz at `/quiz/preamble-we-the-people` — verify latest score updates correctly.

### E. Bookmarks, Search & Dashboard
- [ ] On `/learn/constitution-foundations/preamble-we-the-people`, click Bookmark — verify icon fills.
- [ ] Navigate to `/bookmarks` — verify "We, The People" appears with valid canonical link.
- [ ] Navigate to `/search?q=equality` — verify search results point to `/learn/fundamental-rights/article-14-equality`.
- [ ] Navigate to `/dashboard` — verify "Continue Learning" points to the first uncompleted canonical lesson.

### F. Migration Verification
- [ ] Pre-populate `localStorage` with legacy keys:
  `{"completedLessonIds": ["cf-preamble", "fr-equality"], "quizScores": {"quiz-cf-preamble": 85}}`
- [ ] Reload the app — inspect `localStorage` and verify migrated state:
  `{"completedLessonIds": ["preamble-we-the-people", "article-14-equality"], "quizScores": {"preamble-we-the-people": 85}}`
