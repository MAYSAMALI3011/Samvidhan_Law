import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const OUT_DIR = path.resolve('../../qa/after');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const routes = [
  { name: 'home', path: '/' },
  { name: 'constitution', path: '/constitution' },
  { name: 'library', path: '/library' },
  { name: 'learn', path: '/learn' },
  { name: 'ask', path: '/ask' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'lesson', path: '/learn/foundations-of-the-republic/preamble-we-the-people' }
];

const viewports = [
  { name: '360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: '412x915', width: 412, height: 915, isMobile: true, hasTouch: true },
  { name: '768x1024', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 }
];

const auditResults = {
  timestamp: new Date().toISOString(),
  target: BASE_URL,
  audits: []
};

async function runAudit() {
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
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      try {
        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      } catch (e) {}

      await page.waitForTimeout(600);

      // Perform Layout, Overflow & Tap-Target Checks
      const pageAudit = await page.evaluate(({ isMobile, vpWidth }) => {
        const docElem = document.documentElement;
        const body = document.body;

        // Check horizontal overflow
        const hasHorizontalOverflow = docElem.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth;
        const maxScrollWidth = Math.max(docElem.scrollWidth, body.scrollWidth);

        // Check double scrollbar
        const htmlStyle = window.getComputedStyle(docElem);
        const bodyStyle = window.getComputedStyle(body);
        const hasBodyScrollbar = (bodyStyle.overflowY === 'scroll' || bodyStyle.overflowY === 'auto') && body.scrollHeight > window.innerHeight;

        // Check input font size
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        const smallInputs = inputs.filter(el => {
          const fs = parseFloat(window.getComputedStyle(el).fontSize);
          return fs < 15.5; // allowance for rounding
        }).length;

        // Check interactive tap targets on mobile
        let undersizedButtons = 0;
        if (isMobile) {
          const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"], a.btn'));
          undersizedButtons = buttons.filter(el => {
            const rect = el.getBoundingClientRect();
            // Ignore hidden elements
            if (rect.width === 0 || rect.height === 0 || el.offsetParent === null) return false;
            return rect.height < 40 && rect.width < 40;
          }).length;
        }

        // Check floating launcher on mobile
        const launcher = document.querySelector('.ask-samvidhan-launcher-root');
        const launcherVisible = launcher ? window.getComputedStyle(launcher).display !== 'none' : false;

        return {
          windowWidth: vpWidth,
          maxScrollWidth,
          hasHorizontalOverflow,
          htmlOverflowY: htmlStyle.overflowY,
          bodyOverflowY: bodyStyle.overflowY,
          hasBodyScrollbar,
          smallInputs,
          undersizedButtons,
          launcherVisible
        };
      }, { isMobile: vp.isMobile, vpWidth: vp.width });

      const screenshotName = `${r.name}-${vp.name}.png`;
      await page.screenshot({ path: path.join(OUT_DIR, screenshotName), fullPage: true });

      auditResults.audits.push({
        route: r.name,
        viewport: vp.name,
        screenshot: screenshotName,
        pageAudit,
        consoleErrors
      });

      console.log(`[AUDIT] ${r.name} @ ${vp.name} -> Overflow: ${pageAudit.hasHorizontalOverflow}, BodyScrollbar: ${pageAudit.hasBodyScrollbar}`);
      await page.close();
    }
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'ui_audit_results.json'), JSON.stringify(auditResults, null, 2));
  console.log('UI Audit finished. Results saved to qa/after/ui_audit_results.json');
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
