import { test, expect } from '@playwright/test'

test.describe('Dashboard Zero Initial Stats Verification', () => {
  test('Fresh new user starts with 0 streak, 0 XP, 0 / 3 Lessons, 0% accuracy, and 0 earned badges', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
      // Seed fresh user with empty progress
      localStorage.setItem(
        'samvidhan:user',
        JSON.stringify({
          id: 'fresh-user-1',
          name: 'Priya Sharma',
          email: 'priya@example.in',
          role: 'learner',
          tier: 'free',
        })
      )
    })

    // Visit dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 1. Verify top stats strip
    const statsStrip = page.locator('.duo-dashboard-stats-strip')
    await expect(statsStrip).toBeVisible()

    // Daily streak: 0 Days
    const streakValue = statsStrip.locator('.duo-dash-stat-item').nth(0).locator('.duo-stat-value')
    await expect(streakValue).toHaveText('0 Days')

    // XP: 0 XP
    const xpValue = statsStrip.locator('.duo-dash-stat-item').nth(1).locator('.duo-stat-value')
    await expect(xpValue).toHaveText('0 XP')

    // Today's Target: 0 / 3 Lessons
    const targetValue = statsStrip.locator('.duo-dash-stat-item').nth(2).locator('.duo-stat-value')
    await expect(targetValue).toHaveText('0 / 3 Lessons')

    // Quiz score: 0% Accuracy
    const accuracyValue = statsStrip.locator('.duo-dash-stat-item').nth(3).locator('.duo-stat-value')
    await expect(accuracyValue).toHaveText('0% Accuracy')

    // 2. Verify Badge Shelf has 0 badges earned
    const badgeCounter = page.locator('.badge-shelf-counter')
    await expect(badgeCounter).toHaveText('0 of 6 Earned')

    // 3. Verify Daily Practice Widget streak counter
    const streakCountText = page.locator('.streak-count-text')
    await expect(streakCountText).toHaveText('0 Day Streak')

    // Take screenshot of fresh zero-state dashboard
    await page.screenshot({ path: '../../qa/dashboard_zero_stats.png', fullPage: false })
  })

  test('Cleanses legacy localStorage session with mock 45 XP and 3 streak', async ({ page }) => {
    await page.goto('/login')
    // Seed legacy mock progress
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem(
        'samvidhan:user',
        JSON.stringify({
          id: 'legacy-user-1',
          name: 'Legacy User',
          email: 'legacy@example.in',
          role: 'learner',
          tier: 'free',
        })
      )
      localStorage.setItem(
        'samvidhan:progress',
        JSON.stringify({
          completedLessonIds: [],
          quizScores: {},
          bookmarks: [],
          savedLessonIds: [],
          history: [],
          xp: 45,
          streak: 3,
          dailyGoal: 30,
          soundEnabled: true,
          mascotEnabled: true,
          streakFreezes: 1,
          badges: ['first-step'],
        })
      )
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const statsStrip = page.locator('.duo-dashboard-stats-strip')
    await expect(statsStrip.locator('.duo-dash-stat-item').nth(0).locator('.duo-stat-value')).toHaveText('0 Days')
    await expect(statsStrip.locator('.duo-dash-stat-item').nth(1).locator('.duo-stat-value')).toHaveText('0 XP')
    await expect(statsStrip.locator('.duo-dash-stat-item').nth(2).locator('.duo-stat-value')).toHaveText('0 / 3 Lessons')
    await expect(statsStrip.locator('.duo-dash-stat-item').nth(3).locator('.duo-stat-value')).toHaveText('0% Accuracy')
    await expect(page.locator('.badge-shelf-counter')).toHaveText('0 of 6 Earned')
  })
})
