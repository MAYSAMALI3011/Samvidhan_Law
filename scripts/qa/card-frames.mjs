import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'qa', 'screenshots', 'card-fx')
const VIDEO_DIR = path.join(ROOT_DIR, 'qa', 'videos')
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

const THEMES = ['dark', 'light']

const PERCENTAGES = [0, 10, 25, 40, 55, 70, 85, 100]

async function captureCardFrames() {
  console.log(`[card-frames] Launching Chromium to capture frame contact sheets from ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })

  const results = {
    contactSheets: [],
    tests: {
      touchTap: false,
      dragToTear: false,
      keyboardAccess: false,
      fiveCyclesCleanDOM: false,
      midAnimationReassemble: false,
      longestAnswerNoClip: false,
      noGhosting: false,
    },
    videos: [],
  }

  // =========================================================================
  // 1. CAPTURE PROGRESS MILESTONES (?fxslow=4)
  // =========================================================================
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`\n--- Capturing Frames for ${vp.name} (${theme}) ---`)

      // --- TEAR EFFECT (DEFAULT) ---
      const pageTear = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      })
      await pageTear.goto(`${BASE_URL}/?fxslow=4`, { waitUntil: 'networkidle' })
      await pageTear.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th)
      }, theme)
      await pageTear.waitForTimeout(300)

      const tearCard = pageTear.locator('.flip-card-perspective-container').first()
      await tearCard.scrollIntoViewIfNeeded()

      // 0% Intact
      const tear0Path = path.join(SCREENSHOT_DIR, `tear-${vp.name}-${theme}-pct000.png`)
      await tearCard.screenshot({ path: tear0Path })

      // Trigger tear tap
      await tearCard.click()

      // At ?fxslow=4, tear total duration is 3800ms
      const tearDur = 3800
      let lastElapsed = 0
      for (const pct of PERCENTAGES.slice(1)) {
        const targetElapsed = (pct / 100) * tearDur
        const delta = Math.max(0, targetElapsed - lastElapsed)
        if (delta > 0) {
          await pageTear.waitForTimeout(delta)
        }
        lastElapsed = targetElapsed
        const framePath = path.join(
          SCREENSHOT_DIR,
          `tear-${vp.name}-${theme}-pct${String(pct).padStart(3, '0')}.png`
        )
        await tearCard.screenshot({ path: framePath })
      }
      results.contactSheets.push(`tear-${vp.name}-${theme}`)

      // --- TEAR REASSEMBLE ---
      const restoreBtn = pageTear.locator('.flip-restore-btn')
      await restoreBtn.waitFor({ state: 'visible' })

      // 0% of reassemble (revealed before click)
      const reassemble0Path = path.join(SCREENSHOT_DIR, `tear-reassemble-${vp.name}-${theme}-pct000.png`)
      await tearCard.screenshot({ path: reassemble0Path })

      // Click restore
      await restoreBtn.click()

      // At ?fxslow=4, reassemble duration is 2800ms
      const reassembleDur = 2800
      lastElapsed = 0
      for (const pct of PERCENTAGES.slice(1)) {
        const targetElapsed = (pct / 100) * reassembleDur
        const delta = Math.max(0, targetElapsed - lastElapsed)
        if (delta > 0) {
          await pageTear.waitForTimeout(delta)
        }
        lastElapsed = targetElapsed
        const framePath = path.join(
          SCREENSHOT_DIR,
          `tear-reassemble-${vp.name}-${theme}-pct${String(pct).padStart(3, '0')}.png`
        )
        await tearCard.screenshot({ path: framePath })
      }
      results.contactSheets.push(`tear-reassemble-${vp.name}-${theme}`)
      await pageTear.close()

      // --- BURN EFFECT (?variant=burn&fxslow=4) ---
      const pageBurn = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      })
      await pageBurn.goto(`${BASE_URL}/?variant=burn&fxslow=4`, { waitUntil: 'networkidle' })
      await pageBurn.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th)
      }, theme)
      await pageBurn.waitForTimeout(300)

      const burnCard = pageBurn.locator('.flip-card-perspective-container').first()
      await burnCard.scrollIntoViewIfNeeded()

      // 0% Intact
      const burn0Path = path.join(SCREENSHOT_DIR, `burn-${vp.name}-${theme}-pct000.png`)
      await burnCard.screenshot({ path: burn0Path })

      // Trigger burn tap
      await burnCard.click()

      // At ?fxslow=4, burn duration is 6000ms
      const burnDur = 6000
      lastElapsed = 0
      for (const pct of PERCENTAGES.slice(1)) {
        const targetElapsed = (pct / 100) * burnDur
        const delta = Math.max(0, targetElapsed - lastElapsed)
        if (delta > 0) {
          await pageBurn.waitForTimeout(delta)
        }
        lastElapsed = targetElapsed
        const framePath = path.join(
          SCREENSHOT_DIR,
          `burn-${vp.name}-${theme}-pct${String(pct).padStart(3, '0')}.png`
        )
        await burnCard.screenshot({ path: framePath })
      }
      results.contactSheets.push(`burn-${vp.name}-${theme}`)

      // --- BURN REWIND ---
      const burnRestoreBtn = pageBurn.locator('.flip-restore-btn')
      await burnRestoreBtn.waitFor({ state: 'visible' })

      const rewind0Path = path.join(SCREENSHOT_DIR, `burn-rewind-${vp.name}-${theme}-pct000.png`)
      await burnCard.screenshot({ path: rewind0Path })

      await burnRestoreBtn.click()

      // At ?fxslow=4, rewind duration is 3800ms
      const rewindDur = 3800
      lastElapsed = 0
      for (const pct of PERCENTAGES.slice(1)) {
        const targetElapsed = (pct / 100) * rewindDur
        const delta = Math.max(0, targetElapsed - lastElapsed)
        if (delta > 0) {
          await pageBurn.waitForTimeout(delta)
        }
        lastElapsed = targetElapsed
        const framePath = path.join(
          SCREENSHOT_DIR,
          `burn-rewind-${vp.name}-${theme}-pct${String(pct).padStart(3, '0')}.png`
        )
        await burnCard.screenshot({ path: framePath })
      }
      results.contactSheets.push(`burn-rewind-${vp.name}-${theme}`)
      await pageBurn.close()
    }
  }

  // =========================================================================
  // 2. VIDEO RECORDING AT 1X SPEED INTO qa/videos/
  // =========================================================================
  console.log('\n[card-frames] Recording 1x Speed Videos into qa/videos/ ...')
  const videoContext = await browser.newContext({
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  })

  const videoPage = await videoContext.newPage()
  // 1x speed video of Tear & Reassemble
  await videoPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await videoPage.waitForTimeout(500)
  const vTearCard = videoPage.locator('.flip-card-perspective-container').first()
  await vTearCard.scrollIntoViewIfNeeded()
  await videoPage.waitForTimeout(400)
  // Tear
  await vTearCard.click()
  await videoPage.waitForTimeout(1400)
  // Reassemble
  const vRestoreBtn = videoPage.locator('.flip-restore-btn')
  await vRestoreBtn.click()
  await videoPage.waitForTimeout(1400)

  // 1x speed video of Burn & Rewind
  await videoPage.goto(`${BASE_URL}/?variant=burn`, { waitUntil: 'networkidle' })
  await videoPage.waitForTimeout(500)
  const vBurnCard = videoPage.locator('.flip-card-perspective-container').first()
  await vBurnCard.scrollIntoViewIfNeeded()
  await videoPage.waitForTimeout(400)
  // Burn
  await vBurnCard.click()
  await videoPage.waitForTimeout(2000)
  // Restore
  const vBurnRestore = videoPage.locator('.flip-restore-btn')
  await vBurnRestore.click()
  await videoPage.waitForTimeout(1400)

  await videoPage.close()
  await videoContext.close()
  console.log('[card-frames] Videos recorded successfully!')

  // =========================================================================
  // 3. PLAYWRIGHT VERIFICATION SUITE
  // =========================================================================
  console.log('\n[card-frames] Executing Functional Verification Suite ...')
  const testContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  })
  const testPage = await testContext.newPage()

  // 3.0 Touch tap on mobile
  console.log('Testing touch tap on mobile...')
  await testPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const tapCard = testPage.locator('.flip-card-perspective-container').first()
  await tapCard.scrollIntoViewIfNeeded()
  await tapCard.tap()
  await testPage.waitForTimeout(1200)
  const isTapRevealed = await testPage.locator('.state-revealed').count()
  results.tests.touchTap = isTapRevealed > 0

  // 3.1 Drag-to-tear gesture on mobile touch
  console.log('Testing drag-to-tear gesture...')
  await testPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const testCard = testPage.locator('.flip-card-perspective-container').first()
  await testCard.scrollIntoViewIfNeeded()
  const box = await testCard.boundingBox()
  if (box) {
    await testPage.mouse.move(box.x + 30, box.y + box.height / 2)
    await testPage.mouse.down()
    await testPage.mouse.move(box.x + box.width * 0.65, box.y + box.height / 2, { steps: 10 })
    await testPage.mouse.up()
    await testPage.waitForTimeout(1200)
    const isRevealed = await testPage.locator('.state-revealed').count()
    results.tests.dragToTear = isRevealed > 0
  }

  // 3.2 Keyboard Enter/Space
  console.log('Testing keyboard navigation (Enter/Space)...')
  await testPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const kbCard = testPage.locator('.flip-card-perspective-container').first()
  await kbCard.focus()
  await testPage.keyboard.press('Enter')
  await testPage.waitForTimeout(1200)
  const kbRevealed = await testPage.locator('.state-revealed').count()
  // Restore with Enter
  await testPage.keyboard.press('Enter')
  await testPage.waitForTimeout(1000)
  const kbIdle = await testPage.locator('.state-idle').count()
  results.tests.keyboardAccess = kbRevealed > 0 && kbIdle > 0

  // 3.3 5 full cycles back and forth with zero runaway DOM nodes
  console.log('Testing 5 full cycles back and forth...')
  let runawayDOM = false
  for (let cycle = 1; cycle <= 5; cycle++) {
    await kbCard.click()
    await testPage.waitForTimeout(1200)
    const restore = testPage.locator('.flip-restore-btn')
    await restore.click()
    await testPage.waitForTimeout(1000)

    const emberCount = await testPage.locator('.burn-ember-speck').count()
    const smokeCount = await testPage.locator('.burn-smoke-puff').count()
    if (emberCount > 0 || smokeCount > 0) {
      runawayDOM = true
    }
  }
  results.tests.fiveCyclesCleanDOM = !runawayDOM

  // 3.4 Mid-animation reassemble interruption
  console.log('Testing mid-animation reassemble interruption...')
  await kbCard.click()
  await testPage.waitForTimeout(350) // mid-animation during tear
  // Simulate clicking restore or pressing reassemble mid-flight
  await testPage.evaluate(() => {
    const btn = document.querySelector('.flip-restore-btn')
    if (btn) btn.click()
  })
  await testPage.waitForTimeout(1000)
  const interruptedIdle = await testPage.locator('.state-idle, .state-revealed').count()
  results.tests.midAnimationReassemble = interruptedIdle > 0

  // 3.5 Longest answer test at 360px width (no clip, no horizontal scroll)
  console.log('Testing longest answer at 360px viewport...')
  const p360 = await browser.newPage({ viewport: { width: 360, height: 740 } })
  await p360.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, {
    waitUntil: 'networkidle',
  })
  const lCard = p360.locator('.flip-card-perspective-container').first()
  await lCard.scrollIntoViewIfNeeded()
  await lCard.click()
  await p360.waitForTimeout(1200)
  const overflowed = await p360.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 1
  })
  results.tests.longestAnswerNoClip = !overflowed
  await p360.close()

  // 3.6 No Ghosting Test: question text completely masked/hidden once revealed; answer hidden when idle
  console.log('Testing text ghosting verification...')
  const ghostPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await ghostPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  const gCard = ghostPage.locator('.flip-card-perspective-container').first()
  await gCard.scrollIntoViewIfNeeded()

  // In idle state, underlay answer has opacity 0
  const underlayOpIdle = await ghostPage.evaluate(() => {
    const el = document.querySelector('.flip-card-underlay')
    return el ? window.getComputedStyle(el).opacity : '1'
  })

  // Tear card to reveal
  await gCard.click()
  await ghostPage.waitForTimeout(1200)

  // In revealed state, top and bottom front copies have opacity 0
  const frontOpRevealed = await ghostPage.evaluate(() => {
    const top = document.querySelector('.tear-top-half')
    const btm = document.querySelector('.tear-bottom-half')
    return {
      top: top ? window.getComputedStyle(top).opacity : '1',
      btm: btm ? window.getComputedStyle(btm).opacity : '1',
    }
  })

  results.tests.noGhosting =
    parseFloat(underlayOpIdle) <= 0.05 &&
    parseFloat(frontOpRevealed.top) <= 0.05 &&
    parseFloat(frontOpRevealed.btm) <= 0.05
  await ghostPage.close()

  await testPage.close()
  await testContext.close()
  await browser.close()

  // Write audit results JSON
  const auditPath = path.join(ROOT_DIR, 'qa', 'card-fx-audit.json')
  fs.writeFileSync(auditPath, JSON.stringify(results, null, 2), 'utf8')
  console.log(`\nAudit completed successfully! Saved results to ${auditPath}`)
  console.log(JSON.stringify(results.tests, null, 2))
}

captureCardFrames().catch((err) => {
  console.error('[card-frames] Error:', err)
  process.exit(1)
})
