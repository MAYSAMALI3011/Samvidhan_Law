# REPLAY REPRODUCTION TEST REPORT (BEFORE FIX)

**Date**: 2026-11-15T17:15:00Z  
**Test Suite**: Sequential Replay & Interaction Verification on Home Card & Lesson Cards  
**Viewports Tested**: 390x844 (phone-dark, phone-light with touch) & 1440x900 (desktop-dark, desktop-light with fine pointer)

---

## 1. Summary of Identified Defects & Failures

### Defect 1: Clicking / Tapping Empty Card Area Fails to Restore
- **Observed Behavior**: In `state-revealed`, clicking or tapping the empty space or text of the answer card does NOT trigger restoration (`Classes after clicking empty card area: flip-card-perspective-container interactive-lab-card is-tear-variant state-revealed`, `Did it return to idle? false`). Users naturally tap anywhere on the revealed card to flip/restore it, but only clicking the exact 44px `.flip-restore-btn` registered. Because tapping the card body did nothing, users perceived the card as stuck and reloaded the page.
- **Root Cause**: `handlePointerDown` had an early guard `if (cardState !== 'idle' && cardState !== 'tearing') return`. When `cardState === 'revealed'`, pointer events on the card container were completely ignored.

### Defect 2: Burn Effect Not Showing on Landing Page
- **Observed Behavior**: The Home page "Try it" card defaulted to `variant="tear"`.
- **Root Cause**: In `InteractiveLab.tsx`, line 9 evaluated `const cardVariant = searchParams.get('variant') === 'burn' ? 'burn' : 'tear'`, so the landing page card was rendered with tear effect instead of burn.

### Defect 3: Hardware Concurrency Check Bypassed Burn on Normal Laptops & Phones
- **Observed Behavior**: On common mobile devices and quad-core laptops (`navigator.hardwareConcurrency <= 4`), `isLowEndDevice` evaluated to `true`, causing burn to fall back immediately to an instant 250ms opacity fade without organic turbulence, fire rims, or embers.
- **Root Cause**: The condition `(nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4)` was too aggressive.

### Defect 4: Controlled Mode State Desynchronization
- **Observed Behavior**: `InteractiveLab.tsx` and `LessonCardStage.tsx` did not maintain active `isFlipped` state synchronized with `onFlipChange`. If a caller passed controlled `isFlipped={true}`, restoring never reset the parent's state, preventing subsequent replays.

### Defect 5: Lack of Safety State Machine Guard & Interruption Handling
- **Observed Behavior**: When browser tabs lost focus or animations paused, cards could get stuck in `running` or `restoring` indefinitely without a watchdog timer.
