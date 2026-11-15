# Architecture and Implementation Decisions

## D1: Worktree & Branch Isolation
- **Decision**: Created an isolated worktree/clone at `C:\Users\MAYSAMALI MASU\Projects\samvidhan-ui-polish` directly branched from `origin/main` named `ui-polish`.
- **Reason**: The user explicitly requested: "Create a new branch from `main` named `ui-polish`. Do not work on any older branch. If an older branch has useful small fixes, copy only those, never whole rewritten pages."

## D2: Strict Mobile Media Query Containment
- **Decision**: All mobile-specific CSS overrides are scoped within `@media (max-width: 767px)` or inside mobile-specific components (`MobileTabBar`, mobile drawer overlay). Shared styles only modify variables or add non-destructive tokens.
- **Reason**: Desktop layout and styling must be preserved and polished without any breaking refactors.

## D3: Touch Target Sizing (WCAG 2.2 AA & Apple HIG 44x44pt)
- **Decision**: All interactive buttons, nav links, chips, and toggles on mobile enforce `min-height: 44px; min-width: 44px;` (48px for primary CTA buttons).
- **Reason**: Apple HIG (`accessibility.md › Mobility › Offer sufficiently sized controls`) mandates minimum 44x44pt touch targets on iOS/mobile to avoid mis-taps.

## D4: Full-Screen Mobile Navigation Drawer
- **Decision**: When the hamburger menu opens on mobile, `.mobile-drawer-overlay` covers `100dvh` with `z-index: 1000`, and `.floating-navbar-container.drawer-is-open` elevates the stacking context above the bottom tab bar.
- **Reason**: Resolves defects where the bottom tab bar occluded drawer options, cutting off the Theme toggle and Log out buttons.

## D5: Carousel Auto-Advance with Tactile Pause
- **Decision**: In `CourseSnapRail.tsx`, the learning tracks carousel automatically advances every 4.0s when in view, but pauses for 5.5s upon any touch, click, swipe, or hover.
- **Reason**: Fulfills the user request ("cards should auto moves in carousel") while preserving user control.

## D6: Global Route Scroll Restoration
- **Decision**: Added `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` on `location.pathname` change in `SiteLayout.tsx` and tap-to-top on `MobileTabBar.tsx`.
- **Reason**: In SPAs without scroll restoration, scrolling down on one page preserves `scrollY` across navigation, dumping users at the footer of subsequent pages.

## D7: Mobile Swipe-Only Carousel Navigation
- **Decision**: Arrow buttons (`.carousel-nav-arrows`, `.carousel-arrow-btn`, `.codex-arrow-btn`, `.quote-nav-btn`, `.rail-nav-btn`) are hidden (`display: none !important;`) on mobile screens (`@media (max-width: 768px)`), leaving touch swipe and auto-advance as the exclusive navigation mechanism on phones while retaining desktop arrows. Added touch swipe handling to `QuoteCard.tsx` matching `HeroCodexCard.tsx` and `SituationsCarousel.tsx`.
- **Reason**: User requested: "card carousel should only have swipe option no button to move left or right in mobile".

## D8: Mobile Chat & Learn Layout Text Wrap Containment
- **Decision**: 
  1. Converted `AskPage` input to a streamlined native auto-growing textarea and set `height: 100dvh` flex-column architecture so the messages area scrolls smoothly without cutting off.
  2. Fixed `.curriculum-pill-tabs` on `/learn` to horizontally scroll (`overflow-x: auto`) and gave `.learn-layout` `grid-template-columns: minmax(0, 1fr)` with `min-width: 0` safety.
- **Reason**: User requested: "the ui of learn and ask chat on mobile is broken text didn't fit in it". Resolves 51 text blowout / horizontal overflow issues on small phone screens (360px - 412px).

## D9: Realistic Torn & Burnt Parchment Codex Reveal with Tap-to-Restore
- **Decision**: Upgraded the codex reveal with realistic jagged paper deckling (`torn-edge-svg`), charred ash tint (`page-char-tint`), an active glowing ember fire seam (`ember-fire-glow-line`), and floating ash sparks (`burn-sparks`). Clicking triggers a 3D curling tear animation (`perspective(1000px) rotateX(24deg) rotateZ(-12deg) translateY(-115%) scale(0.9)`) with fire flare, revealing the underlying constitutional safeguard. Clicking again restores the parchment smoothly back into place.
- **Reason**: User requested: "no the animation should be more interesting and realistic it's still doesn't looks good more like the page burn or torn when i click it and restore when i click again".

## D10: 2x2 Segment Layout for Curriculum Category Filters on Mobile
- **Decision**: On mobile screens (`max-width: 640px`), `.curriculum-pill-tabs` transforms into a clean 2x2 grid (`grid-template-columns: 1fr 1fr; gap: 6px`) displaying `[All] [Foundations]` and `[Citizen Rights] [Everyday Law]` side-by-side with centered labels and active state styling.
- **Reason**: User requested: "if all things in learning aren't fitting like all,everday law than do something to fix that". Guarantees 100% visibility for "Everyday Law" without horizontal scroll truncation.

## D11: High-Frequency Grounded Citizen Queries for Chatbot
- **Decision**: Configured the 6 most frequently asked practical legal queries in India (Police Detention Rights, FIR Refusal & Section 154/Zero FIR, RTI Filing & Section 6(1), Immediate Golden Hour Online/OTP Fraud & 1930 Helpline, Article 21 Scope, and Unlawful Tenant Eviction Safeguards) into `suggestedQuestions` and authored comprehensive, citation-backed statutory explanations in `mockStreamer.ts`.
- **Reason**: User requested: "only put those question on suggestion of chatbot that we can answer and people ask them frequently".
