import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('../../qa/references');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const urls = [
    { name: 'wikipedia-mobile', url: 'https://en.m.wikipedia.org/wiki/Constitution_of_India' },
    { name: 'vercel-docs-mobile', url: 'https://vercel.com/docs' }
  ];

  for (const item of urls) {
    try {
      const page = await context.newPage();
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT_DIR, `${item.name}.png`) });
      console.log(`Captured ${item.name}`);
      await page.close();
    } catch (e) {
      console.log(`Could not capture ${item.name}:`, e.message);
    }
  }

  await browser.close();
}

capture();
