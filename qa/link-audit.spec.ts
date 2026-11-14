import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

interface LinkRecord {
  viewport: string
  route: string
  element: 'a' | 'button'
  label: string
  destination: string
  target?: string
  rel?: string
  status: 'OK' | 'FLAG'
  issue?: string
}

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/design-principles',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/login',
  '/signup',
  '/forgot-password',
  '/onboarding',
  '/learn',
  '/learn/foundations-of-the-republic',
  '/learn/foundations-of-the-republic/preamble-we-the-people',
  '/constitution',
  '/library',
  '/search',
  '/ask',
  '/affiliates',
]

const AUTH_ROUTES = [
  '/dashboard',
  '/profile',
  '/progress',
  '/bookmarks',
  '/saved',
  '/settings',
  '/refer',
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

test.describe('M0: Link and Button Inventory Audit', () => {
  const allRecords: LinkRecord[] = []
  const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'

  test('audit all routes at mobile and desktop viewports', async ({ browser }) => {
    test.setTimeout(240000)

    // Ensure qa directory is targeted accurately
    const qaDir = path.resolve(process.cwd(), '../../qa')
    const motionBeforeDir = path.join(qaDir, 'motion-before')
    if (!fs.existsSync(motionBeforeDir)) {
      fs.mkdirSync(motionBeforeDir, { recursive: true })
    }

    for (const vp of VIEWPORTS) {
      // 1. Audit public routes (unauthenticated)
      const publicContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await publicContext.newPage()

      for (const route of PUBLIC_ROUTES) {
        try {
          await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(500)

          // Save screenshot for motion before inventory on major pages
          const cleanRouteName = route === '/' ? 'home' : route.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+/, '')
          const screenshotPath = path.join(motionBeforeDir, `${vp.name}_${cleanRouteName}.png`)
          if (['home', 'learn', 'constitution', 'ask', 'how_it_works', 'design_principles'].includes(cleanRouteName)) {
            await page.screenshot({ path: screenshotPath, fullPage: false })
          }

          // Mobile drawer extraction
          if (vp.name === 'mobile') {
            const hamburger = page.locator('.mobile-hamburger-btn')
            if (await hamburger.isVisible()) {
              await hamburger.click()
              await page.waitForTimeout(300)
              const drawerLinks = await extractLinksAndButtons(page, vp.name, `${route} (mobile-drawer)`)
              allRecords.push(...drawerLinks)
              // Close drawer
              const closeBtn = page.locator('.mobile-drawer-close-btn')
              if (await closeBtn.isVisible()) {
                await closeBtn.click().catch(() => {})
              } else {
                await page.keyboard.press('Escape').catch(() => {})
              }
            }
          }

          const records = await extractLinksAndButtons(page, vp.name, route)
          allRecords.push(...records)
        } catch (err) {
          allRecords.push({
            viewport: vp.name,
            route,
            element: 'a',
            label: `[PAGE LOAD ERROR]`,
            destination: route,
            status: 'FLAG',
            issue: `Failed to load route: ${(err as Error).message}`,
          })
        }
      }
      await publicContext.close()

      // 2. Audit authenticated routes
      const authContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      })
      const authPage = await authContext.newPage()

      // Seed localStorage with logged-in user
      await authPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' })
      await authPage.evaluate(() => {
        const demoUser = {
          id: 'demo-user-audit',
          name: 'Maysam Ali',
          email: 'maysamali032@gmail.com',
          role: 'learner',
          tier: 'free',
          xp: 120,
          streak: 3,
          dailyGoal: 30,
        }
        localStorage.setItem('user', JSON.stringify(demoUser))
      })

      for (const route of AUTH_ROUTES) {
        try {
          await authPage.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await authPage.waitForTimeout(500)

          const cleanRouteName = route.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+/, '')
          const screenshotPath = path.join(motionBeforeDir, `${vp.name}_auth_${cleanRouteName}.png`)
          if (['dashboard', 'profile', 'progress', 'settings'].includes(cleanRouteName)) {
            await authPage.screenshot({ path: screenshotPath, fullPage: false })
          }

          const records = await extractLinksAndButtons(authPage, vp.name, route)
          allRecords.push(...records)
        } catch (err) {
          allRecords.push({
            viewport: vp.name,
            route,
            element: 'a',
            label: `[PAGE LOAD ERROR]`,
            destination: route,
            status: 'FLAG',
            issue: `Failed to load route: ${(err as Error).message}`,
          })
        }
      }
      await authContext.close()
    }

    // Deduplicate records for clean reporting
    const seen = new Set<string>()
    const uniqueRecords: LinkRecord[] = []
    for (const r of allRecords) {
      const key = `${r.viewport}|${r.route}|${r.element}|${r.label}|${r.destination}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueRecords.push(r)
      }
    }

    // Generate qa/LINK_AUDIT.md
    generateAuditMarkdown(qaDir, uniqueRecords)

    const flagged = uniqueRecords.filter((r) => r.status === 'FLAG')
    console.log(`Audit finished. Total elements inspected: ${uniqueRecords.length}. Flagged issues: ${flagged.length}`)
  })
})

async function extractLinksAndButtons(
  page: any,
  viewport: string,
  route: string
): Promise<LinkRecord[]> {
  const records: LinkRecord[] = []

  const linksData = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'))
    return anchors.map((a) => {
      const text = (a.innerText || a.getAttribute('aria-label') || a.getAttribute('title') || '').trim()
      const href = a.getAttribute('href') || ''
      const target = a.getAttribute('target') || ''
      const rel = a.getAttribute('rel') || ''
      const role = a.getAttribute('role') || ''
      return { text, href, target, rel, role }
    })
  })

  for (const a of linksData) {
    let status: 'OK' | 'FLAG' = 'OK'
    let issue: string | undefined

    const isExternal = a.href.startsWith('http://') || a.href.startsWith('https://')

    if (!a.href || a.href === '#' || a.href === 'javascript:void(0)') {
      status = 'FLAG'
      issue = 'Dead placeholder link (href="#" or empty)'
    } else if (isExternal) {
      const hasBlank = a.target === '_blank'
      const hasNoopener = a.rel.includes('noopener') && a.rel.includes('noreferrer')
      if (!hasBlank || !hasNoopener) {
        status = 'FLAG'
        issue = `External link missing target="_blank" or rel="noopener noreferrer"`
      }
      if (
        (a.href.includes('twitter.com') || a.href.includes('x.com') || a.href.includes('instagram.com') || a.href.includes('youtube.com')) &&
        !route.includes('dev')
      ) {
        status = 'FLAG'
        issue = (issue ? issue + '; ' : '') + 'Forbidden social network link (only LinkedIn & GitHub allowed)'
      }
    }

    records.push({
      viewport,
      route,
      element: 'a',
      label: a.text || '[Icon / Image Only]',
      destination: a.href,
      target: a.target,
      rel: a.rel,
      status,
      issue,
    })
  }

  const buttonsData = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    return btns.map((b) => {
      const text = (b.innerText || b.getAttribute('aria-label') || b.getAttribute('title') || '').trim()
      const type = b.getAttribute('type') || 'submit'
      const disabled = b.disabled
      const ariaExpanded = b.getAttribute('aria-expanded')
      const role = b.getAttribute('role') || 'button'
      const className = b.className
      return { text, type, disabled, ariaExpanded, role, className }
    })
  })

  for (const b of buttonsData) {
    let status: 'OK' | 'FLAG' = 'OK'
    let issue: string | undefined

    if (!b.text && !b.className.includes('icon') && !b.className.includes('hamburger') && !b.className.includes('close')) {
      status = 'FLAG'
      issue = 'Button lacks accessible label (empty text and no aria-label)'
    }

    records.push({
      viewport,
      route,
      element: 'button',
      label: b.text || `[Button: .${b.className.slice(0, 30)}]`,
      destination: `type="${b.type}"${b.disabled ? ' disabled' : ''}`,
      status,
      issue,
    })
  }

  return records
}

function generateAuditMarkdown(qaDir: string, records: LinkRecord[]) {
  const auditPath = path.join(qaDir, 'LINK_AUDIT.md')

  const flagged = records.filter((r) => r.status === 'FLAG')
  const ok = records.filter((r) => r.status === 'OK')

  let md = `# Stage M0: Link and Interactive Element Audit\n\n`
  md += `**Date**: ${new Date().toISOString()}\n`
  md += `**Total Elements Audited**: ${records.length}\n`
  md += `**Working / Clean**: ${ok.length}\n`
  md += `**Flagged Issues**: ${flagged.length}\n\n`

  md += `## 1. Flagged Issues Summary\n\n`
  if (flagged.length === 0) {
    md += `Zero issues found across all tested routes and viewports.\n\n`
  } else {
    md += `| Viewport | Route | Element | Label | Destination | Issue |\n`
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`
    for (const item of flagged) {
      const label = item.label.replace(/\|/g, '\\|').slice(0, 40)
      const dest = item.destination.replace(/\|/g, '\\|').slice(0, 60)
      const issue = (item.issue || '').replace(/\|/g, '\\|')
      md += `| ${item.viewport} | \`${item.route}\` | ${item.element} | ${label} | \`${dest}\` | **${issue}** |\n`
    }
    md += `\n`
  }

  md += `## 2. All Audited Elements Inventory\n\n`
  md += `<details><summary>Click to expand complete inventory (${records.length} items)</summary>\n\n`
  md += `| Viewport | Route | Type | Label | Destination | Status | Details |\n`
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`
  for (const item of records) {
    const label = item.label.replace(/\|/g, '\\|').slice(0, 35)
    const dest = item.destination.replace(/\|/g, '\\|').slice(0, 50)
    const statusIcon = item.status === 'OK' ? 'PASS' : 'FLAG'
    const details = item.issue ? item.issue.replace(/\|/g, '\\|') : ''
    md += `| ${item.viewport} | \`${item.route}\` | ${item.element} | ${label} | \`${dest}\` | ${statusIcon} | ${details} |\n`
  }
  md += `\n</details>\n`

  fs.writeFileSync(auditPath, md, 'utf-8')
  console.log(`Saved LINK_AUDIT.md to ${auditPath}`)
}
