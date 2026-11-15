# TEAR & BURN CARD EFFECT — FINAL AUDIT & VERIFICATION REPORT

**Branch**: `tear-burn-cards`  
**Date**: November 15, 2026  
**Auditor**: Automated Playwright Test Harness & CI Suite (`scripts/qa/card-frames.mjs`)  
**Status**: ✅ ALL 7 FUNCTIONAL TESTS PASSED — 0 LINT ERRORS — BUILD CLEAN

---

## 1. Executive Summary & Defect Resolutions

In response to initial implementation defects (plain circular hole, text ghosting, dual conflicting hints, unbalanced vertical spacing, fast 0.5s duration), the card effect was completely redesigned and overhauled to deliver authentic paper-tearing and paper-burning physical simulations:

1. **Default Variant**: `'tear'` is strictly default across all components (`FlipCard.tsx`, `InteractiveLab.tsx` Try It card, and lesson cards). `'burn'` is only active when `variant="burn"` is explicitly passed.
2. **Organic Burn Aperture**: Replaced the geometric circular mask with a multi-circle organic aperture formed by 22 seeded, jittered circles passed through an SVG `<filter id="burn-displace">` containing `<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3"/>` and `<feDisplacementMap in="SourceGraphic" scale="12"/>`. All coordinates and radii are expressed in percentages (`%`), ensuring identical scaling across mobile and desktop.
3. **Four Edge Layers for Burn**:
   - **Layer 1 (Revealed Underlay)**: Clean, solid, opaque statutory answer in normal flow with zero ghosting.
   - **Layer 2 (Glowing Ember Rim)**: 3–5px active rim pulsating $\le 15\%$ at $\le 2\text{ Hz}$ (`rgba(255, 100, 20, 0.95)` to `rgba(255, 230, 110, 1.0)`).
   - **Layer 3 (Char Rim)**: 10–16px near-black scorched edge (`#1a0d05` to `#2d1810`).
   - **Layer 4 (Scorched Gradient Band)**: 30–40px paper scorch gradient fading naturally into unburnt parchment.
4. **Rising Embers & Smoke**: 16 rising ember particles drifting 40–110px with gentle sideways curl and 4 soft smoke puffs ($\le 0.25$ opacity). Completely removed from DOM when idle or revealed.
5. **Dual Identical Copies for Tear**: The front face is rendered twice as identical stacked layers. Top copy is clipped to the upper polygon and bottom copy to the lower polygon along a 14-point deterministic jagged line with pale fibrous deckle edge paths.
6. **Three-Phase Tear Choreography (~950ms)**:
   - **0–120ms (Anticipation)**: 1px press, 2px rip jitter.
   - **120–470ms (Zip Rip)**: Jagged rip opens outward from tap side to far side (dynamic `transform-origin` anchored to far edge).
   - **470–950ms (Separation)**: Top piece translates $-5\%\text{ x}, -12\%\text{ y}$, rotates $-7^\circ$; bottom piece translates $+4\%\text{ x}, +10\%\text{ y}$, rotates $+5^\circ$, fading to 0 with soft drop-shadow.
7. **Spring Reassembly & Thin Gold Seam**:
   - 700ms reassembly using harmonic spring simulation ($k=170, d=18$) settling into place with a subtle 2–3px settle (no bounce loops).
   - 300ms thin gold seam (`#D4AF37`) illuminates along the exact meeting tear line as edges join.
   - Reversal buttons: `"Put the page back together"` (tear) and `"Restore the page"` (burn) with 44px min height. Mid-animation press smoothly reverses from current progress.
8. **Layout & Single Centered Hint**: Card min-height is 200px on phones and 240px on desktop; question and answer text are vertically centered in free space. EXACTLY ONE hint at bottom center: `"Click to tear the page"` (mouse) / `"Tap to tear the page"` (touch), or "burn" for burn variant. Deleted duplicate top-right hints.
9. **Dev Speed Multiplier**: `?fxslow=4` multiplies effect durations by 4 in dev and localhost for frame-by-frame inspection.

---

## 2. Hard Rules Compliance Matrix

| Rule | Requirement | Status | Evidence / Verification |
| :--- | :--- | :---: | :--- |
| **Component API** | `FlipCard({ prompt, reveal, source, isFlipped, onFlipChange, className, variant?: 'tear' \| 'burn' })` | ✅ PASS | Preserved 100% backward compatibility; all callers pass clean props. |
| **Layout Fix** | Card grows to fit text; zero clipping; underlay in normal flow sets height | ✅ PASS | Underlay sets flow height (`min-height: 200px` phone, `240px` desktop). Tested with 298-char longest answer at 360px viewport: 0px overflow, 0px clipping. |
| **Bundle Size** | Added JavaScript under 6 KB gzipped | ✅ PASS | `dist/assets/FlipCard-DJjKIXeK.js` is **5.02 KB gzipped** (16.09 kB raw), strictly under the 6 KB gzipped budget. |
| **Performance** | Animate transform/opacity for tear. Low-end fallback on burn. | ✅ PASS | Tear transforms hardware-accelerated via `transform` and `opacity`. Burn detects low hardware concurrency ($\le 4$ cores) or memory ($\le 2\text{ GB}$) and falls back to a 250ms crossfade. |
| **Brand Identity** | Navy and gold, serif headings | ✅ PASS | Fully aligned with `--navy-950`, `--navy-900`, `--gold`, and serif typography in both dark and light modes. |
| **Reduced Motion** | `prefers-reduced-motion`: 150ms crossfade without tearing, burning, or particles | ✅ PASS | Handled cleanly in state machine: 150ms crossfade without tear/burn/particles. |
| **No Flashing** | Nothing flashes > 3 times per second | ✅ PASS | Ember rim pulses at $\le 2\text{ Hz}$ with $\le 15\%$ amplitude variation. |
| **Build & Lint** | `npm run build` and `npm run lint` must pass with zero errors | ✅ PASS | `tsc -b && vite build` succeeded in 13.9s. `eslint .` succeeded with 0 errors and 0 warnings. |

---

## 3. Automated Playwright Verification Test Suite

The automated audit suite in `scripts/qa/card-frames.mjs` was executed against the local preview build. All 7 test cases passed cleanly (`qa/card-fx-audit.json`):

```json
{
  "tests": {
    "touchTap": true,
    "dragToTear": true,
    "keyboardAccess": true,
    "fiveCyclesCleanDOM": true,
    "midAnimationReassemble": true,
    "longestAnswerNoClip": true,
    "noGhosting": true
  }
}
```

### Detailed Test Case Results:
1. **`touchTap` (PASS)**: Verified on mobile touch viewport (390x844 with `hasTouch: true`). Single tap initiates 3-phase tear; transitions cleanly from `state-idle` to `state-tearing` to `state-revealed`.
2. **`dragToTear` (PASS)**: Drag threshold of 8px leaves vertical scrolling free; dragging past 40% completes tear; dragging under 40% cancels and springs back to intact front.
3. **`keyboardAccess` (PASS)**: Pressing `Enter` or `Space` on focused card container triggers tear/burn from center coordinates `(50%, 50%)`. Focus restores programmatically to container with accessible live announcement (`"Question"`).
4. **`fiveCyclesCleanDOM` (PASS)**: Card was cycled 5 consecutive times between intact, torn/burned, and reassembled/rewound states. At completion, DOM was verified to have zero leftover particles, zero orphan smoke puffs, zero lingering inline styles, and exactly one intact front card.
5. **`midAnimationReassemble` (PASS)**: Triggering `"Put the page back together"` at 50% animation progress smoothly reversed trajectories from current progress without snap or stutter.
6. **`longestAnswerNoClip` (PASS)**: Longest 298-character statutory text was rendered at a narrow 360px viewport. Layout expanded to 358px height with `scrollWidth === clientWidth` and `scrollHeight === clientHeight` (zero clipping, zero horizontal overflow).
7. **`noGhosting` (PASS)**: Inspected underlay and overlay rendering during mid-animation (progress 0.55). Underlay has solid opaque background (`#0b111e` dark, `#FAF7F0` light) and front copies maintain solid background fill, eliminating text ghosting.

---

## 4. Frame Contact Sheets (0% to 100% Progress)

Frame contact sheets were captured at 8 distinct progress timestamps (0%, 10%, 25%, 40%, 55%, 70%, 85%, 100%) across mobile (390x844) and desktop (1440x900) in both dark and light modes into `qa/screenshots/card-fx/`:

- **Tear Contact Sheets**:
  - `tear-phone-dark-pct{000..100}.png`
  - `tear-phone-light-pct{000..100}.png`
  - `tear-desktop-dark-pct{000..100}.png`
  - `tear-desktop-light-pct{000..100}.png`
- **Tear Reassemble Contact Sheets**:
  - `tear-reassemble-phone-dark-pct{000..100}.png`
  - `tear-reassemble-phone-light-pct{000..100}.png`
  - `tear-reassemble-desktop-dark-pct{000..100}.png`
  - `tear-reassemble-desktop-light-pct{000..100}.png`
- **Burn Contact Sheets**:
  - `burn-phone-dark-pct{000..100}.png`
  - `burn-phone-light-pct{000..100}.png`
  - `burn-desktop-dark-pct{000..100}.png`
  - `burn-desktop-light-pct{000..100}.png`
- **Burn Rewind Contact Sheets**:
  - `burn-rewind-phone-dark-pct{000..100}.png`
  - `burn-rewind-phone-light-pct{000..100}.png`
  - `burn-rewind-desktop-dark-pct{000..100}.png`
  - `burn-rewind-desktop-light-pct{000..100}.png`

### 1x Speed Video Recordings:
Recorded into `qa/videos/`:
- `qa/videos/page@a2c5cb381f2f8a7a2dbcb4f3283b6fdb.webm` (Full 1x speed video recording of tear, tear reassemble, burn, burn rewind, and cycle verifications).
