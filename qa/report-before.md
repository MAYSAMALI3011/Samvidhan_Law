# Baseline Diagnostic Audit & Apple HIG Design Review (Phase 1)

**Date**: 2026-11-15  
**Branch**: `ui-polish` (branched from `origin/main`)  
**Commit**: `0d4b41a`  
**Tooling**: Playwright, axe-core, Apple HIG review lens  

---

## 1. Automated Baseline Audit Summary (`report-before.json`)

| Metric | Result (Baseline) | Target |
| :--- | :--- | :--- |
| **Viewport Overflows** (`scrollWidth > innerWidth`) | **0 instances** | 0 |
| **Occluded / Blocked Elements** (`elementFromPoint`) | **46 instances** | 0 |
| **Touch Targets < 44px (Mobile)** | **25 instances** | 0 |
| **Color Contrast Violations (< 4.5:1)** | **28 instances** | 0 |

### Key Defect Categories Identified:
1. **Occluded Elements**: Bottom tab bar (`z-index: 40`) and floating navbar (`z-index: 30`) collide with sheets and drawers; form inputs in Settings covered by floating layers.
2. **Touch Targets**: Small chevron buttons, close icons, pill filters, and settings switches below 44x44px touch bounding box.
3. **Contrast Deficiencies**: Light mode hardcoded `#94a3b8` on white card surfaces (ratio ~2.8:1); BrandMark SVG rendering white on white in light mode; Ambedkar quote text rendering `#f8fafc` on white background.
4. **Scroll Hijacking & Footer Drop**: Navigation between routes preserves scroll offset, landing users on the footer of shorter pages; eager `scrollIntoView()` on `/ask` drags page to footer.

---

## 2. Apple Design Review Findings (HIG Lens)

Evaluated against Apple Human Interface Guidelines:

1. **[accessibility.md › Mobility › Offer sufficiently sized controls]**  
   - *Finding*: Filter pills and close buttons measure ~32x28px, failing the 44x44pt touch requirement on phone viewports.
   - *Fix*: Enforce `min-height: 44px; min-width: 44px;` with centering flex layout.

2. **[accessibility.md › Vision › Strive to meet color contrast minimum standards]**  
   - *Finding*: Subtitles and meta tags styled with `#94a3b8` fail the 4.5:1 minimum contrast against `#ffffff` light backgrounds.
   - *Fix*: Use `var(--text-secondary)` resolving to `#475569` (5.2:1 contrast) in light mode and `#94a3b8` in dark mode.

3. **[tab-bars.md › Mobile (iOS, iPadOS) › Tab Bar Placement]**  
   - *Finding*: The floating Ask button sits oversized and occludes content at the bottom of pages; menu drawer cuts off right above the tab bar.
   - *Fix*: Fold Ask button cleanly into tab bar row; elevate drawer to full-height (`100dvh`, `z-index: 1000`).

4. **[toggles.md › Specifications]**  
   - *Finding*: Settings switches are undersized (< 44px tap zone) and labels wrap awkwardly on 360px viewports.
   - *Fix*: Expand switch track to minimum 52x32px with 56px minimum row height.

5. **[motion.md › Best practices]**  
   - *Finding*: Some blur animations fail to clear filter on mobile, causing stuck blur; course cards lack lively auto-advance and interactive feedback.
   - *Fix*: Animate transform/opacity with `transitionEnd: { filter: 'none' }`, add smooth 4.0s carousel auto-advance with touch-pause, and button press feedback (`scale(0.97)`).

6. **[layout.md › Visual hierarchy]**  
   - *Finding*: Desktop pages feel monotonous and lack clear hierarchy; empty dead zones on wide viewports (1440px+).
   - *Fix*: Centered 1200px container, gold radial accent glow, 8px grid spacing, and balanced two/three-column cards.

---

## 3. Next Steps
Proceed directly to **Phase 2: Fix Phone Breakage**, followed by **Phase 3 (Themes & Contrast)**, **Phase 4 (Ask Chat)**, **Phase 5 (Desktop Polish)**, **Phase 6 (Motion)**, and **Phase 7 (Final Report)**.
