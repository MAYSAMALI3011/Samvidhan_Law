# Mobile Design Reference Research: Modern Interaction Patterns

**Viewport Analyzed**: Mobile Smartphone (390 × 844, iPhone 12/13/14 class)  
**Goal**: Identify battle-tested interaction and layout patterns from the best educational, reading, and developer platforms to elevate the Samvidhan mobile experience while preserving its desktop brand identity.

---

## 1. Reference Analyses

### A. Coursera (Course & Learning Discovery)
- **Top Bar**: Extremely compact sticky navigation (52px height) containing only Brand mark, a search trigger icon, and hamburger menu. No sprawling text links.
- **Section Layout**: Horizontal carousel rows with CSS scroll-snap (`scroll-snap-type: x mandatory`). Users swipe smoothly through course recommendations without excessive vertical page stretching.
- **Progress Badges**: Mini radial or linear indicators placed in the top right of cards.
- **Detail Pages**: Sticky bottom bar housing the primary call-to-action ("Enroll Free" / "Continue Learning") with safe-area padding (`env(safe-area-inset-bottom)`).

### B. Duolingo & Khan Academy (Gamified Civic Education & Microlearning)
- **Bottom Navigation Tab Bar**: Fixed 5-tab bar at the bottom with 44×44px minimum tap targets. Always visible on core hub pages (Learn, Topics, Library, Ask, Profile).
- **Focus Mode / Lesson Player**:
  - The bottom navigation bar and top navbar are **completely hidden** during active lessons/quizzes to eliminate distraction.
  - Linear, one-task-per-screen flow with a slim top progress bar.
  - Large primary "Continue" / "Check" button pinned directly to the bottom of the viewport with safe-area padding.
  - High-contrast immediate audio-visual feedback on answers.

### C. Vercel (Marketing, Dashboard & Documentation)
- **Hierarchy & Spacing**: Uncluttered hero sections with 28–32px headlines, max-width typography, and a single prominent primary CTA button followed by a subtle secondary link.
- **Navigation Drawer**: Clean full-height overlay drawer when hamburger is tapped, with generous 48px tap targets.
- **Reading Comfort**: Documentation pages use single-column layouts with generous vertical rhythm (`1.65` line height) and crisp divider hairlines.

### D. Wikipedia Mobile (Longform Legal & Constitutional Reading)
- **Reading Width**: Optimal reading column bounded to ~65ch (`max-width: 42rem`), preventing eye strain.
- **Collapsible Accordions**: Long historical and secondary sections are collapsed by default into tap-to-expand accordions (`<details>` / summary styling) so readers aren't forced into endless scrolling.
- **Sticky Progress**: Subtle reading progress bar or compact sticky article title header when scrolling deep into text.

---

## 2. Synthesis for Samvidhan Mobile Experience

1. **Top Navbar**:
   - On screens `<= 900px`, collapse inline links and search into a clean 56px sticky header.
   - Search becomes a quick-tap magnifying icon that opens the command palette / search sheet.
2. **Bottom Tab Bar**:
   - 64px height with safe-area inset support (`padding-bottom: max(8px, env(safe-area-inset-bottom))`).
   - Hide the floating `AskSamvidhanLauncher` on mobile screens so it never covers the 5th tab ("Log in").
   - Automatically hide the tab bar inside the interactive `LessonPlayer` and when mobile software keyboards open.
3. **Double Scrollbar Elimination**:
   - Remove `overflow-x: hidden` from `body`. Use `overflow-x: clip; overflow-y: visible;` on `body` and manage vertical scrolling exclusively on `html`.
4. **Hero & Cards**:
   - Stack the home hero cleanly with 30px headline and full-width primary CTA.
   - Shrink `.hero-codex-card` from rigid `min-height: 480px` to responsive `min-height: auto`.
5. **Touch & Form Accessibility**:
   - Every button, tab, and clickable control must meet the 44×44px touch target guideline.
   - All text inputs set to `font-size: 16px` to prevent iOS automatic zoom on focus.
