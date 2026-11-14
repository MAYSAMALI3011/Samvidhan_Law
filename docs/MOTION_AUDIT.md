# Stage M0 Audit Report: Motion, Mascot, Links & Social Cleanup

**Target Worktree**: `C:\Users\MAYSAMALI MASU\Projects\samvidhan-ui`  
**Branch**: `ui-fix` (HEAD at `b3d0cf8`)  
**Audit Date**: November 14, 2026  
**Auditor**: Antigravity  

---

## 1. Link & Button Inventory Summary

A comprehensive automated Playwright audit was executed via `qa/link-audit.spec.ts` against the live local application at both **mobile (390 × 844)** and **desktop (1440 × 900)** viewports, across all 20 public routes and 7 authenticated routes (with mock session state), including opening and extracting the mobile navigation drawer.

- **Full Audit Record**: [`qa/LINK_AUDIT.md`](file:///C:/Users/MAYSAMALI%20MASU/Projects/samvidhan-ui/qa/LINK_AUDIT.md)
- **Total Elements Inspected**: **2,597** interactive elements (`<a>` anchors and `<button>` controls).
- **Working / Compliant**: **2,444** elements.
- **Flagged Issues**: **153** instances.

### Key Inventory Findings:
1. **Zero Dead Route Links**: No links point to `href="#"` or trigger 404 client router errors. Primary navigation anchors (`/learn`, `/constitution`, `/library`, `/ask`, `/dashboard`, `/login`, `/signup`) resolve to valid route components.
2. **Hero CTA Accuracy**:
   - "Start a free lesson" correctly opens `/learn/foundations-of-the-republic/preamble-we-the-people` (the foundational lesson).
   - "Browse Constitution" connects to `/constitution`.
   - "Go to Learning Dashboard" connects to `/dashboard`.
3. **Primary Root Cause of Flagged Items (153/153)**:
   - Every single flagged issue stems from the footer's `SocialIcons.tsx` component (and drawer copy), which includes links to **X (Twitter)** (`https://x.com`), **Instagram** (`https://instagram.com`), and **YouTube** (`https://youtube.com`), violating the owner's explicit constraint to keep **only LinkedIn and GitHub**.
   - In addition, `SocialIcons.tsx` currently uses generic domain placeholders (`https://linkedin.com`, `https://github.com`) instead of the owner's profiles.

---

## 2. Social Links Audit

An exhaustive scan across the repository for all social references (`twitter`, `x.com`, `instagram`, `youtube`, `facebook`, `linkedin`, `github`) identified the following locations:

| File Location | Social Networks Referenced | Status / Action in Stage M1 |
| :--- | :--- | :--- |
| `src/components/common/SocialIcons.tsx` | X/Twitter, LinkedIn, GitHub, Instagram, YouTube | **Prune**: Remove X, Instagram, YouTube. Retain **only LinkedIn and GitHub**. Wire to owner URLs. Enforce $\ge 44\text{px}$ touch target. |
| `src/components/common/ShareButton.tsx` | X/Twitter, WhatsApp, LinkedIn, Facebook | Social share intents. Update to ensure all outbound links include `rel="noopener noreferrer"` and `target="_blank"`. |
| `src/components/animations/ExpandingHoverButtonGroup.tsx` | X/Twitter (`x.com/intent/tweet`), LinkedIn | Lesson action fan: replace X share with clean copy link / WhatsApp, or keep only LinkedIn share. Ensure `rel="noopener noreferrer"`. |
| `index.html` | Twitter Card metadata (`summary_large_image`, title, description, image) | **Preserve**: Standard card preview metadata required for link sharing. No personal X handle or `twitter:site` tag exists. |
| `index.html` (JSON-LD) | `EducationalOrganization` | Currently lacks `sameAs` array. In M1, add `sameAs` referencing only the owner's GitHub and LinkedIn profiles. |
| `src/tests/auth.test.ts` | Test strings | No production UI impact. |

---

## 3. Existing Mascot (Mor) Asset Inventory

The repository contains an existing, high-quality peacock mascot named **Mor**:

- **Location**: `src/components/mascot/` and `src/assets/mor/` + `public/mascot/`
- **Supported Moods & Poses**:
  1. `idle` (`mor_idle.png`): Calm standing pose with gentle breathing bob.
  2. `wave` (`mor_wave.png`): Welcoming hand wave.
  3. `reading` (`mor_reading.png`): Holding the Constitution text with subtle reading sway.
  4. `celebrate` (`mor_celebrate.png`): Cheerful jump/bounce with celebration particles.
  5. `thinking` (`mor_thinking.png`): Head-tilt contemplative pose.
  6. `encourage` (`mor_encourage.png`): Thumbs-up / supportive pose.
  7. `sleepy` (`mor_sleepy.png`): Low-energy / night mode resting pose.
- **Components**:
  - `Mor.tsx`: Core mascot renderer respecting `mascotEnabled` setting and `size` prop (`sm: 44px`, `md: 84px`, `lg: 144px`, or custom number).
  - `morLogic.ts`: Mood resolution, accessibility labels (`aria-label="Mor the peacock, ..."`), and settings check.
  - `morQueue.ts`: Timed speech bubble manager with session-capping support (`useMorMessage`).
  - `mor.css`: CSS keyframe choreography (`morBreathingBob`, `morReadingSway`, `morCelebrateBounce`, `morThinkingTilt`, `morBubblePop`) with full `prefers-reduced-motion` and `[data-reduced-motion="true"]` suppression.
  - `DevMorPage.tsx`: Dedicated test harness at `/dev/mor` verifying all states.
- **User Settings Support**:
  - `AppStateContext.tsx` stores `progress.mascotEnabled: boolean`.
  - When disabled in settings, `Mor` gracefully returns `null`.

---

## 4. Motion Inventory & "Document Feel" Diagnosis

### 4.1 Bundle & Asset Weight
- **Vendor & Main Bundle (`index.js`)**: 724 KB uncompressed (includes React 19, react-router v7, tanstack-query, and `framer-motion` v14.9.1).
- **Global Styles (`index.css`)**: 255 KB.
- **Mascot Images**: ~1.6 MB total across 7 PNG poses in `src/assets/mor/`.
- **Motion Tooling**: `framer-motion` (`^14.9.1`) is already installed; lightweight CSS animations are preferred for continuous loops to prevent JS thread overhead.

### 4.2 Baseline Screenshots Captured
Automated screenshots of key routes before redesign have been captured and saved to [`qa/motion-before/`](file:///C:/Users/MAYSAMALI%20MASU/Projects/samvidhan-ui/qa/motion-before/):
- **Desktop (1440 × 900)**:
  - `desktop_home.png`
  - `desktop_learn.png`
  - `desktop_constitution.png`
  - `desktop_ask.png`
  - `desktop_how_it_works.png`
  - `desktop_design_principles.png`
  - `desktop_auth_dashboard.png`
  - `desktop_auth_profile.png`
  - `desktop_auth_progress.png`
  - `desktop_auth_settings.png`
- **Mobile (390 × 844)**:
  - `mobile_home.png`
  - `mobile_learn.png`
  - `mobile_constitution.png`
  - `mobile_ask.png`
  - `mobile_how_it_works.png`
  - `mobile_design_principles.png`
  - `mobile_auth_dashboard.png`
  - `mobile_auth_profile.png`
  - `mobile_auth_progress.png`
  - `mobile_auth_settings.png`

### 4.3 Why the Site Currently Feels Like "Scrolling a Document"
1. **Vertical Monotony**:
   - `HomePage.tsx` stacks 7 vertical sections, each featuring an identical layout: section eyebrow, large heading, long 2–3 line descriptive paragraph, and a flat grid or card list.
   - There is no horizontal card rail or swipe carousel (Coursera / Varsity style) with snap scrolling.
2. **Underutilized Mascot**:
   - Mor currently appears on the landing page only as an avatar in a static card badge (`hero-mor-badge`), rather than an interactive companion with eye-tracking/pointer reaction, speech bubbles, and quick-action choice chips.
3. **Lack of Instant Interactivity**:
   - A visitor cannot "touch and try" anything without navigating away or signing up. There is no tap-to-flip "Did you know?" citizen rights card, no 1-question interactive sample quiz, and no live progress ticker demo.
4. **Desktop/Mobile Nav Uniformity**:
   - On mobile, the experience relies on a top hamburger menu; adding a persistent bottom tab bar (`Home`, `Learn`, `Ask`, `Search`, `Me`) instantly converts the feel into a native learning application.

---

## 5. Short List of Problems to Address

1. **Problem 1 (Social Links)**: The footer and mobile drawer feature X, Instagram, and YouTube, with generic links.
   - *Fix in M1*: Create `src/config/links.ts` using owner inputs (`GITHUB_URL`, `LINKEDIN_URL`, `CONTACT_EMAIL`), prune `SocialIcons.tsx` to only LinkedIn and GitHub with $\ge 44\text{px}$ touch targets and `rel="noopener noreferrer"`.
2. **Problem 2 (Mascot Presence)**: The landing hero lacks a dynamic mascot greeting with quick-choice chips.
   - *Fix in M2*: Mount interactive `Mor` in Hero with speech bubble offering 3 quick choices ("Learn the Constitution", "Know my rights", "Ask a question").
3. **Problem 3 (Document-like Layout)**: Course list and learning tracks are static vertical grids.
   - *Fix in M2*: Implement horizontal scroll-snap carousels with swipe controls, progress pills, and loading skeletons.
4. **Problem 4 (Missing Tap-to-Try Interactivity)**: No pre-login engagement widget.
   - *Fix in M2*: Add an interactive "Citizen Right of the Day" flip card and a 1-tap interactive knowledge check on the landing page.
5. **Problem 5 (Mobile App Feel)**: Mobile view needs seamless app navigation.
   - *Fix in M2*: Enhance `MobileTabBar` with active indicators, haptic-like button states, and quick access.

---

## 6. Deliverable Verification
- Link audit specification: [`qa/link-audit.spec.ts`](file:///C:/Users/MAYSAMALI%20MASU/Projects/samvidhan-ui/qa/link-audit.spec.ts)
- Full inventory table: [`qa/LINK_AUDIT.md`](file:///C:/Users/MAYSAMALI%20MASU/Projects/samvidhan-ui/qa/LINK_AUDIT.md)
- Before screenshots: [`qa/motion-before/`](file:///C:/Users/MAYSAMALI%20MASU/Projects/samvidhan-ui/qa/motion-before/)
- Stage M0 is complete. Awaiting user approval ("continue") to proceed to Stage M1.
