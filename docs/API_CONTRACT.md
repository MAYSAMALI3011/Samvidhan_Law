# Samvidhan API Contract & Specification

> **Version:** 1.1.0 (Phase 2 Hardened)  
> **Status:** Production-Ready Contract  
> **Target Consumer:** Backend Engineering Team  
> **Security Baseline:** No credentials or tokens stored in `localStorage`. `httpOnly` secure cookies are the default session mechanism.

---

## 1. Global Architectural Standards

### 1.1 Base URL & Environment
All API requests are prefixed by the base URL configured via environment variables:
- **Local Dev / Staging:** Configured via `.env.development` (`VITE_API_URL=http://localhost:8000`)
- **Production:** Configured via `VITE_API_URL` (e.g. `https://api.samvidhan.in`)
- **Live Mode Enforcement:** When `VITE_USE_MOCKS=false` or when `import.meta.env.PROD === true`. Production builds **force live API mode**; mocks cannot execute in production builds.

### 1.2 Authentication Strategies
1. **Primary (Default):** `httpOnly` secure cookies with `SameSite=Lax` (or `None` with `Secure` for cross-domain API hosts). The frontend issues all requests with `credentials: 'include'`.
2. **Configurable Fallback:** Bearer Token via HTTP header:
   ```http
   Authorization: Bearer <in_memory_jwt_token>
   ```
   *Note: If the Bearer strategy is selected, tokens reside exclusively in JavaScript memory and are never persisted to `localStorage` or `sessionStorage`.*

### 1.3 CSRF Protection
Because session cookies use `credentials: 'include'`, the backend must protect all state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) against Cross-Site Request Forgery (CSRF):
- **Cookie Policy:** Authentication cookies must declare `SameSite=Lax` (or `SameSite=Strict` where feasible).
- **Origin & Referer Verification:** The backend must verify that the `Origin` or `Referer` header matches the authorized frontend domain (e.g., `https://samvidhan.in` or `http://localhost:5173`).
- **CSRF Token Header (Recommended):** The server may issue an anti-CSRF token (e.g., via a readable `XSRF-TOKEN` cookie or handshake endpoint) which the client transmits as `X-CSRF-Token` on mutating requests.

### 1.4 Request Retries & Idempotency Keys
- **Safe Retries:** Only idempotent `GET` and `HEAD` requests are automatically retried by the frontend HTTP client (up to 2 retries on network failures with exponential backoff).
- **Zero Auto-Retry on Mutations:** State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) **never auto-retry**.
- **Idempotency-Key Header:** For state-changing operations (lesson completion, quiz submission, chest opening, streak freezing, subscription checkout, and referral redemption), the client generates and sends a UUID header:
  ```http
  Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  ```
  **Backend Requirement:** The server must cache the response for each `Idempotency-Key` (e.g., in Redis with a 24-hour TTL). If a request with the same `Idempotency-Key` is received again (e.g., user manual retry), the backend must return the cached response without re-executing state side-effects (e.g., without awarding double XP or double-billing).

### 1.5 Rate Limiting & 429 AI Quota Handling
When rate limits or daily AI question quotas are exceeded:
- **HTTP Status:** `429 Too Many Requests`
- **Response Payload:**
  ```json
  {
    "success": false,
    "message": "Daily AI question limit reached. Upgrade to Samvidhan Pro for unlimited queries.",
    "retryAfter": 86400,
    "currentTier": "free",
    "dailyLimit": 5,
    "usageToday": 5
  }
  ```
- **Response Headers:** `Retry-After: <seconds_until_midnight_utc>`

### 1.6 Standard Error Format
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
    "token": "optional_bearer_token_if_cookie_strategy_disabled"
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

### 2.3 Verify Email OTP
- **Method & Path:** `POST /api/auth/verify-otp`
- **Auth Required:** No
- **Request Body:** `{ "email": "aarav.sharma@college.ac.in", "code": "482913" }`
- **Response (`200 OK`):** `{ "success": true }`

### 2.4 Resend OTP
- **Method & Path:** `POST /api/auth/resend-otp`
- **Auth Required:** No
- **Request Body:** `{ "email": "aarav.sharma@college.ac.in" }`
- **Response (`200 OK`):** `{ "success": true }`

### 2.5 Current Session Profile (`me`)
- **Method & Path:** `GET /api/auth/me`
- **Auth Required:** Yes
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

### 2.6 Logout
- **Method & Path:** `POST /api/auth/logout`
- **Auth Required:** Yes
- **Response (`200 OK`):** `{ "success": true }`

### 2.7 Password Recovery
- **Request:** `POST /api/auth/forgot-password` `{ "email": "priya.sen@example.in" }` -> `{ "success": true }`
- **Reset:** `POST /api/auth/reset-password` `{ "token": "tok_123", "newPassword": "NewPassword456!" }` -> `{ "success": true }`

---

## 3. User Account & Preferences Endpoints

### 3.1 Get Profile
- **Method & Path:** `GET /api/user/profile`
- **Auth Required:** Yes
- **Response (`200 OK`):** Same as `/api/auth/me`.

### 3.2 Update Profile
- **Method & Path:** `PATCH /api/user/profile`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "Priya Sen Sharma",
    "interests": ["Constitutional Law", "Environmental Jurisprudence"]
  }
  ```
- **Response (`200 OK`):** Updated `DemoUser` object.

### 3.3 Update Settings
- **Method & Path:** `PATCH /api/user/settings`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "dailyGoal": 50,
    "soundEnabled": true,
    "mascotEnabled": true,
    "reduceMotion": false,
    "compact": false
  }
  ```
- **Response (`200 OK`):** Updated `UserSettings` object.

### 3.4 Export User Data (GDPR / DPDP Compliance)
- **Method & Path:** `GET /api/user/export`
- **Auth Required:** Yes
- **Response (`200 OK`):** Full JSON bundle of learner profile, progress, quiz history, bookmarks, notes, and activity log.

### 3.5 Delete Account
- **Method & Path:** `DELETE /api/user/account`
- **Auth Required:** Yes
- **Headers:** `Idempotency-Key: <UUID>`
- **Response (`200 OK`):** `{ "success": true }`

---

## 4. Progress & Gamification (Server-Authoritative)

> [!IMPORTANT]
> The server computes XP, streaks, badges, and daily targets authoritatively. The frontend sends the action event with an `Idempotency-Key` and renders what the server returns. Never substitute client fallbacks over failed server progress.

### 4.1 Fetch User Progress
- **Method & Path:** `GET /api/progress`
- **Auth Required:** Yes
- **Response (`200 OK`):**
  ```json
  {
    "completedLessonIds": ["lesson-preamble-1", "lesson-art14-2"],
    "quizScores": { "quiz-preamble-1": 100 },
    "bookmarks": ["lesson-preamble-1"],
    "savedLessonIds": ["lesson-art14-2"],
    "history": [],
    "xp": 145,
    "streak": 4,
    "dailyGoal": 30,
    "soundEnabled": true,
    "mascotEnabled": true,
    "streakFreezes": 1,
    "badges": ["first-step"],
    "weeklyHistory": [
      { "day": "M", "xp": 30, "completed": true },
      { "day": "T", "xp": 45, "completed": true }
    ],
    "chestsOpened": ["chest-unit-1"]
  }
  ```

### 4.2 Complete Lesson Event
- **Method & Path:** `POST /api/progress/complete-lesson`
- **Auth Required:** Yes
- **Headers:** `Idempotency-Key: <UUID>`
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
    "progress": { ... }
  }
  ```

### 4.3 Submit Quiz Event
- **Method & Path:** `POST /api/progress/submit-quiz`
- **Auth Required:** Yes
- **Headers:** `Idempotency-Key: <UUID>`
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
    "progress": { ... }
  }
  ```

### 4.4 Open Milestone Chest
- **Method & Path:** `POST /api/progress/open-chest`
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:** `{ "chestId": "chest-unit-1" }`
- **Response (`200 OK`):** `{ "success": true, "bonusXp": 20, "progress": { ... } }`

### 4.5 Use Streak Freeze
- **Method & Path:** `POST /api/progress/streak-freeze`
- **Headers:** `Idempotency-Key: <UUID>`
- **Response (`200 OK`):** `{ "success": true, "progress": { ... } }`

---

## 5. Ask Samvidhan: Real-Time SSE Assistant

### 5.1 Chat Stream Request
- **Method & Path:** `POST /api/assistant/chat`
- **Auth Required:** Recommended (Guest subject to IP quota)
- **Headers:**
  ```http
  Content-Type: application/json
  Accept: text/event-stream
  ```
- **Request Body:**
  ```json
  {
    "prompt": "Can police seize my phone without an FIR or warrant?",
    "conversationId": "conv_991823"
  }
  ```

### 5.2 Stream Behavior & Timeouts
- **Timeout Model:** Exempt from the 15-second request timeout. Governed by a **30-second idle timeout** (reset upon each event chunk) and user abort via UI stop button.
- **Event Protocol:**
  - `event: token` -> `{"token": "Under Article 20(3)..."}`
  - `event: citation` -> `{"label": "Virendra Khanna v. State", "url": "/library/privacy", "summary": "Compelling phone password violates self-incrimination safeguards."}`
  - `event: followUps` -> `{"followUps": ["What is Section 91 CrPC notice?", "Can police clone my device?"]}`
  - `event: done` -> `{"done": true}`
  - `event: error` -> `{"message": "Daily AI limit exceeded. Upgrade to Pro."}`

### 5.3 Conversations Management
- `GET /api/assistant/conversations`: Returns `AskConversation[]`
- `GET /api/assistant/conversations/:id`: Returns `AskConversation`
- `DELETE /api/assistant/conversations/:id`: Deletes conversation history.

---

## 6. Subscriptions & Tier Upgrades

> [!NOTE]
> Client never stores or transmits raw credit card numbers. All payment collection uses the payment provider's hosted checkout (Stripe / Razorpay).

### 6.1 Get Current Subscription
- **Method & Path:** `GET /api/subscriptions/current`
- **Auth Required:** Yes
- **Response (`200 OK`):**
  ```json
  {
    "tier": "pro",
    "status": "active",
    "validUntil": "2027-12-31T23:59:59Z",
    "aiUsageToday": 3,
    "aiDailyLimit": null,
    "unlimited": true
  }
  ```

### 6.2 Create Checkout Session
- **Method & Path:** `POST /api/subscriptions/checkout`
- **Auth Required:** Yes
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:** `{ "tier": "pro" }`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_xyz",
    "clientSecret": "pi_123_secret_456"
  }
  ```

### 6.3 Cancel Subscription
- **Method & Path:** `POST /api/subscriptions/cancel`
- **Headers:** `Idempotency-Key: <UUID>`
- **Response (`200 OK`):** `{ "success": true }`

### 6.4 Webhook Lifecycle Events (Backend Inbound)
- `customer.subscription.created`: Sets user tier to `pro` or `patron`.
- `customer.subscription.updated`: Syncs expiration date and status.
- `customer.subscription.deleted`: Reverts tier to `free`.

---

## 7. Growth: Referrals & Affiliates

### 7.1 My Referral Stats
- **Method & Path:** `GET /api/referrals/me`
- **Auth Required:** Yes
- **Response (`200 OK`):**
  ```json
  {
    "referralCode": "PRIYA2026",
    "invitesCount": 4,
    "earnedXp": 150,
    "milestones": [
      { "milestone": 1, "label": "1 Friend Joined", "reward": "+1 Streak Freeze", "unlocked": true },
      { "milestone": 3, "label": "3 Friends Joined", "reward": "14 Days Free Pro", "unlocked": true },
      { "milestone": 10, "label": "10 Friends Joined", "reward": "Patron Profile Emblem", "unlocked": false }
    ]
  }
  ```

### 7.2 Apply Referral Code (At Signup / Onboarding)
- **Method & Path:** `POST /api/referrals/apply`
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:** `{ "code": "PRIYA2026" }`
- **Response (`200 OK`):** `{ "success": true, "bonusXp": 25 }`

### 7.3 Affiliate Program
- **Apply:** `POST /api/affiliates/apply` (Body: `{ name, email, organization, audienceSize, message }`, Header: `Idempotency-Key`)
- **Stats:** `GET /api/affiliates/stats` -> `{ clicks: 42, conversions: 8, earnings: 2400, payoutStatus: "Active" }`

---

## 8. Catalog, Curriculum, Feedback & Admin

### 8.1 Catalog Endpoints
- `GET /api/catalog/courses`: List courses
- `GET /api/catalog/courses/:id`: Get course
- `GET /api/catalog/courses/:id/lessons`: Lessons for course
- `GET /api/catalog/lessons/:id`: Single lesson with interactiveCards
- `GET /api/catalog/units`: Duolingo-style roadmap learning units
- `GET /api/catalog/quizzes/:id`: Quiz with typed questions
- `GET /api/constitution/topics`: Constitution parts & topics
- `GET /api/constitution/topics/:id`: Topic with statutory source notes
- `GET /api/library/documents`: Document templates & legal checklists
- `GET /api/search?q=...`: Global search

### 8.2 Feedback & Contact Endpoints
- `POST /api/reports/mistake`: Report question or lesson citation error
- `POST /api/contact`: General inquiry contact form
- `POST /api/newsletter/subscribe`: Gazette briefing newsletter

### 8.3 Admin Control Plane
- `GET /api/admin/content`, `POST /api/admin/content`, `PATCH /api/admin/content/:id/status`, `DELETE /api/admin/content/:id`
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `POST /api/admin/users/:id/reset-progress`, `PATCH /api/admin/users/:id/status`
- `GET /api/admin/reports`, `PATCH /api/admin/reports/:id`
- `GET /api/admin/audit-logs`
- `GET /api/admin/feature-flags`, `PATCH /api/admin/feature-flags`

---

## 9. Explicit Backend Developer Assumptions

Please review each assumption and confirm or adjust:

- [ ] **Assumption 1: Cookie-first Authentication with CSRF Protection**
  - The backend sets `httpOnly`, `Secure`, `SameSite=Lax` cookies upon login/signup and validates `Origin`/`Referer` headers (or `X-CSRF-Token`) on all non-GET requests.
  - *Fallback:* Setting `VITE_AUTH_STRATEGY=bearer` switches frontend to in-memory Bearer token headers without touching `localStorage`.
- [ ] **Assumption 2: Idempotency-Key Support on Mutating Operations**
  - The backend inspects `Idempotency-Key` headers on state-changing requests (`complete-lesson`, `submit-quiz`, `open-chest`, `streak-freeze`, `checkout`, `referrals`) and prevents double-awarding of XP, badges, or billing charges upon retries.
- [ ] **Assumption 3: Server-Authoritative Gamification**
  - XP, streak counts, daily goal progress, and unlocked badges are calculated by the server. The client sends event payloads and updates its UI from the authoritative server response.
- [ ] **Assumption 4: Safe Validation Policy**
  - The client will NEVER substitute default fallbacks over failed auth, user profile, progress, or subscription responses. If the backend schema deviates unexpectedly, the client keeps existing state, displays an error notification, and dispatches a telemetry warning.
- [ ] **Assumption 5: Server-Sent Events (SSE) with 30s Idle Timeout**
  - `POST /api/assistant/chat` emits `token`, `citation`, `followUps`, and `done` events. The client keeps the connection open until `done` or a 30s idle gap occurs.
- [ ] **Assumption 6: AI Quota Enforcement (429)**
  - Free tier allows 5 AI questions/day (`aiDailyLimit: 5`, `unlimited: false`); Pro and Patron tiers both have unlimited AI queries (`aiDailyLimit: null`, `unlimited: true`). The server returns `429 Too Many Requests` with `Retry-After` header and JSON error payload when the Free tier daily quota is exceeded.
- [ ] **Assumption 7: Standard Role Enum**
  - User roles are `['learner', 'editor', 'reviewer', 'admin', 'superadmin']`. Legacy `'user'` is migrated to `'learner'`.
