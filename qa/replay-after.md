# REPLAY & BURN CARD TEST SUITE RESULTS (AFTER FIX)

**Date**: 2026-11-15T18:29:56.300Z  
**Base URL**: http://localhost:4173  
**Status**: All Tests Executed  

---

## 1. 10-Cycle Sequential Replay Verification

### Viewport: phone-dark (390x844, theme: dark)
- Home Burn Card: **10/10 cycles PASSED**
- Orphan Embers / Smoke Remaining: 0 (0 expected)
- Lesson Tear Card: **5/5 cycles PASSED**
- Application Runtime Errors: 0

### Viewport: phone-light (390x844, theme: light)
- Home Burn Card: **10/10 cycles PASSED**
- Orphan Embers / Smoke Remaining: 0 (0 expected)
- Lesson Tear Card: **5/5 cycles PASSED**
- Application Runtime Errors: 0

### Viewport: desktop-dark (1440x900, theme: dark)
- Home Burn Card: **10/10 cycles PASSED**
- Orphan Embers / Smoke Remaining: 0 (0 expected)
- Lesson Tear Card: **5/5 cycles PASSED**
- Application Runtime Errors: 0

### Viewport: desktop-light (1440x900, theme: light)
- Home Burn Card: **10/10 cycles PASSED**
- Orphan Embers / Smoke Remaining: 0 (0 expected)
- Lesson Tear Card: **5/5 cycles PASSED**
- Application Runtime Errors: 0

## 2. 30-Cycle Continuous Stress Test (Desktop Dark, No Reload)

- Completed: **30/30 consecutive cycles**
- Lingering DOM Elements: 0 (0 expected)
- Application Runtime Errors: 0
- Stress Test Result: **PASSED ✅**

## 3. Edge Case & Robustness Verifications

- **Theme Toggle Replay**: PASSED ✅ (revealed -> theme toggle -> restore -> idle -> repeat)
- **Window Resize Replay**: PASSED ✅ (desktop -> resize to phone -> trigger -> restore -> resize to desktop -> repeat)
- **Page Navigation & Back Replay**: PASSED ✅ (revealed -> navigate to /constitution -> back to / -> trigger -> restore)
- **Mid-Animation Interruption**: PASSED ✅ (trigger burn -> click card at 300ms -> smoothly settles in clean idle)
- **Lesson Card Advance Reset**: PASSED ✅ (revealed -> advance card -> new card starts in clean idle state)

## 4. Contact Sheet Frame Captures

- Generated contact sheet frames for **burn-home-phone** at 0%, 25%, 50%, 75%, 100% (burn and restore)
- Generated contact sheet frames for **burn-home-desktop** at 0%, 25%, 50%, 75%, 100% (burn and restore)

## 5. 1x Speed Video Recording

- Recorded 5 consecutive full replays into `qa/videos/`.
- Video path: `qa/videos/home-burn-replay-5x.webm`
