import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://samvidhan-law.pages.dev';
const OUT_DIR = path.resolve('../../qa/live-before');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'constitution', path: '/constitution' },
  { name: 'constitution-topic', path: '/constitution/preamble' },
  { name: 'library', path: '/library' },
  { name: 'learn', path: '/learn' },
  { name: 'lesson', path: '/learn/foundations/preamble' },
  { name: 'ask', path: '/ask' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'dashboard', path: '/dashboard' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }
];

const report = {
  timestamp: new Date().toISOString(),
  target: BASE_URL,
  pages: []
};

async function diagnose() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile || false,
      hasTouch: vp.hasTouch || false,
      deviceScaleFactor: 2
    });

    for (const r of routes) {
      const page = await context.newPage();
      const pageLogs = [];
      const failedRequests = [];
      const allRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          pageLogs.push({ type: msg.type(), text: msg.text() });
        }
      });

      page.on('requestfailed', req => {
        failedRequests.push({
          url: req.url(),
          method: req.method(),
          failure: req.failure()?.errorText || 'Unknown failure'
        });
      });

      page.on('response', res => {
        allRequests.push({
          url: res.url(),
          status: res.status(),
          contentType: res.headers()['content-type'] || ''
        });
        if (res.status() >= 400) {
          failedRequests.push({
            url: res.url(),
            status: res.status(),
            contentType: res.headers()['content-type'] || ''
          });
        }
      });

      const fullUrl = BASE_URL + r.path;
      let navigationError = null;
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (err) {
        navigationError = err.message;
      }

      await page.waitForTimeout(2000);

      // Check overflow & scrollbars
      const layoutAudit = await page.evaluate(() => {
        const docElem = document.documentElement;
        const body = document.body;

        const hasHorizontalOverflow = docElem.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth;
        
        const overflowingElements = [];
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth + 2 || rect.left < -2) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              className: el.className?.toString?.() || '',
              id: el.id,
              rect: { left: rect.left, right: rect.right, width: rect.width }
            });
            if (overflowingElements.length >= 10) break;
          }
        }

        const verticalScrollContainers = [];
        for (const el of allElements) {
          const style = window.getComputedStyle(el);
          const hasScrollY = (style.overflowY === 'scroll' || style.overflowY === 'auto') && el.scrollHeight > el.clientHeight;
          if (hasScrollY && el !== docElem && el !== body) {
            verticalScrollContainers.push({
              tag: el.tagName.toLowerCase(),
              className: el.className?.toString?.() || '',
              id: el.id,
              scrollHeight: el.scrollHeight,
              clientHeight: el.clientHeight,
              overflowY: style.overflowY
            });
          }
        }

        const htmlStyle = window.getComputedStyle(docElem);
        const bodyStyle = window.getComputedStyle(body);

        return {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          docScrollWidth: docElem.scrollWidth,
          docScrollHeight: docElem.scrollHeight,
          bodyScrollWidth: body.scrollWidth,
          bodyScrollHeight: body.scrollHeight,
          htmlOverflowY: htmlStyle.overflowY,
          bodyOverflowY: bodyStyle.overflowY,
          hasHorizontalOverflow,
          overflowingElements,
          verticalScrollContainers
        };
      });

      const screenshotName = r.name + '-' + vp.name + '.png';
      const screenshotPath = path.join(OUT_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      report.pages.push({
        route: r.name,
        path: r.path,
        viewport: vp.name,
        url: fullUrl,
        screenshot: screenshotName,
        navigationError,
        logs: pageLogs,
        failedRequests,
        layoutAudit
      });

      await page.close();
      console.log('[DONE] ' + r.name + ' @ ' + vp.name);
    }
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'diagnosis_results.json'), JSON.stringify(report, null, 2));
  console.log('Diagnosis completed successfully. Results saved to qa/live-before/diagnosis_results.json');
}

diagnose().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
