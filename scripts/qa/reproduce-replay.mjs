import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test')

const VIEWPORTS = [
  { name: 'phone-dark', width: 390, height: 844, theme: 'dark', hasTouch: true },
  { name: 'phone-light', width: 390, height: 844, theme: 'light', hasTouch: true },
  { name: 'desktop-dark', width: 1440, height: 900, theme: 'dark', hasTouch: false },
  { name: 'desktop-light', width: 1440, height: 900, theme: 'light', hasTouch: false },
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  let reportLog = `# REPLAY REPRODUCTION TEST REPORT (BEFORE FIX)

**Date**: ${new Date().toISOString()}
**Test**: 10 sequential cycles on Home card (click -> revealed -> restore -> idle -> repeat)
Across 390x844 & 1440x900 in light & dark themes.

---

`

  let anyFailure = false

  for (const vp of VIEWPORTS) {
    console.log(`Starting ${vp.name}...`)
    reportLog += `\n### Viewport: ${vp.name} (${vp.width}x${vp.height}, theme: ${vp.theme})\n`
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.hasTouch,
    })
    const page = await context.newPage()

    try {
      await page.goto('http://localhost:4173/?fxslow=1', { waitUntil: 'networkidle' })
      if (vp.theme === 'light') {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
      } else {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      }
      await page.waitForTimeout(300)

      const card = page.locator('.interactive-lab-card')
      await card.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)

      let cyclesCompleted = 0

      for (let i = 1; i <= 10; i++) {
        console.log(`[${vp.name}] Cycle ${i} starting...`)
        reportLog += `- **Cycle ${i}**: `

        // 1. Verify card is in idle state
        const isIdle = await card.evaluate((el) => el.classList.contains('state-idle'))
        if (!isIdle) {
          const classes = await card.getAttribute('class')
          console.log(`[${vp.name}] Cycle ${i} FAILED: not in state-idle (${classes})`)
          reportLog += `FAILED: Card is not in state-idle before click (classes: "${classes}")\n`
          anyFailure = true
          break
        }

        // 2. Click / Tap card to trigger tear/burn
        console.log(`[${vp.name}] Cycle ${i} clicking card...`)
        if (vp.hasTouch) {
          await card.tap({ position: { x: 100, y: 100 } })
        } else {
          await card.click({ position: { x: 150, y: 100 } })
        }

        // 3. Wait for revealed state
        console.log(`[${vp.name}] Cycle ${i} waiting for state-revealed...`)
        try {
          await page.waitForSelector('.interactive-lab-card.state-revealed', { timeout: 3500 })
        } catch (err) {
          const classes = await card.getAttribute('class')
          console.log(`[${vp.name}] Cycle ${i} FAILED: didn't reach state-revealed within 3.5s (${classes})`)
          reportLog += `FAILED: Card never reached state-revealed within 3.5s (classes: "${classes}")\n`
          anyFailure = true
          break
        }

        // 4. Find restore button and click it
        console.log(`[${vp.name}] Cycle ${i} clicking restore button...`)
        const restoreBtn = card.locator('.flip-restore-btn')
        const isBtnVisible = await restoreBtn.isVisible()
        if (!isBtnVisible) {
          console.log(`[${vp.name}] Cycle ${i} FAILED: restore button not visible`)
          reportLog += `FAILED: Restore button is not visible in revealed state\n`
          anyFailure = true
          break
        }

        if (vp.hasTouch) {
          await restoreBtn.tap()
        } else {
          await restoreBtn.click()
        }

        // 5. Wait for idle state
        console.log(`[${vp.name}] Cycle ${i} waiting for state-idle...`)
        try {
          await page.waitForSelector('.interactive-lab-card.state-idle', { timeout: 3000 })
          cyclesCompleted++
          console.log(`[${vp.name}] Cycle ${i} PASSED`)
          reportLog += `PASSED (Tore/Burned -> Revealed -> Restored -> Idle)\n`
        } catch (err) {
          const classes = await card.getAttribute('class')
          console.log(`[${vp.name}] Cycle ${i} FAILED: didn't return to state-idle within 3.0s (${classes})`)
          reportLog += `FAILED: Card did not return to state-idle within 3.0s after pressing restore (classes: "${classes}")\n`
          anyFailure = true
          break
        }

        // Small pause between cycles
        await page.waitForTimeout(200)
      }

      reportLog += `\n**Total completed cycles for ${vp.name}**: ${cyclesCompleted}/10\n`
    } catch (e) {
      reportLog += `\nError during ${vp.name}: ${e.message}\n`
      anyFailure = true
    } finally {
      await context.close()
    }
  }

  await browser.close()

  const outPath = path.resolve('qa/replay-before.md')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, reportLog, 'utf8')
  console.log(`Saved report to ${outPath}`)
  console.log(`Any failure: ${anyFailure}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
