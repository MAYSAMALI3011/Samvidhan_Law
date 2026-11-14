import { chromium } from 'playwright';

async function testHome() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(500);

  const homeElements = await page.evaluate(() => {
    const list = [];
    const elements = document.querySelectorAll('p, span, h1, h2, h3, a, button');
    for (const el of elements) {
      if (el.offsetParent !== null && el.innerText.trim().length > 0) {
        const style = window.getComputedStyle(el);
        list.push({
          tag: el.tagName,
          text: el.innerText.slice(0, 30),
          color: style.color,
          bg: style.backgroundColor
        });
      }
    }
    return list.slice(0, 30);
  });

  console.log('Sample Home Elements Colors in Light Theme:');
  for (const item of homeElements) {
    console.log(item.tag, `"${item.text}"`, 'color:', item.color, 'bg:', item.bg);
  }

  await browser.close();
}

testHome();
