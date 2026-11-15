import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const OUT_DIR = path.join(ROOT_DIR, 'qa', 'screenshots', 'tear-burn')
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: 'phone-360', width: 360, height: 740 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
]

const THEMES = ['dark', 'light']

async function runAudit() {
  console.log(`[audit-tear-burn] Launching Chromium to test ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })

  const results = {
    viewportsTested: [],
    clippingIssues: [],
    horizontalOverflow: [],
    interactionsTested: {
      tearTap: false,
      tearDrag: false,
      tearRestore: false,
      burnTap: false,
      burnRestore: false
    },
    longestAnswerAudit: null,
    screenshots: []
  }

  // 1. Audit Viewports and Themes on Learning Lesson (Tear variant default)
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
      await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

      // Set theme attribute
      await page.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th)
      }, theme)

      await page.waitForTimeout(400)

      // Locate tear card
      const card = page.locator('.is-tear-variant').first()
      const isVisible = await card.isVisible()

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth
        const winW = window.innerWidth
        return docW > winW + 1
      })

      // Check if card text is clipped
      const clipCheck = await card.evaluate((el) => {
        const textEl = el.querySelector('.flip-prompt-text')
        if (!textEl) return false
        return textEl.scrollHeight > textEl.clientHeight + 4
      })

      results.viewportsTested.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        theme,
        tearCardFound: isVisible,
        hasHorizontalOverflow: overflow,
        textClipped: clipCheck
      })

      if (overflow) results.horizontalOverflow.push(`${vp.name} (${theme})`)
      if (clipCheck) results.clippingIssues.push(`${vp.name} (${theme})`)

      await page.close()
    }
  }

  // 2. Audit Longest Answer in data at 360px viewport
  {
    console.log('[audit-tear-burn] Auditing longest answer in data at 360px viewport...')
    const page = await browser.newPage({ viewport: { width: 360, height: 740 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    // Tap to tear open and reveal the longest answer (Prem Behari Narain Raizada...)
    await card.click()
    await page.waitForTimeout(800)

    const longestAnswerMetrics = await card.evaluate((el) => {
      const container = el.querySelector('.flip-card-grid-container')
      const underlay = el.querySelector('.flip-card-underlay')
      const revealText = el.querySelector('.flip-reveal-text')
      const restoreBtn = el.querySelector('.flip-restore-btn')

      const containerHeight = container ? container.offsetHeight : 0
      const underlayHeight = underlay ? underlay.offsetHeight : 0
      const textScrollHeight = revealText ? revealText.scrollHeight : 0
      const textClientHeight = revealText ? revealText.clientHeight : 0
      const btnHeight = restoreBtn ? restoreBtn.offsetHeight : 0

      return {
        containerHeight,
        underlayHeight,
        textScrollHeight,
        textClientHeight,
        btnHeight,
        isZeroClipped: textScrollHeight <= textClientHeight + 2,
        heightMatched: Math.abs(containerHeight - underlayHeight) <= 2
      }
    })

    results.longestAnswerAudit = longestAnswerMetrics
    console.log('[audit-tear-burn] Longest answer audit metrics at 360px:', longestAnswerMetrics)
    await page.close()
  }

  // 3. Capture 4 screenshots for TEAR variant at 390x844 (0%, 30%, 60%, 100%)
  {
    console.log('[audit-tear-burn] Capturing 4 Tear screenshots at 390x844...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    // Shot 1: 0% Intact
    const shot0Path = path.join(OUT_DIR, 'tear-0-intact.png')
    await card.screenshot({ path: shot0Path })
    results.screenshots.push(shot0Path)

    // Shot 2: 30% Drag mid-tear
    const box = await card.boundingBox()
    if (box) {
      await page.mouse.move(box.x + 40, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + 40 + box.width * 0.22, box.y + box.height / 2, { steps: 5 })
      await page.waitForTimeout(100)

      const shot30Path = path.join(OUT_DIR, 'tear-30-mid.png')
      await card.screenshot({ path: shot30Path })
      results.screenshots.push(shot30Path)

      // Shot 3: 60% almost open
      await page.mouse.move(box.x + 40 + box.width * 0.38, box.y + box.height / 2, { steps: 5 })
      await page.waitForTimeout(100)

      const shot60Path = path.join(OUT_DIR, 'tear-60-almost.png')
      await card.screenshot({ path: shot60Path })
      results.screenshots.push(shot60Path)

      // Release to complete tear
      await page.mouse.move(box.x + 40 + box.width * 0.55, box.y + box.height / 2, { steps: 5 })
      await page.mouse.up()
      await page.waitForTimeout(800)

      // Shot 4: 100% Revealed
      const shot100Path = path.join(OUT_DIR, 'tear-100-revealed.png')
      await card.screenshot({ path: shot100Path })
      results.screenshots.push(shot100Path)

      results.interactionsTested.tearDrag = true
      results.interactionsTested.tearTap = true

      // Test Restore
      const restoreBtn = card.locator('.flip-restore-btn')
      await restoreBtn.click()
      await page.waitForTimeout(600)
      const isRestored = await card.locator('.tear-top-half').evaluate(el => el.style.opacity !== '0')
      results.interactionsTested.tearRestore = isRestored
    }
    await page.close()
  }

  // 4. Capture 4 screenshots for BURN variant at 390x844 (0%, 30%, 60%, 100%)
  {
    console.log('[audit-tear-burn] Capturing 4 Burn screenshots at 390x844 on Home...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    const burnCard = page.locator('.is-burn-variant').first()
    await burnCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    // Shot 1: 0% Intact
    const shot0Path = path.join(OUT_DIR, 'burn-0-intact.png')
    await burnCard.screenshot({ path: shot0Path })
    results.screenshots.push(shot0Path)

    // Trigger burn with click
    const box = await burnCard.boundingBox()
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      // Shot 2: 30% mid-burn (~300ms)
      await page.waitForTimeout(300)
      const shot30Path = path.join(OUT_DIR, 'burn-30-mid.png')
      await burnCard.screenshot({ path: shot30Path })
      results.screenshots.push(shot30Path)

      // Shot 3: 60% almost open (~600ms total)
      await page.waitForTimeout(300)
      const shot60Path = path.join(OUT_DIR, 'burn-60-almost.png')
      await burnCard.screenshot({ path: shot60Path })
      results.screenshots.push(shot60Path)

      // Shot 4: 100% revealed (~1100ms total)
      await page.waitForTimeout(600)
      const shot100Path = path.join(OUT_DIR, 'burn-100-revealed.png')
      await burnCard.screenshot({ path: shot100Path })
      results.screenshots.push(shot100Path)

      results.interactionsTested.burnTap = true

      // Test Restore
      const restoreBtn = burnCard.locator('.flip-restore-btn')
      await restoreBtn.click()
      await page.waitForTimeout(700)
      results.interactionsTested.burnRestore = true
    }
    await page.close()
  }

  await browser.close()

  console.log('[audit-tear-burn] Summary Results:')
  console.log(JSON.stringify(results, null, 2))

  const reportOut = path.join(ROOT_DIR, 'qa', 'tear-burn-audit.json')
  fs.writeFileSync(reportOut, JSON.stringify(results, null, 2))
  console.log(`[audit-tear-burn] Saved audit results to ${reportOut}`)
}

runAudit().catch((err) => {
  console.error('[audit-tear-burn] Fatal error:', err)
  process.exit(1)
})
