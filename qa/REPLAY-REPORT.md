# CARD REPLAY BUG FIX & LANDING PAGE BURN VARIANT REPORT

**Branch**: `tear-burn-cards`  
**Date**: November 15, 2026  
**Status**: ✅ ALL 10-CYCLE, 30-CYCLE, AND ROBUSTNESS TESTS PASSED CLEANLY

---

## 1. Root Causes Found

1. **Card Pointer-Events Lockout**:
   - In `FlipCard.tsx`, the `handlePointerDown` function previously guarded with `if (cardState !== 'idle' && cardState !== 'tearing') return`. Once the card entered `cardState === 'revealed'`, clicks on the card body were completely ignored. Users who clicked or tapped anywhere outside the small restore button perceived the card as permanently frozen.
2. **Controlled State Desynchronization**:
   - In parent components (`InteractiveLab.tsx` and `LessonCardStage.tsx`), `isFlipped` was managed as controlled state but was not properly reset when the card executed a restore/rewind transition. The parent state remained `isFlipped === true`, blocking subsequent flip/burn requests.
3. **Restrictive Hardware Concurrency Fallback**:
   - The low-end fallback logic checked `navigator.hardwareConcurrency <= 4`, which mistakenly categorized standard modern 4-core laptops and smartphones as low-end devices, bypassing the burn animation with a flat 250ms opacity crossfade.
4. **Landing Page Card Variant Routing**:
   - `InteractiveLab.tsx` was configured with `searchParams.get('variant') === 'burn' ? 'burn' : 'tear'`, defaulting to `'tear'` in the absence of URL search parameters.
5. **Watchdog Safety & Interruption Gaps**:
   - The animation state machine previously lacked an explicit watchdog timeout fallback (`expectedDuration + 1000ms`), leaving the card vulnerable to edge-case lockups if a frame or animation promise failed to resolve.

---

## 2. Targeted Fixes Implemented

1. **Universal Whole-Card Tap-to-Restore**:
   - Added `handleUnderlayClick` to the answer underlay container and updated `.flip-card-underlay.is-active` with `cursor: pointer`. Clicking or tapping anywhere on the revealed answer card immediately triggers the restoration sequence.
2. **Parent State Reset Synchronization**:
   - Updated `InteractiveLab.tsx` to maintain controlled `isCardFlipped` and wire `onFlipChange={setIsCardFlipped}` so that when the card restores to question view, the parent state returns cleanly to `false`.
   - Updated `LessonCardStage.tsx` with `onFlipChange={setIsDidYouKnowFlipped}` and added key-based reset `<FlipCard key={`did-you-know-${card.id || cardIndex}`} />` so moving between cards automatically unmounts and starts cleanly in `state-idle`.
3. **Low-End Fallback Refinement**:
   - Removed `navigator.hardwareConcurrency <= 4`. Fallback to 250ms crossfade now strictly applies only when `navigator.deviceMemory <= 2` (when defined) or when the user has `prefers-reduced-motion: reduce` enabled.
4. **Landing Page Burn Activation & Dev Query Overrides**:
   - Updated `InteractiveLab.tsx` so the Home "Try it" card uses `variant="burn"` by default.
   - Preserved `variant="tear"` on all lesson cards in `LessonCardStage.tsx`.
   - Added dev query parameters `?fx=burn` or `?fx=tear` (via `import.meta.env.DEV`) to force variants globally across all cards, and maintained `?fxslow=4` for inspection.
5. **Clean State Machine Reset & Safety Timer**:
   - Created `resetToCleanIdle()` to cancel all active animation frames, reset CSS variables and progress to 0, wipe orphan embers and smoke particles from the DOM, and return `cardState` to `'idle'`.
   - Added a hard safety watchdog timer (`duration + 1000ms`) ensuring the card always transitions out of intermediate states even if browser focus is lost.
   - Forgiving mid-animation interruptions: tapping or pressing restore mid-animation safely settles immediately into clean interactive idle.
6. **Dynamic Hint Text**:
   - Enforced exactly one hint at bottom center: `"Click to burn the page"` (mouse) / `"Tap to burn the page"` (touch) on burn cards, and `"Click to tear the page"` / `"Tap to tear the page"` on tear cards.

---

## 3. Test Results & Proof

### 3.1 10-Cycle Replay Verification
- **Phone Dark (390x844)**:
  - Home Burn Card: **10/10 cycles PASSED** (0 orphan DOM elements, 0 console errors)
  - Lesson Tear Card: **5/5 cycles PASSED** (0 orphan DOM elements, 0 console errors)
- **Phone Light (390x844)**:
  - Home Burn Card: **10/10 cycles PASSED** (0 orphan DOM elements, 0 console errors)
  - Lesson Tear Card: **5/5 cycles PASSED** (0 orphan DOM elements, 0 console errors)
- **Desktop Dark (1440x900)**:
  - Home Burn Card: **10/10 cycles PASSED** (0 orphan DOM elements, 0 console errors)
  - Lesson Tear Card: **5/5 cycles PASSED** (0 orphan DOM elements, 0 console errors)
- **Desktop Light (1440x900)**:
  - Home Burn Card: **10/10 cycles PASSED** (0 orphan DOM elements, 0 console errors)
  - Lesson Tear Card: **5/5 cycles PASSED** (0 orphan DOM elements, 0 console errors)

### 3.2 30-Cycle Stress Test (Desktop Dark, Continuous, No Page Reload)
- **Completed**: **30/30 consecutive cycles**
- **Lingering DOM Nodes**: 0 (0 expected)
- **Application Runtime / Console Errors**: 0
- **Stress Test Result**: **PASSED ✅**

### 3.3 Robustness & Edge Cases
- **Theme Toggle Replay**: PASSED ✅ (revealed -> theme toggle -> restore -> idle -> repeat)
- **Window Resize Replay**: PASSED ✅ (desktop -> resize to phone -> trigger -> restore -> resize to desktop -> repeat)
- **Page Navigation & Back Replay**: PASSED ✅ (revealed -> navigate to `/constitution` -> back to `/` -> trigger -> restore)
- **Mid-Animation Interruption**: PASSED ✅ (trigger burn -> click card at 300ms -> smoothly settles into clean idle)
- **Lesson Card Advance Reset**: PASSED ✅ (revealed -> advance card -> new card starts cleanly in idle state)

---

## 4. Visual Evidence Artifacts

1. **Contact Sheets** (`qa/screenshots/card-fx-2/`):
   - `burn-home-phone-burn-pct000.png` through `burn-home-phone-burn-pct100.png` (0%, 25%, 50%, 75%, 100%)
   - `burn-home-phone-restore-pct025.png` through `burn-home-phone-restore-pct100.png` (25%, 50%, 75%, 100%)
   - `burn-home-desktop-burn-pct000.png` through `burn-home-desktop-burn-pct100.png` (0%, 25%, 50%, 75%, 100%)
   - `burn-home-desktop-restore-pct025.png` through `burn-home-desktop-restore-pct100.png` (25%, 50%, 75%, 100%)
2. **1x Speed Video Recording**:
   - `qa/videos/home-burn-replay-5x.webm` (Full 1x speed video recording capturing 5 consecutive burn and restore cycles in succession on the Home card).
