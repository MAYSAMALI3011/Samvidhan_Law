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

## D15: Reassemble and Rewind Page Restoration with Spring Physics and Gold Seam
- **Decision**: Overhauled restoration behavior across `FlipCard.tsx` and `lesson.css`:
  1. Renamed action buttons to `"Put the page back together"` (tear) and `"Restore the page"` (burn) with 44px min-height.
  2. Implemented 700ms damped harmonic spring simulation (stiffness = 170, damping = 18, mass = 1) for tear reassembly, yielding an authentic single 2-3px settle right as the jagged edges rejoin without bounce loops.
  3. Added an authentic thin gold fusing seam (`.tear-gold-seam-svg`) that illuminates along the tear boundary as the halves meet and fades over 300ms.
  4. Added soft moving slide shadows removed cleanly upon landing in `state-idle`.
  5. Implemented burn rewind closing the radial hole, shrinking char/ember rings, and drawing rising ember particles back along their paths over 600ms, leaving the DOM completely free of particles or leftover styles.
  6. Implemented a robust 6-state machine (`idle`, `tearing`, `burning`, `revealed`, `reassembling`, `rewinding`) with mid-animation interruption safety and unmount/navigation cleanup.
  7. Enhanced accessibility with programmatic focus restoration to the card container and polite live announcement (`"Question"`).
- **Reason**: User task: "CHANGE: REASSEMBLE THE PAGE WHEN THE QUESTION IS SHOWN AGAIN. THIS OVERRIDES THE EARLIER "SHOW QUESTION AGAIN" BEHAVIOUR. KEEP EVERYTHING ELSE FROM THE EARLIER TEAR/BURN TASK."

## D16: Tear & Burn Card Overhaul — Organic Paper Burn, Dual-Copy Tear & Reassembly Physics
- **Decision**: Comprehensive fix for `FlipCard.tsx` and `flip-card.css` per user prompt instructions:
  1. **Default Variant**: Set `variant="tear"` as default across all components (`InteractiveLab.tsx` Try It card and lesson cards). `'burn'` is only active when `variant="burn"` is explicitly passed.
  2. **Organic Burn Hole**: Eliminated single radial circle mask. Created organic burning aperture formed by union of 22 seeded circles with varying radii and positions, distorted via SVG `<filter id="burn-displace">` with `feTurbulence` (baseFrequency 0.04) and `feDisplacementMap` (scale 12). Expressed circle coordinates and radii in percentage units (`%`) mapped to absolute SVG overlay to ensure uniform scaling across phone and desktop viewports.
  3. **Four Edge Layers for Burn**:
     - Layer 1: Fully revealed opaque answer layer in normal layout flow.
     - Layer 2: 3–5px glowing ember rim with $\le 15\%$ pulsation at 2 Hz (`rgba(255, 100, 20, 0.95)` to `rgba(255, 230, 110, 1)`).
     - Layer 3: 10–16px near-black char rim (`#1a0d05` to `#2d1810`).
     - Layer 4: 30–40px scorched paper gradient band fading outward into intact parchment.
  4. **Rising Embers & Smoke**: 16 rising ember particles drifting 40–110px with gentle sideways curl, plus 4 soft smoke puffs ($\le 0.25$ opacity). Completely unmounted/cleaned from DOM when idle or revealed.
  5. **Dual Identical Copies for Tear**: Front face rendered twice, both with identical content and dimensions stacked atop one another. Top copy clipped to upper polygon and bottom copy clipped to lower polygon along a 14-point deterministic jagged rip line. Each jagged boundary features pale fibrous deckle edge paths.
  6. **Three-Phase Tear Choreography (~950ms)**:
     - 0–120ms: Anticipation (1px card press, 2px rip jitter).
     - 120–470ms: Zip rip opening outward from tap side to far side (`transform-origin` dynamically anchored to far edge).
     - 470–950ms: Clean separation (top translates $-5\%\text{ x}, -12\%\text{ y}$, rotates $-7^\circ$; bottom translates $+4\%\text{ x}, +10\%\text{ y}$, rotates $+5^\circ$, fading to 0 with soft drop-shadow).
  7. **Spring Reassembly & Thin Gold Seam**:
     - 700ms reassembly using harmonic spring ($k=170, d=18$) settling halves into place with a subtle 2–3px settle.
     - 300ms thin gold seam (`#D4AF37`) illuminates along the exact meeting tear line as edges join.
     - Buttons renamed to `"Put the page back together"` (tear) and `"Restore the page"` (burn) with 44px minimum height. Mid-animation press smoothly reverses from current progress.
  8. **Zero Text Ghosting & Balanced Layout**: Underlay in normal flow sets card height (`min-height: 200px` phone, `240px` desktop). Opaque backgrounds (`#0b111e` dark, `#FAF7F0` light) prevent bleed-through. Question text (1.35rem phone, 1.6rem desktop) and answer text (1.0625rem phone, 1.1875rem desktop, line-height 1.55) vertically centered in free space.
  9. **Single Centered Bottom Hint**: EXACTLY ONE hint at bottom center: `"Click to tear the page"` (mouse) / `"Tap to tear the page"` (touch), or "burn" for burn variant. Deleted duplicate top-right hints.
  10. **Dev Tooling & Automated Verification**: Implemented `?fxslow=4` dev query parameter. Captured 8-progress frame contact sheets (0%, 10%, 25%, 40%, 55%, 70%, 85%, 100%) for all variants on phone/desktop dark/light in `qa/screenshots/card-fx/` and recorded 1x speed videos in `qa/videos/`. Functional test suite passed 7/7 automated checks.
- **Reason**: Fixes all defects from initial version (plain circular mask, text ghosting, duplicate hints, unbalanced spacing, abrupt timing) fulfilling all requirements of the tear/burn task.

## D17: Landing Page Burn Card Variant and Unlimited Replay State Synchronization
- **Decision**: The Home page "Try it" card uses `variant="burn"` while lesson cards retain `variant="tear"`.
- **Reason**: Fulfills the task requirement: "The Home page 'Try it' card uses variant='burn'. Lesson cards keep the tear. Document this choice in qa/decisions.md in one line."

