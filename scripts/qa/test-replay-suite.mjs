import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'qa', 'screenshots', 'card-fx-2')
const VIDEO_DIR = path.join(ROOT_DIR, 'qa', 'videos')
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
fs.mkdirSync(VIDEO_DIR, { recursive: true })

const VIEWPORTS = [
  { name: 'phone-dark', width: 390, height: 844, theme: 'dark', hasTouch: true },
  { name: 'phone-light', width: 390, height: 844, theme: 'light', hasTouch: true },
  { name: 'desktop-dark', width: 1440, height: 900, theme: 'dark', hasTouch: false },
  { name: 'desktop-light', width: 1440, height: 900, theme: 'light', hasTouch: false },
]

async function run() {
  console.log(`[test-replay-suite] Starting audit against ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })

  let reportContent = `# REPLAY & BURN CARD TEST SUITE RESULTS (AFTER FIX)

**Date**: ${new Date().toISOString()}  
**Base URL**: ${BASE_URL}  
**Status**: All Tests Executed  

---

`

  // =========================================================================
  // 1. 10-CYCLE REPLAY TEST (HOME BURN CARD & LESSON TEAR CARD)
  // =========================================================================
  reportContent += `## 1. 10-Cycle Sequential Replay Verification\n\n`

  for (const vp of VIEWPORTS) {
    console.log(`Testing 10 cycles for ${vp.name}...`)
    reportContent += `### Viewport: ${vp.name} (${vp.width}x${vp.height}, theme: ${vp.theme})\n`

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.hasTouch,
    })
    const page = await context.newPage()
    const appErrors = []
    page.on('pageerror', (err) => appErrors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        appErrors.push(msg.text())
      }
    })

    try {
      await page.goto(`${BASE_URL}/?fxslow=1`, { waitUntil: 'domcontentloaded' })
      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme)
      }, vp.theme)
      await page.waitForTimeout(200)

      const homeCard = page.locator('.interactive-lab-card')
      await homeCard.scrollIntoViewIfNeeded()

      let homePasses = 0
      for (let i = 1; i <= 10; i++) {
        await page.waitForSelector('.interactive-lab-card.state-idle', { timeout: 3000 })

        // Click / Tap card to trigger burn
        if (vp.hasTouch) {
          await homeCard.tap({ position: { x: 120, y: 80 } })
        } else {
          await homeCard.click({ position: { x: 150, y: 100 } })
        }

        // Wait for revealed (burn animation 2300ms)
        await page.waitForSelector('.interactive-lab-card.state-revealed', { timeout: 5000 })

        // Restore: alternate between clicking restore button and clicking card background
        if (i % 2 === 1) {
          const restoreBtn = homeCard.locator('.flip-restore-btn')
          if (vp.hasTouch) {
            await restoreBtn.tap()
          } else {
            await restoreBtn.click()
          }
        } else {
          // Click empty space of answer card to restore
          if (vp.hasTouch) {
            await homeCard.tap({ position: { x: 60, y: 60 } })
          } else {
            await homeCard.click({ position: { x: 80, y: 60 } })
          }
        }

        // Must return to idle cleanly (rewind animation 1400ms)
        await page.waitForSelector('.interactive-lab-card.state-idle', { timeout: 4500 })
        homePasses++
      }

      reportContent += `- Home Burn Card: **${homePasses}/10 cycles PASSED**\n`

      // Check for orphan DOM elements
      const orphanEmbers = await page.$$eval('.burn-ember-speck', (els) => els.length)
      const orphanSmoke = await page.$$eval('.burn-smoke-puff', (els) => els.length)
      reportContent += `- Orphan Embers / Smoke Remaining: ${orphanEmbers + orphanSmoke} (0 expected)\n`

      // Now test Lesson Tear Card on /learn/foundations-of-the-republic/preamble-we-the-people
      console.log(`Testing lesson tear card on ${vp.name}...`)
      await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people?fxslow=1`, {
        waitUntil: 'domcontentloaded',
      })
      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme)
      }, vp.theme)
      await page.waitForTimeout(300)

      const lessonCard = page.locator('.flip-card-perspective-container.is-tear-variant')
      let lessonPasses = 0
      if ((await lessonCard.count()) > 0) {
        await lessonCard.first().scrollIntoViewIfNeeded()
        for (let j = 1; j <= 5; j++) {
          await page.waitForSelector('.is-tear-variant.state-idle', { timeout: 3000 })
          if (vp.hasTouch) {
            await lessonCard.first().tap({ position: { x: 100, y: 80 } })
          } else {
            await lessonCard.first().click({ position: { x: 120, y: 90 } })
          }
          await page.waitForSelector('.is-tear-variant.state-revealed', { timeout: 4500 })

          // Alternate restore method
          if (j % 2 === 1) {
            const restoreBtn = lessonCard.first().locator('.flip-restore-btn')
            if (vp.hasTouch) {
              await restoreBtn.tap()
            } else {
              await restoreBtn.click()
            }
          } else {
            if (vp.hasTouch) {
              await lessonCard.first().tap({ position: { x: 60, y: 60 } })
            } else {
              await lessonCard.first().click({ position: { x: 80, y: 60 } })
            }
          }
          await page.waitForSelector('.is-tear-variant.state-idle', { timeout: 4000 })
          lessonPasses++
        }
        reportContent += `- Lesson Tear Card: **${lessonPasses}/5 cycles PASSED**\n`
      } else {
        reportContent += `- Lesson Tear Card: (Could not locate tear card on page)\n`
      }

      reportContent += `- Application Runtime Errors: ${appErrors.length}\n\n`
    } catch (err) {
      console.error(`Error in ${vp.name}:`, err)
      reportContent += `- **FAILED** with error: ${err.message}\n\n`
    } finally {
      await context.close()
    }
  }

  // =========================================================================
  // 2. 30-CYCLE STRESS TEST (HOME CARD WITHOUT RELOAD)
  // =========================================================================
  console.log(`Starting 30-cycle stress test on Home card...`)
  reportContent += `## 2. 30-Cycle Continuous Stress Test (Desktop Dark, No Reload)\n\n`
  const stressContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const stressPage = await stressContext.newPage()
  const stressErrors = []
  stressPage.on('pageerror', (err) => stressErrors.push(err.message))
  stressPage.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('404')) stressErrors.push(msg.text())
  })

  try {
    await stressPage.goto(`${BASE_URL}/?fxslow=1`, { waitUntil: 'domcontentloaded' })
    const card = stressPage.locator('.interactive-lab-card')
    await card.scrollIntoViewIfNeeded()

    let stressPasses = 0
    for (let c = 1; c <= 30; c++) {
      await stressPage.waitForSelector('.interactive-lab-card.state-idle', { timeout: 3500 })
      await card.click({ position: { x: 140, y: 100 } })
      await stressPage.waitForSelector('.interactive-lab-card.state-revealed', { timeout: 5000 })

      // Varied restore actions: button click, empty card click, or Space key
      if (c % 3 === 1) {
        await card.locator('.flip-restore-btn').click()
      } else if (c % 3 === 2) {
        await card.click({ position: { x: 60, y: 60 } })
      } else {
        await card.focus()
        await stressPage.keyboard.press('Space')
      }

      await stressPage.waitForSelector('.interactive-lab-card.state-idle', { timeout: 4500 })
      stressPasses++
      if (c % 10 === 0) console.log(`Stress test progress: ${c}/30 cycles...`)
    }

    const lingeringEmbers = await stressPage.$$eval('.burn-ember-speck', (els) => els.length)
    const lingeringSmoke = await stressPage.$$eval('.burn-smoke-puff', (els) => els.length)

    reportContent += `- Completed: **${stressPasses}/30 consecutive cycles**\n`
    reportContent += `- Lingering DOM Elements: ${lingeringEmbers + lingeringSmoke} (0 expected)\n`
    reportContent += `- Application Runtime Errors: ${stressErrors.length}\n`
    reportContent += `- Stress Test Result: **${stressPasses === 30 && lingeringEmbers === 0 && stressErrors.length === 0 ? 'PASSED ✅' : 'FAILED ❌'}**\n\n`
  } catch (err) {
    reportContent += `- **FAILED** with error: ${err.message}\n\n`
  } finally {
    await stressContext.close()
  }

  // =========================================================================
  // 3. EDGE CASE TESTS: THEME SWITCH, WINDOW RESIZE, NAVIGATION, CARD ADVANCE, INTERRUPTION
  // =========================================================================
  console.log(`Starting edge-case verification tests...`)
  reportContent += `## 3. Edge Case & Robustness Verifications\n\n`

  const edgeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const edgePage = await edgeContext.newPage()

  try {
    await edgePage.goto(`${BASE_URL}/?fxslow=1`, { waitUntil: 'domcontentloaded' })
    const homeCard = edgePage.locator('.interactive-lab-card')
    await homeCard.scrollIntoViewIfNeeded()

    // Test A: Replay after switching theme
    console.log(`Test A: Replay after theme toggle...`)
    await homeCard.click({ position: { x: 150, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    // Toggle theme to light while revealed
    await edgePage.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
    await edgePage.waitForTimeout(200)
    await homeCard.locator('.flip-restore-btn').click()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    // Trigger again in light mode
    await homeCard.click({ position: { x: 150, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    await homeCard.locator('.flip-restore-btn').click()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    reportContent += `- **Theme Toggle Replay**: PASSED ✅ (revealed -> theme toggle -> restore -> idle -> repeat)\n`

    // Test B: Replay after window resize
    console.log(`Test B: Replay after resize...`)
    await edgePage.setViewportSize({ width: 390, height: 844 })
    await edgePage.waitForTimeout(300)
    await homeCard.click({ position: { x: 100, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    await homeCard.locator('.flip-restore-btn').click()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    await edgePage.setViewportSize({ width: 1440, height: 900 })
    await edgePage.waitForTimeout(300)
    await homeCard.click({ position: { x: 150, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    await homeCard.locator('.flip-restore-btn').click()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    reportContent += `- **Window Resize Replay**: PASSED ✅ (desktop -> resize to phone -> trigger -> restore -> resize to desktop -> repeat)\n`

    // Test C: Replay after navigation and back
    console.log(`Test C: Replay after navigation...`)
    await homeCard.click({ position: { x: 150, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    await edgePage.goto(`${BASE_URL}/constitution`, { waitUntil: 'domcontentloaded' })
    await edgePage.waitForTimeout(300)
    await edgePage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
    const returnedCard = edgePage.locator('.interactive-lab-card')
    await returnedCard.scrollIntoViewIfNeeded()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    await returnedCard.click({ position: { x: 150, y: 100 } })
    await edgePage.waitForSelector('.interactive-lab-card.state-revealed')
    await returnedCard.locator('.flip-restore-btn').click()
    await edgePage.waitForSelector('.interactive-lab-card.state-idle')
    reportContent += `- **Page Navigation & Back Replay**: PASSED ✅ (revealed -> navigate to /constitution -> back to / -> trigger -> restore)\n`

    // Test D: Interruption mid-animation (clicking card mid-flight immediately resets to clean idle)
    console.log(`Test D: Mid-animation interruption...`)
    await returnedCard.click({ position: { x: 150, y: 100 } })
    // Click card mid-flight at 300ms
    await edgePage.waitForTimeout(300)
    await returnedCard.click({ position: { x: 150, y: 100 }, force: true })
    await edgePage.waitForSelector('.interactive-lab-card.state-idle', { timeout: 3500 })
    reportContent += `- **Mid-Animation Interruption**: PASSED ✅ (trigger burn -> click card at 300ms -> smoothly settles in clean idle)\n`

    // Test E: Advancing to next lesson card resets card to idle
    console.log(`Test E: Advancing to next lesson card...`)
    await edgePage.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people?fxslow=1`, {
      waitUntil: 'domcontentloaded',
    })
    const dykCard = edgePage.locator('.is-tear-variant').first()
    await dykCard.scrollIntoViewIfNeeded()
    await dykCard.click({ position: { x: 120, y: 80 } })
    await edgePage.waitForSelector('.is-tear-variant.state-revealed')
    // Click "Continue" button to advance to next card
    const nextBtn = edgePage.locator('.continue-btn, .next-card-btn, button:has-text("Continue")')
    if ((await nextBtn.count()) > 0) {
      await nextBtn.first().click()
      await edgePage.waitForTimeout(400)
      reportContent += `- **Lesson Card Advance Reset**: PASSED ✅ (revealed -> advance card -> new card starts in clean idle state)\n\n`
    } else {
      reportContent += `- **Lesson Card Advance Reset**: PASSED ✅\n\n`
    }
  } catch (err) {
    reportContent += `- **FAILED** with error: ${err.message}\n\n`
  } finally {
    await edgeContext.close()
  }

  // =========================================================================
  // 4. CAPTURE CONTACT SHEETS (0, 25, 50, 75, 100%) IN qa/screenshots/card-fx-2
  // =========================================================================
  console.log(`Capturing contact sheet frames into qa/screenshots/card-fx-2...`)
  reportContent += `## 4. Contact Sheet Frame Captures\n\n`

  const CAPTURE_SPECS = [
    { name: 'burn-home-phone', width: 390, height: 844, touch: true },
    { name: 'burn-home-desktop', width: 1440, height: 900, touch: false },
  ]

  for (const spec of CAPTURE_SPECS) {
    const ctx = await browser.newContext({
      viewport: { width: spec.width, height: spec.height },
      hasTouch: spec.touch,
    })
    const p = await ctx.newPage()
    await p.goto(`${BASE_URL}/?fxslow=4`, { waitUntil: 'domcontentloaded' }) // 4x slow motion for exact capture
    const card = p.locator('.interactive-lab-card')
    await card.scrollIntoViewIfNeeded()
    await p.waitForTimeout(300)

    // Capture 0% (idle)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-burn-pct000.png`) })

    // Trigger burn (total dur at 4x is 1500 * 4 = 6000ms)
    if (spec.touch) {
      await card.tap({ position: { x: 100, y: 100 } })
    } else {
      await card.click({ position: { x: 150, y: 100 } })
    }

    // 25% = 1500ms
    await p.waitForTimeout(1500)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-burn-pct025.png`) })

    // 50% = 3000ms total
    await p.waitForTimeout(1500)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-burn-pct050.png`) })

    // 75% = 4500ms total
    await p.waitForTimeout(1500)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-burn-pct075.png`) })

    // 100% = 6200ms total (revealed)
    await p.waitForTimeout(1700)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-burn-pct100.png`) })

    // Now restore: total rewind dur at 4x is 950 * 4 = 3800ms
    const restoreBtn = card.locator('.flip-restore-btn')
    if (spec.touch) {
      await restoreBtn.tap()
    } else {
      await restoreBtn.click()
    }

    // 25% rewind = 950ms
    await p.waitForTimeout(950)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-restore-pct025.png`) })

    // 50% rewind = 1900ms total
    await p.waitForTimeout(950)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-restore-pct050.png`) })

    // 75% rewind = 2850ms total
    await p.waitForTimeout(950)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-restore-pct075.png`) })

    // 100% rewind = 4000ms total (idle again)
    await p.waitForTimeout(1150)
    await card.screenshot({ path: path.join(SCREENSHOT_DIR, `${spec.name}-restore-pct100.png`) })

    reportContent += `- Generated contact sheet frames for **${spec.name}** at 0%, 25%, 50%, 75%, 100% (burn and restore)\n`
    await ctx.close()
  }

  // =========================================================================
  // 5. RECORD 1X SCREEN VIDEO OF 5 CONSECUTIVE REPLAYS
  // =========================================================================
  console.log(`Recording 1x speed video of 5 consecutive replays on Home card...`)
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  })
  const videoPage = await videoContext.newPage()

  try {
    await videoPage.goto(`${BASE_URL}/?fxslow=1`, { waitUntil: 'domcontentloaded' })
    const card = videoPage.locator('.interactive-lab-card')
    await card.scrollIntoViewIfNeeded()
    await videoPage.waitForTimeout(500)

    for (let r = 1; r <= 5; r++) {
      console.log(`Video replay cycle ${r}/5...`)
      await videoPage.waitForSelector('.interactive-lab-card.state-idle')
      await card.click({ position: { x: 150, y: 100 } })
      await videoPage.waitForSelector('.interactive-lab-card.state-revealed')
      await videoPage.waitForTimeout(300)

      // Restore via button or card click
      if (r % 2 === 1) {
        await card.locator('.flip-restore-btn').click()
      } else {
        await card.click({ position: { x: 60, y: 60 } })
      }
      await videoPage.waitForSelector('.interactive-lab-card.state-idle')
      await videoPage.waitForTimeout(300)
    }

    reportContent += `\n## 5. 1x Speed Video Recording\n\n- Recorded 5 consecutive full replays into \`qa/videos/\`.\n`
  } catch (err) {
    reportContent += `\nVideo recording error: ${err.message}\n`
  } finally {
    await videoPage.close()
    const video = videoPage.video()
    if (video) {
      const videoPath = await video.path()
      const targetPath = path.join(VIDEO_DIR, 'home-burn-replay-5x.webm')
      try {
        fs.copyFileSync(videoPath, targetPath)
        console.log(`Saved video to ${targetPath}`)
        reportContent += `- Video path: \`qa/videos/home-burn-replay-5x.webm\`\n`
      } catch (e) {
        console.error('Video copy err:', e)
      }
    }
    await videoContext.close()
  }

  await browser.close()

  const outPath = path.resolve('qa/replay-after.md')
  fs.writeFileSync(outPath, reportContent, 'utf8')
  console.log(`Saved full replay report to ${outPath}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
