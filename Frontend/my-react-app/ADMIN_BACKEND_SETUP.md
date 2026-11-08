# Samvidhan Admin Backend Connection & Architecture Guide

This guide details how the client-side data service layer in `src/services/adminService.ts` maps to a production backend (PostgreSQL, Supabase, or Firebase), how Role-Based Access Control (RBAC) operates, and how to safely bootstrap the initial Super Admin user.

---

## 1. Role Hierarchy & RBAC Matrix

The platform strictly differentiates learning citizens from content reviewers and administrative officers:

| Role | Access Level | Permissions |
| :--- | :--- | :--- |
| **`superadmin`** | Root Authority | Full access across all 7 admin modules, user role promotion/demotion, site feature flags, database resets. |
| **`admin`** | System Administrator | User management, content moderation, reports resolution, workflow management. |
| **`editor`** | Legal Content Author | Create & edit Units, Lessons, Interactive Cards, and Quiz Questions in `Draft` or submit for `In Review`. Cannot self-publish without review. |
| **`reviewer`** | Constitutional Scholar / Reviewer | Review submitted content, verify statutory citations (Articles / Acts), approve or reject drafts. |
| **`learner`** | Standard Citizen | Public routes, personal progress, streak, bookmarks, mistake reporting. Accessing `/admin` routes redirects to `/admin/forbidden`. |

---

## 2. Client-Side Service Architecture (`adminService.ts`)

All administrative UI components interact exclusively with `src/services/adminService.ts`. 
To transition from the demo local store to a live database:
1. Replace the in-memory array operations in `adminService.ts` with asynchronous `fetch` or Supabase/Firebase SDK calls.
2. The UI methods (`getContentItems`, `updateContentStatus`, `createContentItem`, `getReports`, `updateReportStatus`, `getAuditLogs`) remain unchanged.

---

## 3. Database Schema (PostgreSQL / Supabase DDL)

```sql
-- 1. Profiles & Roles Table
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'editor', 'reviewer', 'learner');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'learner',
  streak INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Units & Lessons
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  kicker TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 3,
  xp INTEGER NOT NULL DEFAULT 15,
  article_citation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Interactive Lesson Cards
CREATE TABLE interactive_cards (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  kicker TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  simplified_summary TEXT,
  takeaway TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 4. Mistake Reports Inbox
CREATE TABLE mistake_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  question_title TEXT NOT NULL,
  user_email TEXT,
  category TEXT NOT NULL,
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolution_note TEXT
);

-- 5. Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT NOT NULL
);
```

---

## 4. Statutory Citation Gatekeeping Enforcement

> **Important**: Samvidhan strictly prohibits publishing unverified legal claims.

In `src/services/adminService.ts`, the transition to `Published` enforces mandatory statutory citations:

```typescript
if (newStatus === 'Published') {
  if (!item.citation || item.citation.trim().length < 6) {
    throw new Error('Mandatory Statutory Citation Required: Content cannot be published without citing an Article of the Constitution or a Central Act.');
  }
}
```

Any attempt to publish content without a verified Article (e.g. *Article 14*, *Article 21*, or *CrPC Section 50*) is blocked at the service and UI level.

---

## 5. Bootstrapping the Initial Super Admin

To designate your first Super Admin:
1. In your Supabase/PostgreSQL console:
   ```sql
   UPDATE profiles 
   SET role = 'superadmin' 
   WHERE email = 'admin@samvidhan.org';
   ```
2. In the demo application:
   - Use the **Demo Role Pill** at the top right of the Admin Console or profile menu to test different permission perspectives.
