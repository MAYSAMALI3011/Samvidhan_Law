import { test, expect } from '@playwright/test'

const ROUTES_TO_TEST = [
  '/',
  '/how-it-works',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/login',
  '/signup',
  '/learn',
  '/constitution',
  '/library',
  '/search',
  '/ask',
  '/affiliates',
  '/dashboard',
  '/settings',
]

const EXPECTED_LINKEDIN = 'https://www.linkedin.com/in/maysam-ali-097935383/'
const EXPECTED_GITHUB = 'https://github.com/MAYSAMALI3011'

test.describe('Gate M1: Link & Social Strict Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Seed authenticated session for protected routes
    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'regression-tester',
          name: 'Maysam Ali',
          email: 'maysamali032@gmail.com',
          role: 'learner',
          tier: 'free',
          xp: 150,
          streak: 4,
          dailyGoal: 30,
        })
      )
    })
  })

  test('Footer contains ONLY LinkedIn and GitHub with owner URLs and >= 44px tap target', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    const footerSocial = page.locator('.footer-social-wrapper')
    await expect(footerSocial).toBeVisible()

    const socialAnchors = footerSocial.locator('a')
    const count = await socialAnchors.count()
    expect(count, 'Footer social links count must be exactly 2').toBe(2)

    const hrefs: string[] = []
    for (let i = 0; i < count; i++) {
      const anchor = socialAnchors.nth(i)
      const href = await anchor.getAttribute('href')
      const target = await anchor.getAttribute('target')
      const rel = await anchor.getAttribute('rel')
      const box = await anchor.boundingBox()

      expect(href).toBeTruthy()
      hrefs.push(href!)

      expect(target, 'Social link must open in a new tab').toBe('_blank')
      expect(rel, 'Social link must contain noopener noreferrer').toContain('noopener')
      expect(rel, 'Social link must contain noopener noreferrer').toContain('noreferrer')

      expect(box?.width, 'Tap target width must be >= 44px').toBeGreaterThanOrEqual(44)
      expect(box?.height, 'Tap target height must be >= 44px').toBeGreaterThanOrEqual(44)
    }

    expect(hrefs, 'Must contain owner LinkedIn profile').toContain(EXPECTED_LINKEDIN)
    expect(hrefs, 'Must contain owner GitHub profile').toContain(EXPECTED_GITHUB)

    // Strict absence check for forbidden networks
    const forbiddenPatterns = ['twitter', 'x.com', 'instagram', 'youtube', 'facebook']
    for (const forbidden of forbiddenPatterns) {
      for (const href of hrefs) {
        expect(href, `Footer must not contain ${forbidden}`).not.toContain(forbidden)
      }
    }
  })

  test('All routes have zero dead links (href="#"), valid externals, and no 404s', async ({ page }) => {
    test.setTimeout(90000)

    for (const route of ROUTES_TO_TEST) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `Route ${route} returned HTTP 200`).toBe(200)

      // Ensure page didn't fall through to 404 for existing routes
      const notFoundHeading = page.locator('h1.not-found-title')
      await expect(notFoundHeading, `Route ${route} should not be 404`).toHaveCount(0)

      // Inspect every anchor on the page via page.evaluate
      const anchorsData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map((a) => ({
          href: a.getAttribute('href') || '',
          rel: a.getAttribute('rel') || '',
          target: a.getAttribute('target') || '',
          text: (a.innerText || a.getAttribute('aria-label') || '').trim(),
        }))
      })

      for (const a of anchorsData) {
        if (!a.href) continue

        // Skip legitimate in-page skip links like #main
        if (a.href === '#main') continue

        expect(a.href, `Dead placeholder href="#" found on ${route} (${a.text})`).not.toBe('#')
        expect(a.href, `javascript:void(0) found on ${route}`).not.toContain('javascript:')

        // Check external links
        if (a.href.startsWith('http://') || a.href.startsWith('https://')) {
          expect(
            a.target,
            `External link ${a.href} on ${route} missing target="_blank"`
          ).toBe('_blank')
          expect(
            a.rel,
            `External link ${a.href} on ${route} missing rel="noopener noreferrer"`
          ).toContain('noopener')
          expect(
            a.rel,
            `External link ${a.href} on ${route} missing rel="noopener noreferrer"`
          ).toContain('noreferrer')
        }
      }
    }
  })

  test('404 Page gracefully handles unknown routes with search and navigation', async ({ page }) => {
    await page.goto('/unknown-random-route-xyz', { waitUntil: 'domcontentloaded' })
    const notFoundHeading = page.locator('h1.not-found-title')
    await expect(notFoundHeading).toBeVisible()

    // Has working search input
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Has back home button
    const homeBtn = page.getByRole('link', { name: /Return to Homepage/i })
    await expect(homeBtn).toBeVisible()
    await expect(homeBtn).toHaveAttribute('href', '/')
  })
})
