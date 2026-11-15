import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

const ROOT_DIR = path.resolve(__dirname, '../../');
const isAfter = process.argv.includes('--after');
const OUT_DIR = path.join(ROOT_DIR, 'qa', 'screenshots', isAfter ? 'after' : 'before');

const SIZES = [
  { name: 'phone-360', width: 360, height: 740 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'phone-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 }
];

const ROUTES = [
  { path: '/', slug: 'home' },
  { path: '/learn', slug: 'learn' },
  { path: '/learn/constitution-foundations/cf-preamble', slug: 'lesson' },
  { path: '/constitution', slug: 'constitution' },
  { path: '/library', slug: 'library' },
  { path: '/ask', slug: 'ask' },
  { path: '/login', slug: 'login' },
  { path: '/settings', slug: 'settings' }
];

const THEMES = ['light', 'dark'];

async function captureScreenshots() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  console.log(`[screenshots] Capturing ${isAfter ? 'AFTER' : 'BEFORE'} screenshots to ${OUT_DIR}...`);

  for (const size of SIZES) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        deviceScaleFactor: 1
      });
      const page = await context.newPage();

      for (const route of ROUTES) {
        const url = `${BASE_URL}${route.path}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch {
          await page.goto(url, { waitUntil: 'load', timeout: 15000 });
        }

        await page.evaluate((th) => document.documentElement.setAttribute('data-theme', th), theme);
        await page.waitForTimeout(150);

        const filename = `${route.slug}_${size.name}_${theme}.png`;
        const filepath = path.join(OUT_DIR, filename);
        await page.screenshot({ path: filepath, fullPage: false });
      }

      await context.close();
    }
  }

  // Also capture open states on mobile
  const mContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mPage = await mContext.newPage();
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await mPage.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await mPage.waitForTimeout(200);

  const menuBtn = mPage.locator('.mobile-hamburger-btn');
  if (await menuBtn.count() > 0) {
    await menuBtn.click();
    await mPage.waitForTimeout(400);
    await mPage.screenshot({ path: path.join(OUT_DIR, 'menu_open_390_dark.png') });
  }

  await browser.close();
  console.log(`[screenshots] Finished capturing all screenshots to ${OUT_DIR}.`);
}

captureScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
