# Stage U0 UI Diagnosis Report: Samvidhan (Live vs Local)

**Target URL Tested**: `https://samvidhan-law.pages.dev/`  
**Backend API**: `https://samvidhan-law.onrender.com`  
**Viewports Audited**: 
- Desktop Laptop: **1440 × 900**
- Mobile Phone: **390 × 844** (iPhone 12/13/14 viewport)
**Artifact Directories**:
- Live Before Evidence: `qa/live-before/` (20 screenshots + `diagnosis_results.json`)
- Local Preview Comparison: `qa/local-preview/` (20 screenshots + `local_diagnosis.json`)

---

## 1. Executive Summary & Ranked Root Causes

| Rank | Issue | Root Cause | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | **Two Vertical Scrollbars** | In `src/styles/base.css`, `html { overflow-x: hidden; }` and `body { overflow-x: hidden; min-height: 100vh; }`. Under CSS standards, setting `overflow-x: hidden` causes `overflow-y` to compute to `auto`. Because `body` is taller than the viewport (5994px vs 900px), both `<html>` AND `<body>` become independent vertical scroll containers, rendering two parallel scrollbars. | Desktop users see two vertical scrollbars on the right side of the window. |
| **P0** | **"Login with Google" Not Working** | `SocialAuthButtons.tsx` only runs a `setTimeout` calling client-side `demoSignIn()`. In production mode (`isMockMode() === false`), every page load checks `/api/auth/me`. Because no server session cookie exists on Render, the backend returns 401. `api/client.ts` catches 401, fires `auth:unauthorized`, which resets `user` to `null`. `RequireAuth` then immediately kicks the user back to `/login`. | Clicking "Continue with Google" briefly navigates to dashboard then immediately kicks the user back to login. |
| **P0** | **"Start a Free Lesson" on Home Page Not Working** | `HomePage.tsx` line 61 links to `/learn/constitutional-foundations/preamble-philosophy`. This slug is completely invalid; the real curriculum slug is `/learn/foundations-of-the-republic/preamble-we-the-people` (or catalog `constitution-foundations/cf-preamble`). | Users click "Start a free lesson" and land on an empty error page: *"Lesson not found"*. |
| **P1** | **Mobile Bottom Navigation Tab Covered** | Floating `AskSamvidhanLauncher` circular button is fixed at `bottom: 24px; right: 24px; z-index: 9999`, which sits directly on top of the 5th tab ("Log in") in `MobileTabBar`. | Mobile phone users cannot tap the "Log in" button in the bottom navigation. |
| **P1** | **Horizontal Overflow on Mobile (Paging Offscreen)** | On mobile viewports (390px), multiple header titles and flex containers (`div.container`, `h1`, badges) reach `419.8px` width (exceeding the 390px viewport by 30px). | Subtle horizontal wobble/scrolling on mobile. |
| **P2** | **Laptop Top Navbar Squeeze** | At 901px – 1200px laptop screens, the 280px search input collides with navigation links before the mobile breakpoint kicks in. | Links squeeze and navigation bar wraps awkwardly on 13" laptops. |
| **P2** | **Metadata & Wrong Domain References** | `index.html` hardcodes `<link rel="canonical" href="https://samvidhan.law/">`, points `og:url` to `https://samvidhan.law/`, and claims *"with verified statutory sources"* in the Twitter description. | Search engines and social link previews reference an unowned domain and make unverified marketing claims. |

---

## 2. Common Deployment Verification

| Check Item | Result | Evidence / Details |
| :--- | :--- | :--- |
| **JS/CSS Asset URLs match actual files?** | **YES** | All assets in `dist/assets/` loaded with HTTP 200 on `samvidhan-law.pages.dev`. No 404s on CSS/JS bundles. |
| **SPA Fallback for Deep Links?** | **YES** | Direct navigation to `https://samvidhan-law.pages.dev/constitution` returned HTTP 200 with SPA shell. |
| **Production Environment Variables?** | **PARTIAL** | Production build needs `VITE_API_URL` pointing to `https://samvidhan-law.onrender.com`. Because the backend had not yet allowed Cloudflare Pages origin on CORS in its live deployment, direct authenticated requests return 401 unauthenticated. |
| **Is Frontend calling Backend?** | **YES** | Every route fired `GET https://samvidhan-law.onrender.com/api/auth/me`. The Render server is reachable and responded in ~400ms. |
| **Which "broken" screens are "no data" screens?** | **YES** | `/dashboard` redirects to `/login` when unauthenticated. `/learn` shows empty states when server catalog returns empty. |

---

## 3. Detailed Root Cause Breakdowns

### 3.1 Why There Are Two Scroll Bars
In `src/styles/base.css`:
```css
html {
  overflow-x: hidden;
  width: 100%;
}

body {
  overflow-x: hidden;
  width: 100%;
  min-height: 100vh;
}
```
**Mechanism**:
- According to W3C CSS Overflow Module 3: When `overflow-x` is set to `hidden` and `overflow-y` is not specified, `overflow-y` computes to `auto`.
- Because `<html>` has `overflow-y: auto` and a document height of 5970px, the window creates a vertical scrollbar.
- Because `<body>` ALSO has `overflow-y: auto` and height of 5994px, `<body>` creates its own vertical scrollbar right next to `<html>`'s scrollbar.
**Solution**:
- Set `html { overflow-y: scroll; overflow-x: hidden; }`
- Set `body { overflow-x: clip; overflow-y: visible; }` (`clip` prevents horizontal scroll without creating an independent scroll container).

---

### 3.2 Why "Login with Google" Does Not Work
In `src/components/auth/SocialAuthButtons.tsx`:
```ts
const handleProviderAuth = (provider: 'Google' | 'Apple') => {
  setLoadingProvider(provider)
  setTimeout(() => {
    setLoadingProvider(null)
    demoSignIn({
      id: `usr_${provider.toLowerCase()}_${Date.now()}`,
      name: `${provider} Citizen`,
      ...
```
**Mechanism**:
- The button only runs a client-side mock timer and does not initiate a real OAuth flow with Google or Supabase.
- When `navigate('/dashboard')` is called, `/dashboard` requires authentication (`<RequireAuth>`).
- On production, `AppStateContext.tsx` checks `getCurrentUser()` via `GET /api/auth/me`.
- Because no valid auth cookie exists on Render, Render returns HTTP 401.
- `api/client.ts` intercepts the 401 and emits `auth:unauthorized`.
- `AppStateContext` listens to `auth:unauthorized` and runs `setUser(null)`.
- `RequireAuth` sees `user === null` and immediately redirects to `/login`.
**Solution**:
- Provide graceful Google Auth handling: wire real OAuth redirect when backend OAuth is configured, OR in preview/demo mode maintain local session persistence so the user stays logged in without being kicked out by unauthenticated 401 checks.

---

### 3.3 Why "Start a Free Lesson" on Home Page Does Not Work
In `src/pages/public/HomePage.tsx` line 61:
```tsx
<Link to="/learn/constitutional-foundations/preamble-philosophy" className="btn btn-primary hero-primary-btn">
  <span>Start a free lesson</span>
  <ArrowRight size={17} aria-hidden="true" />
</Link>
```
**Mechanism**:
- The route points to course: `constitutional-foundations`, lesson: `preamble-philosophy`.
- The actual curriculum defined in `src/data/mock/learningUnits.ts` is:
  - Unit / Course: `foundations-of-the-republic`
  - Lesson: `preamble-we-the-people`
- In `curriculum.ts`:
  - Course: `constitution-foundations`
  - Lesson: `cf-preamble`
- When clicked, `LessonPage.tsx` cannot find `constitutional-foundations` or `preamble-philosophy` in either data source and renders:
  `<EmptyState title="Lesson not found" body="This lesson is not in the sample curriculum." />`.
**Solution**:
- Update the CTA link in `HomePage.tsx` to point to the real interactive unit lesson: `/learn/foundations-of-the-republic/preamble-we-the-people`.

---

## 4. Proposed Fix Plan (Mapped to Stages)

### Group A: Deployment & Config (Stage U1)
1. Vite Base Path: Configure `VITE_BASE_PATH` (default `/`).
2. Configurable Site URL: Add `VITE_SITE_URL` (default `https://samvidhan-law.pages.dev`), replace hardcoded `https://samvidhan.law/` in `canonical`, `og:url`, and `og:image`.
3. Metadata Claims: Remove unverified *"verified statutory sources"* and authoritative wording from meta tags.
4. Cloudflare Pages Configuration: Document exact environment variable names for Cloudflare dashboard.

### Group B: Data-Unavailable & Broken Link States (Stage U1)
1. Fix "Start a free lesson" CTA to point to the working lesson slug `/learn/foundations-of-the-republic/preamble-we-the-people`.
2. Fix Auth 401 loop so social/demo logins are not wiped out by background `/api/auth/me` checks when the backend session is absent.
3. Add graceful loading skeletons, server waking banner (*"Waking up the server, this can take up to a minute"*), and friendly empty states.

### Group C: Laptop Layout & Double Scrollbars (Stage U2)
1. Remove double scrollbar by setting `overflow-x: clip; overflow-y: visible;` on `body` and clean overflow on `html`.
2. Fix 901px – 1200px laptop navbar squeeze.

### Group D: Mobile Phone Polishing (Stage U2)
1. Hide floating `AskSamvidhanLauncher` on screens `<= 900px` to unblock the "Log in" bottom navigation tab.
2. Fix mobile horizontal overflow (`max-width: 100vw; overflow-x: hidden`).
3. Set mobile hero card height to auto-fit instead of `min-height: 480px`.
4. Ensure minimum 44×44px tap targets and 16px form inputs to prevent mobile iOS zoom.
