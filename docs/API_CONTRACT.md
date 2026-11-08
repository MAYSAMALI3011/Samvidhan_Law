# Samvidhan API Contract & Specification

> **Version:** 1.0.0  
> **Status:** Phase 2 Complete (Frontend-Backend Contract)  
> **Target Consumer:** Backend Engineering Team  
> **Security Baseline:** No credentials or tokens stored in `localStorage`. httpOnly secure cookies are the default session mechanism.

---

## 1. Global Architectural Standards

### 1.1 Base URL
All API requests are prefixed by the base URL configured via environment variables:
- **Local Dev / Staging:** `http://localhost:8000` (or `http://localhost:5000`)
- **Production:** Configured via `VITE_API_URL` (e.g. `https://api.samvidhan.in`)
- **Live Mode Toggle:** When `VITE_USE_MOCKS=false` or when `import.meta.env.PROD === true`. Production builds **force live API mode**; mocks cannot execute in production.

### 1.2 Authentication Strategies
1. **Primary (Recommended & Default):** `httpOnly` secure cookies with `SameSite=Lax` (or `None` with `Secure` for cross-domain APIs). The frontend issues all requests with `credentials: 'include'`.
2. **Configurable Fallback:** Bearer Token via HTTP header:
   ```http
   Authorization: Bearer <in_memory_jwt_token>
   ```
   *Note: If the Bearer strategy is selected, tokens reside exclusively in JavaScript memory and are never persisted to `localStorage` or `sessionStorage`.*

### 1.3 Standard Error Format
All failure responses (`4xx`, `5xx`) must return JSON matching this schema:
```json
{
  "success": false,
  "message": "Human-readable error description for the user",
  "errors": {
    "field": ["Validation issue description"]
  }
}
```

### 1.4 HTTP Status Codes
| Status | Meaning | Frontend Action |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Parses payload via Zod validator |
| `201 Created` | Resource created | Updates local TanStack Query cache |
| `204 No Content` | Action succeeded with no body | Returns success |
| `400 Bad Request` | Payload validation failure | Displays field error banner / message |
| `401 Unauthorized` | Invalid or expired session | Dispatches `samvidhan:unauthorized`, redirects to `/login?returnTo=...` |
| `403 Forbidden` | Insufficient role / tier permissions | Renders Forbidden or ProGate modal |
| `404 Not Found` | Resource does not exist | Renders EmptyStateView |
| `429 Too Many Requests` | Rate limit exceeded (e.g., AI quota) | Displays cooldown / upgrade toast |
| `500 Server Error` | Unhandled backend exception | Displays toast: "Unable to reach server" |

---

## 2. Authentication & Session Endpoints

### 2.1 Login
- **Method & Path:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "priya.sen@example.in",
    "password": "StrongPassword123!"
  }
  ```
- **Response (`200 OK`):**
  *(Sets `Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Lax; Path=/`)*
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_998231",
      "name": "Priya Sen",
      "email": "priya.sen@example.in",
      "interests": ["Constitutional Law", "Fundamental Rights"],
      "role": "learner",
      "tier": "free",
      "aiUsageToday": 1
    },
    "token": "optional_bearer_token_if_cookie_unavailable"
  }
  ```
- **Error Codes:** `401 Unauthorized`, `429 Too Many Requests`

### 2.2 Signup
- **Method & Path:** `POST /api/auth/signup`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@college.ac.in",
    "password": "StrongPassword123!"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_998232",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@college.ac.in",
      "interests": [],
      "role": "learner",
      "tier": "free",
      "aiUsageToday": 0
    }
  }
  ```
- **Error Codes:** `400 Bad Request` (Email already registered, password below strength requirement)

### 2.3 Verify Email OTP
- **Method & Path:** `POST /api/auth/verify-otp`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "aarav.sharma@college.ac.in",
    "code": "482913"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```
- **Error Codes:** `400 Bad Request` (Invalid or expired 6-digit code)

### 2.4 Resend OTP
- **Method & Path:** `POST /api/auth/resend-otp`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "aarav.sharma@college.ac.in"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```

### 2.5 Current Session Profile (`me`)
- **Method & Path:** `GET /api/auth/me`
- **Auth Required:** Yes (`httpOnly` session cookie or Bearer header)
- **Response (`200 OK`):**
  ```json
  {
    "id": "usr_998231",
    "name": "Priya Sen",
    "email": "priya.sen@example.in",
    "interests": ["Directive Principles", "Writ Jurisdiction"],
    "role": "learner",
    "tier": "free",
    "aiUsageToday": 2
  }
  ```
- **Error Codes:** `401 Unauthorized`

### 2.6 Logout
- **Method & Path:** `POST /api/auth/logout`
- **Auth Required:** Yes
- **Response (`200 OK`):**
  *(Clears session cookie)*
  ```json
  {
    "success": true
  }
  ```

### 2.7 Forgot Password & Reset Password
- **Request Reset:** `POST /api/auth/forgot-password`
  - Body: `{ "email": "priya.sen@example.in" }`
  - Response: `{ "success": true }`
- **Submit New Password:** `POST /api/auth/reset-password`
  - Body: `{ "token": "rst_token_123", "newPassword": "NewStrongPassword456!" }`
  - Response: `{ "success": true }`

---

## 3. Progress & Gamification (Server-Authoritative)

> [!IMPORTANT]
> In live mode, XP calculations, streak increments, badge unlocking, and tier quota deductions are calculated **authoritatively on the server**. The frontend emits event payloads and renders the returned `progress` state.

### 3.1 Fetch User Progress
- **Method & Path:** `GET /api/progress`
- **Auth Required:** Yes
- **Response (`200 OK`):**
  ```json
  {
    "completedLessonIds": ["lesson-preamble-1", "lesson-art14-2"],
    "quizScores": {
      "quiz-preamble-1": 100,
      "quiz-art14-2": 85
    },
    "bookmarks": ["lesson-preamble-1"],
    "savedLessonIds": ["lesson-art14-2"],
    "history": [
      {
        "id": "hist_1",
        "label": "Completed: We, The People",
        "at": "Just now",
        "href": "/learn/foundations-of-the-republic/we-the-people-the-source-of-power"
      }
    ],
    "xp": 145,
    "streak": 4,
    "dailyGoal": 30,
    "soundEnabled": true,
    "mascotEnabled": true,
    "streakFreezes": 1,
    "badges": ["first-step", "preamble-scholar"],
    "weeklyHistory": [
      { "day": "M", "xp": 30, "completed": true },
      { "day": "T", "xp": 45, "completed": true },
      { "day": "W", "xp": 15, "completed": true },
      { "day": "T", "xp": 55, "completed": true },
      { "day": "F", "xp": 0, "completed": false },
      { "day": "S", "xp": 0, "completed": false },
      { "day": "S", "xp": 0, "completed": false }
    ],
    "chestsOpened": ["chest-unit-1"]
  }
  ```

### 3.2 Complete Lesson Event
- **Method & Path:** `POST /api/progress/complete-lesson`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "lessonId": "lesson-preamble-1",
    "title": "We, The People: The Source of Power"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "earnedXp": 15,
    "streakIncremented": true,
    "newBadges": ["first-step"],
    "progress": {
      "completedLessonIds": ["lesson-preamble-1"],
      "quizScores": {},
      "bookmarks": [],
      "savedLessonIds": [],
      "history": [
        {
          "id": "hist_2",
          "label": "Completed: We, The People: The Source of Power",
          "at": "Just now",
          "href": "/search?q=We%2C%20The%20People"
        }
      ],
      "xp": 160,
      "streak": 5,
      "dailyGoal": 30,
      "soundEnabled": true,
      "mascotEnabled": true,
      "streakFreezes": 1,
      "badges": ["first-step"]
    }
  }
  ```

### 3.3 Submit Quiz Event
- **Method & Path:** `POST /api/progress/submit-quiz`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "quizId": "quiz-preamble-1",
    "score": 100,
    "title": "Preamble Mastery Quiz"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "earnedXp": 25,
    "newBadges": ["quiz-ace"],
    "progress": {
      "completedLessonIds": ["lesson-preamble-1"],
      "quizScores": { "quiz-preamble-1": 100 },
      "bookmarks": [],
      "savedLessonIds": [],
      "history": [],
      "xp": 185,
      "streak": 5,
      "dailyGoal": 30,
      "soundEnabled": true,
      "mascotEnabled": true,
      "streakFreezes": 1,
      "badges": ["first-step", "quiz-ace"]
    }
  }
  ```

### 3.4 Open Milestone Chest
- **Method & Path:** `POST /api/progress/open-chest`
- **Auth Required:** Yes
- **Request Body:** `{ "chestId": "chest-unit-1" }`
- **Response (`200 OK`):** `{ "success": true, "bonusXp": 20, "progress": { ... } }`

### 3.5 Use Streak Freeze
- **Method & Path:** `POST /api/progress/streak-freeze`
- **Auth Required:** Yes
- **Response (`200 OK`):** `{ "success": true, "progress": { ... } }`

---

## 4. Ask Samvidhan: SSE Real-Time Streaming Assistant

### 4.1 Chat Stream Request
- **Method & Path:** `POST /api/assistant/chat`
- **Auth Required:** Recommended (Guest allowed subject to IP daily quota)
- **Headers:**
  ```http
  Content-Type: application/json
  Accept: text/event-stream
  ```
- **Request Body:**
  ```json
  {
    "prompt": "Can the police arrest me after sunset without a female officer?",
    "conversationId": "conv_991823"
  }
  ```

### 4.2 SSE Stream Protocol
The server writes chunks as Server-Sent Events (`text/event-stream`). The frontend parses each event according to the event name or payload:

#### 1. Token Event (Streaming Markdown Text)
```http
event: token
data: {"token": "Under Section 46(4) of the Code of Criminal Procedure (CrPC), "}

event: token
data: {"token": "no woman shall be arrested after sunset and before sunrise "}
```

#### 2. Statutory Citation Event (Rich Cards in Sidebar / Footer)
```http
event: citation
data: {"label": "Section 46(4) CrPC", "url": "/library/fir-checklist", "summary": "Arrest of woman only in exceptional circumstances by woman police officer with prior magistrate sanction."}
```

#### 3. Follow-up Suggestions Event
```http
event: followUps
data: {"followUps": ["What is a Zero FIR?", "What are my rights during bail?", "Can police seize my phone?"]}
```

#### 4. Stream Completed Event
```http
event: done
data: {"done": true}
```

#### 5. Error Event
```http
event: error
data: {"message": "AI quota exhausted for today. Upgrade to Pro for unlimited inquiries."}
```

---

## 5. Catalog, Curriculum & Library Endpoints

### 5.1 Courses
- `GET /api/catalog/courses`: Returns `Course[]`
- `GET /api/catalog/courses/:id`: Returns single `Course`
- `GET /api/catalog/courses/:id/lessons`: Returns `Lesson[]`

### 5.2 Lessons & Interactive Cards
- `GET /api/catalog/lessons/:id`: Returns `Lesson` with `interactiveCards: InteractiveLessonCard[]`
- `GET /api/catalog/units`: Returns `LearningUnit[]` (Duolingo-style roadmap nodes)

### 5.3 Quizzes
- `GET /api/catalog/quizzes/:id`: Returns `Quiz` with questions of type:
  `multiple_choice`, `true_false`, `match_pairs`, `order_steps`, `fill_blank`, `spot_violation`.

### 5.4 Constitution Topics & Library
- `GET /api/constitution/topics`: Returns `ConstitutionTopic[]`
- `GET /api/constitution/topics/:id`: Returns `ConstitutionTopic`
- `GET /api/library/documents?category=...&tag=...`: Returns `LibraryDocument[]`
- `GET /api/library/documents/:id`: Returns single `LibraryDocument`

### 5.5 Global Search
- `GET /api/search?q=habeas+corpus`:
- Returns:
  ```json
  {
    "courses": [],
    "lessons": [],
    "topics": [],
    "documents": []
  }
  ```

---

## 6. Feedback, Mistake Reporting & Contact

### 6.1 Report Mistake
- **Method & Path:** `POST /api/reports/mistake`
- **Request Body:**
  ```json
  {
    "questionId": "q-art19-1",
    "cardId": "card-preamble-2",
    "prompt": "Which amendment added Secular to the Preamble?",
    "reason": "Typo in citation year: missing 1976."
  }
  ```
- **Response (`201 Created`):** `{ "success": true, "id": "rep_102" }`

### 6.2 Contact Form
- **Method & Path:** `POST /api/contact`
- **Request Body:**
  ```json
  {
    "name": "Priya Sen",
    "email": "priya.sen@example.in",
    "message": "Feedback regarding Fundamental Duties curriculum coverage."
  }
  ```
- **Response (`200 OK`):** `{ "success": true }`

### 6.3 Newsletter Subscription
- **Method & Path:** `POST /api/newsletter/subscribe`
- **Request Body:** `{ "email": "citizen@example.in" }`
- **Response (`200 OK`):** `{ "success": true, "message": "Subscribed to Gazette Briefing!" }`

---

## 7. Admin Control Plane

*Restricted to users with roles: `superadmin`, `admin`, `editor`, `reviewer`.*

| Method | Path | Action |
| :--- | :--- | :--- |
| `GET` | `/api/admin/content` | List all curriculum content items with review status |
| `POST` | `/api/admin/content` | Create draft curriculum content |
| `PATCH` | `/api/admin/content/:id/status` | Advance review status (`Draft` -> `In Review` -> `Approved` -> `Published`) |
| `DELETE` | `/api/admin/content/:id` | Remove curriculum content |
| `GET` | `/api/admin/users` | List platform users with roles, XP, and status |
| `PATCH` | `/api/admin/users/:id/role` | Update user role (`learner`, `reviewer`, `editor`, `admin`, `superadmin`) |
| `POST` | `/api/admin/users/:id/reset-progress` | Reset test account XP/progress |
| `PATCH` | `/api/admin/users/:id/status` | Suspend or reactivate user |
| `GET` | `/api/admin/reports` | Mistake reports inbox |
| `PATCH` | `/api/admin/reports/:id` | Mark mistake report status (`Investigating`, `Fixed`, `Rejected`) |
| `GET` | `/api/admin/audit-logs` | Immutable audit log of all admin operations |
| `GET` | `/api/admin/feature-flags` | Platform feature flags configuration |
| `PATCH` | `/api/admin/feature-flags` | Toggle feature flags (e.g. mascotEnabled, citationEnforcement) |

---

## 8. Explicit Backend Developer Assumptions

The frontend implementation makes the following explicit assumptions. **Please review each item and confirm or adjust**:

- [ ] **Assumption 1: Cookie-first Authentication**
  - *Assumption:* The backend will set an `httpOnly`, `Secure`, `SameSite=Lax` cookie upon successful login/signup, and clear it upon logout.
  - *Fallback:* If your infrastructure requires Bearer headers (e.g., cross-origin API gateway), the frontend supports setting `VITE_AUTH_STRATEGY=bearer`, which uses in-memory token dispatching.
- [ ] **Assumption 2: Server-Authoritative Gamification**
  - *Assumption:* When a client submits `/api/progress/complete-lesson` or `/api/progress/submit-quiz`, the server computes XP (+15 for standard lessons, +25 for >=80% quiz, +15 for <80% quiz), updates daily targets and streak counters, and returns the full updated `progress` object.
- [ ] **Assumption 3: Server-Sent Events (SSE) for Ask Samvidhan**
  - *Assumption:* The `/api/assistant/chat` endpoint supports HTTP streaming with `text/event-stream` response header, emitting `token`, `citation`, `followUps`, and `done` events.
- [ ] **Assumption 4: Standard Role Schema**
  - *Assumption:* The backend user role enum is `['learner', 'editor', 'reviewer', 'admin', 'superadmin']`. Legacy `'user'` is deprecated.
- [ ] **Assumption 5: User Tiers & AI Quotas**
  - *Assumption:* Tiers are `['free', 'pro', 'patron']`. The free tier allows 5 AI questions/day. The server returns current `aiUsageToday` in `/api/auth/me` and enforces `429 Too Many Requests` when exceeded.
- [ ] **Assumption 6: Strict Citation Requirement for Admin Publishing**
  - *Assumption:* The admin workflow enforces that no lesson or quiz question can transition to `Approved` or `Published` unless accompanied by a statutory citation (minimum 4 characters).
