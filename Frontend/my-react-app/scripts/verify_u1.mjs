import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const OUT_DIR = path.resolve('../../qa/preview-u1');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // 1. Visit Home and test 'Start a free lesson' link click
  console.log('Testing Home page and free lesson CTA...');
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'home-desktop.png'), fullPage: true });

  const cta = page.locator('text=Start a free lesson');
  await cta.click();
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  console.log('Current URL after clicking free lesson:', currentUrl);
  await page.screenshot({ path: path.join(OUT_DIR, 'free-lesson-clicked.png'), fullPage: true });

  // 2. Test Login with Google
  console.log('Testing Continue with Google...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'login-page.png') });
  
  const googleBtn = page.locator('button:has-text("Continue with Google")');
  await googleBtn.click();
  await page.waitForTimeout(1200);
  const postLoginUrl = page.url();
  console.log('URL after Google login:', postLoginUrl);
  await page.screenshot({ path: path.join(OUT_DIR, 'post-google-login-dashboard.png') });

  // 3. Test Mobile viewport on home
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'home-mobile.png'), fullPage: true });

  await browser.close();
  console.log('Verification script completed successfully.');
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
