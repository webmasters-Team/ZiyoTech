const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('URL1=' + page.url());
  const card = page.locator('text=Website Development').first();
  await card.waitFor({ timeout: 20000 });
  await card.click();
  await page.waitForTimeout(2000);
  console.log('URL2=' + page.url());
  const text = await page.locator('body').innerText();
  console.log(text.slice(0, 600));
  await browser.close();
})();
