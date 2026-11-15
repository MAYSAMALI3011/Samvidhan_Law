# TEAR & BURN CARD EFFECT IMPLEMENTATION REPORT

**Branch**: `tear-burn-cards`  
**Date**: November 15, 2026  
**Auditor**: Automated Playwright Test Harness & CI Suite  

---

## 1. Executive Summary

As requested in the user prompt, the legacy 3D "Tap to Flip" card effect has been replaced with a high-fidelity **"Tear the Page"** card effect (default) and an optional **"Burn the Page"** card effect (`variant="burn"`).

Both effects work seamlessly across **phones (360px, 390px), tablets (768px), and desktops (1440px)** in both **dark and light themes**. No external packages or libraries were introduced; all implementations rely on existing CSS and framer-motion/React dependencies. The added JavaScript is **3.17 KB gzipped** (well below the 6 KB gzipped ceiling).

---

## 2. Hard Rules Compliance Matrix

| Rule | Requirement | Status | Evidence / Verification |
| :--- | :--- | :---: | :--- |
| **API** | `FlipCard({ prompt, reveal, source, isFlipped, onFlipChange, className, variant?: 'tear' \| 'burn' })` | ✅ PASS | Implemented in `FlipCard.tsx` with backward compatibility for all callers. |
| **Layout Fix** | Card must grow to fit text, zero clipping, answer layer underneath in normal flow | ✅ PASS | Uses `.flip-card-grid-container` with `grid-area: 1 / 1` stacking. Both faces share the same grid cell, making container height `max(frontHeight, backHeight)`. Tested with 298-char longest answer at 360px: 0px overflow, 0px clipping. |
| **Bundle Size** | Added JavaScript under 6 KB gzipped | ✅ PASS | `dist/assets/FlipCard-BOJyyxWi.js` is **3.17 KB gzipped** (9.30 kB raw). |
| **Performance** | Animate transform/opacity only for tearing. Low-end fallback on burn. | ✅ PASS | Tearing animates `transform` and `opacity` only. Burning detects `navigator.hardwareConcurrency <= 4 \|\| navigator.deviceMemory <= 2` and falls back to a 250ms opacity fade. |
| **Brand Identity** | Keep navy and gold look, serif headings | ✅ PASS | Preserved `--navy-950`, `--navy-900`, `--gold`, and serif headings in both dark and light modes. |
| **Reduced Motion** | `prefers-reduced-motion`: 150ms crossfade without tearing, burning, or particles | ✅ PASS | Handled with CSS media query and JavaScript check: immediately crossfades in 150ms without tear/burn/particles. |
| **No Flashing** | Nothing flashes > 3 times per second | ✅ PASS | Constant luminosity on ember drop-shadow; ember specks fade smoothly over 900ms. |
| **Build & Lint** | `npm run build` and `npm run lint` must pass with zero errors | ✅ PASS | Both exit code 0, 0 errors, 0 warnings. |

---

## 3. Variant Specifications & Interactions

### 3.1 Tear Variant (`variant="tear"` — Default)
- **Front Surface**: Navy/parchment surface with subtle CSS radial/linear gradient texture (`background-size: 10px 10px, 100% 100%`).
- **Jagged Tear Line**: Deterministic pseudo-random algorithm seeded by string hashing `prompt` generates 12 points along an authentic diagonal tear line (48% to 52% Y).
- **Edge Deckling**: A 2.5px lighter torn-paper edge strip (`rgba(255, 255, 255, 0.65)`) along the jagged line on both halves, paired with soft drop shadows (`filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35))`).
- **Interactions**:
  - **Tap / Click**: Initiates an 80ms "rip" jitter (6px micro-vibration), followed by top half sliding up-left (`translate(-14%, -24%) rotate(-6deg)`) and bottom half sliding down-right (`translate(14%, 24%) rotate(4deg)`) over 650ms while fading to 0 opacity.
  - **Drag to Tear**: Pointer tracking claims the gesture only after an 8px horizontal threshold (leaving vertical page scrolling unimpeded). Progress smoothly tracks the finger/mouse; releasing past 40% completes the tear, while releasing earlier springs back.
  - **Desktop Hover**: Displays a subtle dashed gold tear guide line and lifts the card 2px (`transform: translateY(-2px)`).
  - **Answer Page**: Displays "The answer" badge, statutory text, source attribution, and a min-44px "Show question again" button that slides both halves back in over 400ms.

### 3.2 Burn Variant (`variant="burn"`)
- **Ignition Point**: Begins at the exact client tap/click coordinates `(burnOrigin.x, burnOrigin.y)` (or card center on keyboard activation).
- **Radial Mask**: Growing circular mask (`--burn-r` from 0% to 150%) over 1000ms ease curve.
- **Char & Ember Rings**: Charcoal black scorch ring (`#1a0d05`, 6px stroke) and glowing orange ember ring (`#ff5a1f`, 3.5px stroke with constant brightness `drop-shadow(0 0 6px rgba(255,100,0,0.8))`).
- **Ember Specks**: 10 rising ember specks drift upward 40-80px and fade smoothly over 900ms, then unmount from DOM.
- **Restoring**: Tapping "Show question again" reverses the burn over 600ms back to the intact front parchment.

---

## 4. Automated Playwright Audit Results

### 4.1 Cross-Device & Theme Audit

| Viewport | Dimensions | Theme | Tear Card Rendered | Horizontal Overflow | Text Clipped |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **phone-360** | 360 x 740 | Dark | ✅ Yes | ❌ None | ❌ None |
| **phone-360** | 360 x 740 | Light | ✅ Yes | ❌ None | ❌ None |
| **phone-390** | 390 x 844 | Dark | ✅ Yes | ❌ None | ❌ None |
| **phone-390** | 390 x 844 | Light | ✅ Yes | ❌ None | ❌ None |
| **tablet-768** | 768 x 1024 | Dark | ✅ Yes | ❌ None | ❌ None |
| **tablet-768** | 768 x 1024 | Light | ✅ Yes | ❌ None | ❌ None |
| **desktop-1440** | 1440 x 900 | Dark | ✅ Yes | ❌ None | ❌ None |
| **desktop-1440** | 1440 x 900 | Light | ✅ Yes | ❌ None | ❌ None |

### 4.2 Longest Answer Audit at 360px Viewport
- **Test Content**: Unit 1 Card 1 Did-You-Know answer (*Master calligrapher Prem Behari Narain Raizada...*, 298 characters).
- **Container Height**: `465px`
- **Underlay Height**: `465px` (Matched: `true`)
- **Text Scroll Height vs Client Height**: `276px` vs `276px` (Zero Clipped: `true`)
- **Restore Button Height**: `59px` (Meets >= 44px WCAG / Apple HIG requirement)

### 4.3 Interaction Test Results
- `tearTap`: ✅ Verified (80ms rip jitter + 650ms parting)
- `tearDrag`: ✅ Verified (8px claim threshold, 40% complete threshold)
- `tearRestore`: ✅ Verified (400ms slide-back on "Show question again")
- `burnTap`: ✅ Verified (1000ms radial burn from tap point)
- `burnRestore`: ✅ Verified (600ms reverse burn on "Show question again")

---

## 5. Verification Screenshots (390x844)

The 8 required screenshots were captured during live animation and saved to `qa/screenshots/tear-burn/`:

### Tear Variant (`variant="tear"`)
1. **0% (Intact)**: `qa/screenshots/tear-burn/tear-0-intact.png` (74.4 KB)
2. **30% (Mid-Tear)**: `qa/screenshots/tear-burn/tear-30-mid.png` (153.5 KB)
3. **60% (Almost Open)**: `qa/screenshots/tear-burn/tear-60-almost.png` (145.6 KB)
4. **100% (Revealed)**: `qa/screenshots/tear-burn/tear-100-revealed.png` (130.0 KB)

### Burn Variant (`variant="burn"`)
1. **0% (Intact)**: `qa/screenshots/tear-burn/burn-0-intact.png` (60.9 KB)
2. **30% (Mid-Burn)**: `qa/screenshots/tear-burn/burn-30-mid.png` (188.4 KB)
3. **60% (Almost Open)**: `qa/screenshots/tear-burn/burn-60-almost.png` (143.0 KB)
4. **100% (Revealed)**: `qa/screenshots/tear-burn/burn-100-revealed.png` (107.9 KB)

---

## 6. Build and Linter Status
- **Linter**: `npm run lint` → 0 errors, 0 warnings (Exit code 0).
- **Build**: `npm run build` → 2828 modules transformed, built in 15.97s (Exit code 0).
