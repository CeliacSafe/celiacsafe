import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];

page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) =>
  logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText ?? ''}`)
);

const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(5000);

const root = await page.evaluate(() => ({
  html: document.getElementById('root')?.innerHTML?.slice(0, 1000) ?? 'EMPTY',
  children: document.getElementById('root')?.childElementCount ?? -1,
  text: document.getElementById('root')?.textContent?.trim().slice(0, 200) ?? '',
}));

console.log(JSON.stringify({ url, status: response?.status(), root, logs }, null, 2));
await browser.close();
