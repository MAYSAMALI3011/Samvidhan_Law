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
