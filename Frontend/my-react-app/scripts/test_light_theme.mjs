import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('../../qa/theme-test');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function testTheme() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // Start preview server check or live
  const BASE_URL = 'http://localhost:4173';
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('samvidhan-theme-preference', 'light');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'home-light-mobile.png'), fullPage: true });

  await page.goto(`${BASE_URL}/ask`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(500);

  // Check text contrast on ask page
  const contrastInfo = await page.evaluate(() => {
    const card = document.querySelector('.ask-page-card');
    const title = document.querySelector('.ask-page-title');
    const emptyDesc = document.querySelector('.ask-empty-desc');
    const chip = document.querySelector('.ask-prompt-chip');

    const getStyle = el => el ? {
      color: window.getComputedStyle(el).color,
      bg: window.getComputedStyle(el).backgroundColor
    } : null;

    return {
      card: getStyle(card),
      title: getStyle(title),
      emptyDesc: getStyle(emptyDesc),
      chip: getStyle(chip)
    };
  });

  console.log('Ask Page Computed Styles in Light Theme:', contrastInfo);
  await page.screenshot({ path: path.join(OUT_DIR, 'ask-light-mobile.png'), fullPage: true });

  await browser.close();
}

testTheme().catch(console.error);
