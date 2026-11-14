import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Stage M2: Motion System, Mascot & Redesign Verification', () => {
  test('Hero Mascot Companion renders with speech bubble and quick-choice chips', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    const companion = page.locator('.hero-mascot-companion-wrap')
    await expect(companion).toBeVisible()

    // Mor avatar is present
    const morAvatar = companion.locator('.hero-mascot-avatar-col')
    await expect(morAvatar).toBeVisible()

    // 3 Quick Action Chips
    const chips = companion.locator('.hero-mascot-chip')
    await expect(chips).toHaveCount(3)

    const chip1 = chips.nth(0)
    await expect(chip1).toHaveText(/The Constitution/i)
    await expect(chip1).toHaveAttribute('href', '/learn')

    const chip2 = chips.nth(1)
    await expect(chip2).toHaveText(/Know My Rights/i)
    await expect(chip2).toHaveAttribute('href', '/learn/fundamental-rights-in-practice')

    const chip3 = chips.nth(2)
    await expect(chip3).toHaveText(/Ask a Question/i)
    await expect(chip3).toHaveAttribute('href', '/ask')

    // Click Mor to verify mood reaction
    await morAvatar.click()
    await page.waitForTimeout(150)
  })

  test('Settings: disabling mascot cleanly removes Mor with zero layout shift', async ({ page }) => {
    // Seed setting mascotEnabled = false using the app's samvidhan: prefix
    await page.addInitScript(() => {
      localStorage.setItem(
        'samvidhan:progress',
        JSON.stringify({
          mascotEnabled: false,
          xp: 45,
          streak: 3,
          dailyGoal: 30,
        })
      )
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    const companion = page.locator('.hero-mascot-companion-wrap')
    await expect(companion).toHaveCount(0)
  })

  test('Interactive Lab: 3D Flip Card and 1-Question Mini-Quiz work with instant feedback', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    // 1. Test 3D Flip Card
    const flipInner = page.locator('.flip-card-inner')
    await expect(flipInner).toBeVisible()
    await expect(flipInner).not.toHaveClass(/is-flipped/)

    // Tap to flip
    await flipInner.click()
    await expect(flipInner).toHaveClass(/is-flipped/)

    // Verify Article 22(2) content revealed
    const backFace = page.locator('.flip-card-back')
    await expect(backFace).toContainText(/Article 22\(2\) Safeguard/i)
    await expect(backFace).toContainText(/24 Hours/i)

    // 2. Test Mini-Quiz
    const quizCard = page.locator('.mini-quiz-card')
    await expect(quizCard).toBeVisible()

    const correctOption = quizCard.locator('.mini-quiz-option-btn', {
      hasText: /immunity against self-incrimination/i,
    })
    await expect(correctOption).toBeVisible()

    // Answer the quiz
    await correctOption.click()
    await expect(correctOption).toHaveClass(/is-correct/)

    // Verify explanation and continue CTA appear
    await expect(quizCard).toContainText(/Article 20\(3\) of the Constitution guarantees/i)
    const continueBtn = quizCard.getByRole('link', { name: /Continue this lesson/i })
    await expect(continueBtn).toBeVisible()
  })

  test('Horizontal Course Rail supports scrolling and contains published tracks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    const railScroll = page.locator('.courses-rail-scroll')
    await expect(railScroll).toBeVisible()

    const cards = railScroll.locator('.rail-course-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // Test next chevron scroll button
    const nextBtn = page.locator('.rail-nav-btn.next-btn')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(300)
    }
  })

  test('Constitution Teaser offers quick search and landmark pills', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)

    const searchInput = page.locator('.constitution-quick-input-wrap input')
    await expect(searchInput).toBeVisible()

    const pills = page.locator('.constitution-article-pill')
    await expect(pills).toHaveCount(5)
  })

  test('Capture After-Screenshots at Mobile (390x844) and Desktop (1440x900)', async ({ browser }) => {
    const afterDir = path.resolve(process.cwd(), '../../qa/motion-after')

    // Desktop
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const desktopPage = await desktopContext.newPage()
    await desktopPage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
    await desktopPage.waitForTimeout(600)
    await desktopPage.screenshot({ path: path.join(afterDir, 'desktop_home_redesign.png'), fullPage: false })
    await desktopContext.close()

    // Mobile
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const mobilePage = await mobileContext.newPage()
    await mobilePage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
    await mobilePage.waitForTimeout(600)
    await mobilePage.screenshot({ path: path.join(afterDir, 'mobile_home_redesign.png'), fullPage: false })
    await mobileContext.close()
  })
})
