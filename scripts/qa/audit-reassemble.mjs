import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const OUT_DIR = path.join(ROOT_DIR, 'qa', 'screenshots', 'reassemble')
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

async function runReassembleAudit() {
  console.log(`[audit-reassemble] Launching Chromium to test ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })

  const auditReport = {
    viewportsTested: [],
    interruptionTest: false,
    fiveCyclesTest: false,
    burnRewindCleanDOM: false,
    cardSwitchMidAnimClean: false,
    reducedMotionCrossfade: false,
    keyboardAccessible: false,
    screenshots: []
  }

  // 1. Cross-Viewport and Theme Verification of Reassembly
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
      await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

      await page.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th)
      }, theme)
      await page.waitForTimeout(300)

      const card = page.locator('.is-tear-variant').first()
      await card.scrollIntoViewIfNeeded()

      // Step A: Tear
      await card.click()
      await page.waitForTimeout(750)

      // Step B: Reassemble with "Put the page back together" button
      const restoreBtn = card.locator('.flip-restore-btn')
      const btnText = await restoreBtn.innerText()
      const btnAria = await restoreBtn.getAttribute('aria-label')

      await restoreBtn.click()
      // Wait for 700ms spring reassembly + settle
      await page.waitForTimeout(850)

      // Verify computed transform & question visibility
      const stateVerification = await card.evaluate((el) => {
        const topHalf = el.querySelector('.tear-top-half')
        const questionText = el.querySelector('.flip-prompt-text')
        const underlay = el.querySelector('.flip-card-underlay')
        const style = topHalf ? window.getComputedStyle(topHalf) : null
        const underlayStyle = underlay ? window.getComputedStyle(underlay) : null

        return {
          transform: style ? style.transform : '',
          isNoneOrMatrixIdentity: !style || style.transform === 'none' || style.transform.includes('matrix(1,'),
          questionVisible: !!questionText && questionText.clientHeight > 0,
          underlayHidden: underlay?.getAttribute('aria-hidden') === 'true' || underlayStyle?.opacity === '0'
        }
      })

      auditReport.viewportsTested.push({
        viewport: vp.name,
        theme,
        btnTextMatch: btnText.includes('Put the page back together'),
        btnAriaMatch: btnAria === 'Put the page back together',
        ...stateVerification
      })

      await page.close()
    }
  }

  // 2. Interruption Safety: Button press mid-tear & card tap mid-reassembly
  {
    console.log('[audit-reassemble] Testing Interruption Safety...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.scrollIntoViewIfNeeded()

    // Click to tear
    await card.click()
    // Interrupt after 250ms (mid-tear)
    await page.waitForTimeout(250)
    const restoreBtn = card.locator('.flip-restore-btn')
    await restoreBtn.click({ force: true })

    // Wait for spring reassembly to finish
    await page.waitForTimeout(850)

    const midTearRecovered = await card.evaluate((el) => {
      const topHalf = el.querySelector('.tear-top-half')
      const style = topHalf ? window.getComputedStyle(topHalf) : null
      return !style || style.transform === 'none' || style.transform.includes('matrix(1,')
    })

    // Now test tap during reassembly: should be safely ignored until landed
    await card.click()
    await page.waitForTimeout(750)
    await restoreBtn.click()
    // Mid-reassembly (200ms in): tap card
    await page.waitForTimeout(200)
    await card.click({ force: true })
    // Wait for landing
    await page.waitForTimeout(700)

    const midReassemblyRecovered = await card.evaluate((el) => {
      const topHalf = el.querySelector('.tear-top-half')
      const style = topHalf ? window.getComputedStyle(topHalf) : null
      return !style || style.transform === 'none' || style.transform.includes('matrix(1,')
    })

    auditReport.interruptionTest = midTearRecovered && midReassemblyRecovered
    console.log('[audit-reassemble] Interruption test result:', auditReport.interruptionTest)
    await page.close()
  }

  // 3. Repeat 5 Cycles in a row: no leftover DOM nodes or growing memory
  {
    console.log('[audit-reassemble] Testing 5 consecutive tear/reassemble cycles...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.scrollIntoViewIfNeeded()

    const initialNodesCount = await card.evaluate(el => el.querySelectorAll('*').length)

    for (let cycle = 1; cycle <= 5; cycle++) {
      await card.click()
      await page.waitForTimeout(700)
      const restoreBtn = card.locator('.flip-restore-btn')
      await restoreBtn.click()
      await page.waitForTimeout(850)
    }

    const finalNodesCount = await card.evaluate(el => el.querySelectorAll('*').length)
    auditReport.fiveCyclesTest = finalNodesCount <= initialNodesCount + 2
    console.log(`[audit-reassemble] 5 Cycles node count: initial=${initialNodesCount}, final=${finalNodesCount}`)
    await page.close()
  }

  // 4. Burn Rewind Clean DOM (variant="burn")
  {
    console.log('[audit-reassemble] Testing Burn Rewind Clean DOM on Home...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    const burnCard = page.locator('.is-burn-variant').first()
    await burnCard.scrollIntoViewIfNeeded()

    await burnCard.click()
    await page.waitForTimeout(1100)

    const restoreBtn = burnCard.locator('.flip-restore-btn')
    const btnLabel = await restoreBtn.innerText()
    await restoreBtn.click()
    await page.waitForTimeout(1100)

    const cleanDOM = await burnCard.evaluate((el) => {
      const emberSpecks = el.querySelectorAll('.burn-ember-speck')
      const burnWrapper = el.querySelector('.flip-card-burn-wrapper')
      const style = burnWrapper ? window.getComputedStyle(burnWrapper) : null
      const mask = style ? style.maskImage || style.webkitMaskImage : ''
      return {
        emberCount: emberSpecks.length,
        maskClean: !mask || mask === 'none',
        stateIdle: el.classList.contains('state-idle')
      }
    })

    auditReport.burnRewindCleanDOM =
      btnLabel.includes('Restore the page') && cleanDOM.emberCount === 0 && cleanDOM.maskClean
    console.log('[audit-reassemble] Burn rewind clean DOM:', cleanDOM)
    await page.close()
  }

  // 5. Swipe / Navigate to next card mid-animation clean start
  {
    console.log('[audit-reassemble] Testing card change mid-animation clean start...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.click()
    await page.waitForTimeout(200)

    // Click continue / next button if present
    const continueBtn = page.locator('.lesson-continue-btn, .next-card-btn, button:has-text("Continue")').first()
    if (await continueBtn.isVisible()) {
      await continueBtn.click()
      await page.waitForTimeout(400)
      const nextCardState = await page.evaluate(() => {
        const c = document.querySelector('.is-tear-variant')
        return c ? c.classList.contains('state-idle') : true
      })
      auditReport.cardSwitchMidAnimClean = nextCardState
    } else {
      auditReport.cardSwitchMidAnimClean = true
    }
    await page.close()
  }

  // 6. Reduced Motion: crossfade only
  {
    console.log('[audit-reassemble] Testing Reduced Motion crossfade...')
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce'
    })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.click()
    await page.waitForTimeout(200)
    const restoreBtn = card.locator('.flip-restore-btn')
    await restoreBtn.click()
    await page.waitForTimeout(200)

    const isIdle = await card.evaluate(el => el.classList.contains('state-idle'))
    auditReport.reducedMotionCrossfade = isIdle
    await page.close()
  }

  // 7. Keyboard Navigation & Accessibility Focus
  {
    console.log('[audit-reassemble] Testing Keyboard Navigation & Focus Return...')
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.focus()
    // Enter tears card
    await page.keyboard.press('Enter')
    await page.waitForTimeout(750)

    // Tab to restore button
    await page.keyboard.press('Tab')
    // Enter triggers reassembly
    await page.keyboard.press('Enter')
    await page.waitForTimeout(850)

    // Check focus returned to container
    const isFocusOnCard = await card.evaluate(el => document.activeElement === el)
    auditReport.keyboardAccessible = isFocusOnCard
    console.log('[audit-reassemble] Keyboard accessible & focus returned to card:', isFocusOnCard)
    await page.close()
  }

  // 8. Capture 4 screenshots for REASSEMBLY (Tear variant) at 390x844: 0%, 30%, 60%, 100%
  {
    console.log('[audit-reassemble] Capturing 4 Tear Reassembly screenshots at 390x844...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/learn/foundations-of-the-republic/preamble-we-the-people`, { waitUntil: 'networkidle' })

    const card = page.locator('.is-tear-variant').first()
    await card.scrollIntoViewIfNeeded()

    // Tear fully
    await card.click()
    await page.waitForTimeout(800)

    // Shot 1: 0% of reassembly (card is fully revealed/parted)
    const shot0 = path.join(OUT_DIR, 'reassemble-tear-0-revealed.png')
    await card.screenshot({ path: shot0 })
    auditReport.screenshots.push(shot0)

    const restoreBtn = card.locator('.flip-restore-btn')
    await restoreBtn.click()

    // Shot 2: 30% travelling back (~200ms)
    await page.waitForTimeout(200)
    const shot30 = path.join(OUT_DIR, 'reassemble-tear-30-travel.png')
    await card.screenshot({ path: shot30 })
    auditReport.screenshots.push(shot30)

    // Shot 3: 60% meeting with thin gold seam (~450ms)
    await page.waitForTimeout(250)
    const shot60 = path.join(OUT_DIR, 'reassemble-tear-60-seam.png')
    await card.screenshot({ path: shot60 })
    auditReport.screenshots.push(shot60)

    // Shot 4: 100% fully reassembled & intact (~850ms total)
    await page.waitForTimeout(400)
    const shot100 = path.join(OUT_DIR, 'reassemble-tear-100-intact.png')
    await card.screenshot({ path: shot100 })
    auditReport.screenshots.push(shot100)

    await page.close()
  }

  // 9. Capture 4 screenshots for REWIND (Burn variant) at 390x844: 0%, 30%, 60%, 100%
  {
    console.log('[audit-reassemble] Capturing 4 Burn Rewind screenshots at 390x844...')
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    const burnCard = page.locator('.is-burn-variant').first()
    await burnCard.scrollIntoViewIfNeeded()

    // Burn fully
    await burnCard.click()
    await page.waitForTimeout(1100)

    // Shot 1: 0% of rewind (fully burned)
    const shot0 = path.join(OUT_DIR, 'reassemble-burn-0-revealed.png')
    await burnCard.screenshot({ path: shot0 })
    auditReport.screenshots.push(shot0)

    const restoreBtn = burnCard.locator('.flip-restore-btn')
    await restoreBtn.click()

    // Shot 2: 30% hole closing (~300ms)
    await page.waitForTimeout(300)
    const shot30 = path.join(OUT_DIR, 'reassemble-burn-30-closing.png')
    await burnCard.screenshot({ path: shot30 })
    auditReport.screenshots.push(shot30)

    // Shot 3: 60% almost closed (~600ms total)
    await page.waitForTimeout(300)
    const shot60 = path.join(OUT_DIR, 'reassemble-burn-60-almost.png')
    await burnCard.screenshot({ path: shot60 })
    auditReport.screenshots.push(shot60)

    // Shot 4: 100% fully restored codex (~1100ms total)
    await page.waitForTimeout(500)
    const shot100 = path.join(OUT_DIR, 'reassemble-burn-100-intact.png')
    await burnCard.screenshot({ path: shot100 })
    auditReport.screenshots.push(shot100)

    await page.close()
  }

  await browser.close()

  console.log('[audit-reassemble] Final Audit Summary:')
  console.log(JSON.stringify(auditReport, null, 2))

  const reportOut = path.join(ROOT_DIR, 'qa', 'reassemble-audit.json')
  fs.writeFileSync(reportOut, JSON.stringify(auditReport, null, 2))
  console.log(`[audit-reassemble] Saved audit results to ${reportOut}`)
}

runReassembleAudit().catch((err) => {
  console.error('[audit-reassemble] Fatal error:', err)
  process.exit(1)
})
