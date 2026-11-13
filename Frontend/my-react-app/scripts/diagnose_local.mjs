import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const OUT_DIR = path.resolve('../../qa/local-preview');

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

      page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          pageLogs.push({ type: msg.type(), text: msg.text() });
        }
      });

      page.on('response', res => {
        if (res.status() >= 400) {
          failedRequests.push({
            url: res.url(),
            status: res.status(),
            contentType: res.headers()['content-type'] || ''
          });
        }
      });

      const fullUrl = BASE_URL + r.path;
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (err) {}

      await page.waitForTimeout(1000);

      const screenshotName = r.name + '-' + vp.name + '.png';
      const screenshotPath = path.join(OUT_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      report.pages.push({
        route: r.name,
        path: r.path,
        viewport: vp.name,
        url: fullUrl,
        screenshot: screenshotName,
        logs: pageLogs,
        failedRequests
      });

      await page.close();
      console.log('[LOCAL DONE] ' + r.name + ' @ ' + vp.name);
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, 'local_diagnosis.json'), JSON.stringify(report, null, 2));
  console.log('Local preview diagnosis saved.');
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
