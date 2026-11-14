import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('../../qa/live-after');

async function checkLive() {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto('https://samvidhan-law.pages.dev/', { waitUntil: 'networkidle' });
  const desktopAudit = await desktop.evaluate(() => {
    const htmlStyle = window.getComputedStyle(document.documentElement);
    const bodyStyle = window.getComputedStyle(document.body);
    return {
      htmlOverflowY: htmlStyle.overflowY,
      bodyOverflowY: bodyStyle.overflowY,
      hasDoubleScrollbar: (bodyStyle.overflowY === 'scroll' || bodyStyle.overflowY === 'auto') && document.body.scrollHeight > window.innerHeight
    };
  });
  console.log('Live Desktop Audit:', desktopAudit);
  await desktop.screenshot({ path: path.join(OUT_DIR, 'home-desktop.png'), fullPage: true });

  // Test Start a free lesson click on live
  const cta = desktop.locator('text=Start a free lesson');
  await cta.click();
  await desktop.waitForTimeout(1500);
  console.log('Live URL after free lesson click:', desktop.url());
  await desktop.screenshot({ path: path.join(OUT_DIR, 'lesson-desktop.png'), fullPage: true });
  await desktop.close();

  // Mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto('https://samvidhan-law.pages.dev/', { waitUntil: 'networkidle' });
  const mobileAudit = await mobile.evaluate(() => {
    const launcher = document.querySelector('.ask-samvidhan-launcher-root');
    const launcherVisible = launcher ? window.getComputedStyle(launcher).display !== 'none' : false;
    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth;
    return {
      launcherVisible,
      hasHorizontalOverflow,
      scrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth
    };
  });
  console.log('Live Mobile Audit:', mobileAudit);
  await mobile.screenshot({ path: path.join(OUT_DIR, 'home-mobile.png'), fullPage: true });
  await mobile.close();

  await browser.close();
  console.log('Live check finished successfully.');
}

checkLive().catch(console.error);
