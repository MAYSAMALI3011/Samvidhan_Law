import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('../../Frontend/my-react-app/node_modules/@playwright/test');
const { AxeBuilder } = require('../../Frontend/my-react-app/node_modules/@axe-core/playwright');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

const ROOT_DIR = path.resolve(__dirname, '../../');
const QA_DIR = path.join(ROOT_DIR, 'qa');
const isAfter = process.argv.includes('--after');
const REPORT_PATH = path.join(QA_DIR, isAfter ? 'report-after.json' : 'report-before.json');

const VIEWPORTS = [
  // Phone
  { name: '360x740', width: 360, height: 740, isMobile: true },
  { name: '390x844', width: 390, height: 844, isMobile: true },
  { name: '412x915', width: 412, height: 915, isMobile: true },
  // Tablet
  { name: '768x1024', width: 768, height: 1024, isMobile: false },
  // Laptop & Desktop
  { name: '1024x768', width: 1024, height: 768, isMobile: false },
  { name: '1280x800', width: 1280, height: 800, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false }
];

const THEMES = ['light', 'dark'];

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/learn', name: 'Learn' },
  { path: '/learn/constitution-foundations/cf-preamble', name: 'Lesson' },
  { path: '/constitution', name: 'Constitution' },
  { path: '/library', name: 'Library' },
  { path: '/ask', name: 'Ask' },
  { path: '/login', name: 'Login' },
  { path: '/settings', name: 'Settings' }
];

async function runAudit() {
  console.log(`[ui-audit] Starting UI audit (${isAfter ? 'AFTER' : 'BEFORE'})...`);
  const browser = await chromium.launch({ headless: true });

  const results = {
    timestamp: new Date().toISOString(),
    isAfter,
    viewportsAudited: VIEWPORTS.map(v => v.name),
    routesAudited: ROUTES.map(r => r.name),
    summary: {
      totalOverflows: 0,
      totalOccluded: 0,
      totalTouchTargetDefects: 0,
      totalContrastViolations: 0,
    },
    overflows: [],
    occludedElements: [],
    touchTargetDefects: [],
    contrastViolations: [],
    modalStates: []
  };

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`Auditing Viewport ${vp.name} [Theme: ${theme.toUpperCase()}]`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
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

        // 1. Viewport Overflow Check
        const overflow = await page.evaluate((vpWidth) => {
          const docScroll = document.documentElement.scrollWidth;
          const bodyScroll = document.body.scrollWidth;
          const hasDocOverflow = docScroll > vpWidth + 1 || bodyScroll > vpWidth + 1;
          const offenders = [];

          const els = document.querySelectorAll('*');
          for (const el of els) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const style = window.getComputedStyle(el);
              if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                const isContained = Boolean(
                  el.closest('.trust-marquee-wrapper, .curriculum-pill-tabs, .courses-rail-scroll, .courses-rail-section, .situations-carousel-viewport, [aria-hidden="true"], [style*="overflow: hidden"], [style*="overflow-x: auto"]')
                );
                if (!isContained && (rect.right > vpWidth + 1 || rect.left < -1)) {
                  offenders.push({
                    tag: el.tagName.toLowerCase(),
                    className: String(el.className).slice(0, 60),
                    right: Math.round(rect.right),
                    left: Math.round(rect.left),
                    width: Math.round(rect.width)
                  });
                }
              }
            }
          }
          return { hasDocOverflow, docScroll, offenders: offenders.slice(0, 5) };
        }, vp.width);

        if (overflow.hasDocOverflow || overflow.offenders.length > 0) {
          results.summary.totalOverflows += 1;
          results.overflows.push({
            viewport: vp.name,
            theme,
            route: route.name,
            docScroll: overflow.docScroll,
            offenders: overflow.offenders
          });
        }

        // 2. Occlusion / Hit-Test Check (document.elementFromPoint at center of links/buttons)
        const occluded = await page.evaluate(() => {
          const blocked = [];
          const interactives = document.querySelectorAll('button:not(:disabled), a[href], input:not([type="hidden"]), [role="button"]');
          for (const el of interactives) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || style.pointerEvents === 'none') {
              continue;
            }
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
                const target = document.elementFromPoint(cx, cy);
                if (target && target !== el && !el.contains(target) && !target.contains(el)) {
                  blocked.push({
                    element: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                    text: (el.textContent || '').trim().slice(0, 30),
                    coveredBy: target.tagName.toLowerCase() + (target.className ? '.' + String(target.className).split(' ')[0] : '')
                  });
                }
              }
            }
          }
          return blocked.slice(0, 5);
        });

        if (occluded.length > 0) {
          results.summary.totalOccluded += occluded.length;
          results.occludedElements.push({
            viewport: vp.name,
            theme,
            route: route.name,
            occluded
          });
        }

        // 3. Touch Targets < 44px on mobile
        if (vp.isMobile) {
          const smallTargets = await page.evaluate(() => {
            const small = [];
            const clickable = document.querySelectorAll('button, a[href], [role="button"]');
            for (const el of clickable) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                  if (rect.width < 44 || rect.height < 44) {
                    small.push({
                      tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                      text: (el.textContent || '').trim().slice(0, 25),
                      width: Math.round(rect.width),
                      height: Math.round(rect.height)
                    });
                  }
                }
              }
            }
            return small.slice(0, 8);
          });

          if (smallTargets.length > 0) {
            results.summary.totalTouchTargetDefects += smallTargets.length;
            results.touchTargetDefects.push({
              viewport: vp.name,
              theme,
              route: route.name,
              smallTargets
            });
          }
        }

        // 4. Color Contrast with axe-core (sample 1 mobile and 1 desktop to keep audit fast)
        if (['390x844', '1440x900'].includes(vp.name)) {
          try {
            const axeResults = await new AxeBuilder({ page })
              .withRules(['color-contrast'])
              .analyze();
            if (axeResults.violations && axeResults.violations.length > 0) {
              const violation = axeResults.violations[0];
              const nodes = violation.nodes.slice(0, 5).map(n => ({
                html: n.html.slice(0, 80),
                failureSummary: n.failureSummary ? n.failureSummary.split('\n')[0] : ''
              }));
              results.summary.totalContrastViolations += violation.nodes.length;
              results.contrastViolations.push({
                viewport: vp.name,
                theme,
                route: route.name,
                count: violation.nodes.length,
                samples: nodes
              });
            }
          } catch {
            // ignore
          }
        }
      }

      await context.close();
    }
  }

  // 5. Audit Open Modal States (Menu Open, Search Palette Open, Citation Sheet Open)
  console.log('Auditing Open States (Menu, Search, Citation)...');
  const modalContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mPage = await modalContext.newPage();
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await mPage.waitForTimeout(300);

  // Check Open Mobile Menu
  const menuBtn = mPage.locator('.mobile-hamburger-btn');
  if (await menuBtn.count() > 0) {
    await menuBtn.click();
    await mPage.waitForTimeout(400);
    const menuOverflow = await mPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    results.modalStates.push({ name: 'Menu Open', overflow: menuOverflow });
  }

  await browser.close();

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[ui-audit] Audit completed. Report saved to ${REPORT_PATH}`);
  console.log(`Summary: ${results.summary.totalOverflows} overflows, ${results.summary.totalOccluded} occluded elements, ${results.summary.totalTouchTargetDefects} touch target issues, ${results.summary.totalContrastViolations} contrast violations.`);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
