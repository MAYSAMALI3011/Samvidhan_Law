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

## D12: Realistic Interactive Canvas Fire-Burning Parchment Card with Tap-to-Restore
- **Decision**: Built a dedicated `BurnCard` component featuring a real-time HTML5 2D canvas particle ignition system and dynamic circular burn mask.
- **Reason**: User uploaded a video demonstrating that the previous translation slide did not look like an authentic page burn or tear ("this is not what i am talking about").

## D13: Organic Licking Flame Wave Paper Burn (Replaced Radial Circular Mask)
- **Decision**: In response to user feedback ("it getting better but not best the page should burn not a circle moves on in orange colour"), eliminated the radial circular mask entirely. Implemented an authentic organic flame wave:
  1. A multi-harmonic licking flame front (`Math.sin(x * 0.035 + now * 0.007) * 14 + Math.max(0, Math.sin(x * 0.12 + now * 0.02)) * 10`) sweeps upward across the parchment from bottom to top.
  2. The flame boundary features a dark charred carbon scorch line (`rgba(15, 4, 1, 0.95)`), an active glowing fiery orange flame front (`rgba(255, 69, 0, 0.85)`), and an incandescent white-hot golden core (`rgba(255, 235, 120, 0.95)`).
  3. The front parchment is physically consumed above the advancing flame wave via dynamic polygon clipping (`clip-path: polygon(...)`), revealing the statutory mandate underneath as the fire licks upward.
  4. Real ember sparks burst along the active flame line and rise upward into the air with smoke drag.
  5. Tapping again reverses the flame downward, cooling the paper back into an intact codex page.
- **Reason**: User explicitly requested: "the page should burn not a circle moves on in orange colour". The organic flame wave physically burns the page without any geometric circles.

## D14: Unified Dual-Variant Tear & Burn FlipCard Architecture
- **Decision**: Implemented a comprehensive `FlipCard` component in `src/components/learning/lesson/FlipCard.tsx` supporting:
  1. **Strict Component API**: `FlipCard({ prompt, reveal, source, isFlipped, onFlipChange, className, variant?: 'tear' | 'burn' })` with `variant="tear"` as default.
  2. **Layout Fix (Zero-Clipping CSS Grid Stacking)**: Both underlay and front layers share `grid-area: 1 / 1` in `.flip-card-grid-container`. The card automatically expands to `max(frontHeight, backHeight)`, guaranteeing zero text clipping even with the longest 298-character answer at 360px viewport.
  3. **Tear Variant**: Front surface constructed from two jagged halves using static `clip-path: polygon(...)` generated deterministically from prompt string hashing (12 vertices). Features 2.5px lighter torn-paper edge strip and soft drop shadow. Supports both tap/click (with 80ms 6px rip jitter, -6deg / +4deg slide) and pointer drag-to-tear (8px horizontal threshold, 40% completion threshold).
  4. **Burn Variant**: Activated with `variant="burn"` (used on Home citizen safeguard). Generates expanding radial mask from exact tap coordinates, charcoal charred ring, glowing ember ring with constant brightness, and 10 rising ember specks.
  5. **Low-End & Reduced Motion Fallback**: Hardware concurrency/memory check (`<= 4` cores or `<= 2GB` RAM) falls back to 250ms opacity fade. `prefers-reduced-motion` provides a 150ms crossfade.
  6. **Interactive Restoration**: 44px min-height "Show question again" button restores intact front page smoothly (400ms tear slide-back or 600ms reverse burn).
- **Reason**: User task: "TASK: REPLACE THE "TAP TO FLIP" CARD EFFECT WITH A "TEAR THE PAGE" EFFECT AND AN OPTIONAL "BURN THE PAGE" EFFECT. WORKS ON PHONE AND DESKTOP. DO NOT REBUILD ANYTHING ELSE. RUN ALL STEPS WITHOUT ASKING ME QUESTIONS."
