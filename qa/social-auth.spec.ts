import { test, expect } from '@playwright/test'

test.describe('Social Auth Verification', () => {
  test('Login and Signup have Google button, no Apple button, and Google sign-in works smoothly', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Verify Apple button does NOT exist anywhere
    const appleBtn = page.locator('.auth-apple-btn')
    await expect(appleBtn).toHaveCount(0)

    // Verify Continue with Google button exists and is clickable
    const googleLoginBtn = page.getByRole('button', { name: 'Continue with Google' })
    await expect(googleLoginBtn).toBeVisible()

    // Click Google button
    await googleLoginBtn.click()

    // Should navigate smoothly to /dashboard without DNS error
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')

    // Verify authenticated user header
    await expect(page.locator('.dashboard-welcome-title')).toContainText('Google')

    // 2. Visit Signup page
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.auth-apple-btn')).toHaveCount(0)
    const signupGoogleBtn = page.getByRole('button', { name: 'Sign up with Google' })
    await expect(signupGoogleBtn).toBeVisible()

    // Take verification screenshot of login page
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: '../../qa/login_social_auth.png' })
  })
})
