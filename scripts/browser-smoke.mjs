import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:4173/';
const evidence = process.argv[3] || '/tmp/tokenz-web-evidence';
const url = new URL(base);
assert(['127.0.0.1', 'localhost', 'carloscaceres86.github.io'].includes(url.hostname));
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
const requests = new Set();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
page.on('request', request => requests.add(new URL(request.url()).hostname));

try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.title(), 'Tokenz · Pequeños logros, grandes sonrisas');
  await page.screenshot({ path: path.join(evidence, 'home-desktop.png') });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(node => node === document.activeElement), true);
  await page.locator('h1').click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: path.join(evidence, `home-${width}.png`), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `horizontal overflow at ${width}`);
    for (const element of await page.locator('.header-inner nav a, .header-inner > .action, .site-footer nav a').all()) {
      assert((await element.boundingBox()).height >= 48, `small navigation touch target at ${width}`);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidence, 'home-mobile.png') });
  await page.getByRole('link', { name: 'Descubre el tablero' }).click();
  assert.equal(new URL(page.url()).hash, '#demo');
  const points = page.locator('#demo-balance');
  const chores = page.getByRole('button', { name: /Recoger los juguetes/ });
  await chores.click(); assert.equal(await points.textContent(), '2');
  await chores.click(); assert.equal(await points.textContent(), '0');
  await page.getByRole('tab', { name: 'Mis normas' }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: 'Recompensas' }).getAttribute('aria-selected'), 'true');
  await page.locator('#reward-open').click();
  assert.equal(await page.locator('#reward-confirm').isVisible(), false);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#reward-dialog').isVisible(), false);
  assert.equal(await page.locator('#reward-open').evaluate(node => node === document.activeElement), true);
  await page.getByRole('tab', { name: 'Mis normas' }).click();
  await chores.click();
  await page.getByRole('button', { name: /Leer un ratito/ }).click();
  assert.equal(await points.textContent(), '5');
  await page.getByRole('tab', { name: 'Recompensas' }).click();
  await page.locator('#reward-open').click();
  await page.getByRole('button', { name: 'Volver al tablero', exact: true }).click();
  assert.equal(await points.textContent(), '5');
  await page.locator('#reward-open').click();
  await page.screenshot({ path: path.join(evidence, 'reward-mobile.png') });
  await page.getByRole('button', { name: '¡A disfrutar!' }).click();
  assert.equal(await points.textContent(), '0');
  await page.locator('#demo-reset').click();
  assert.equal(await chores.isEnabled(), true);
  assert.equal(await chores.getAttribute('aria-pressed'), 'false');
  assert.equal(await points.textContent(), '0');
  await chores.click(); await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await points.textContent(), '0', 'demo resets after reload');
  await page.locator('summary').filter({ hasText: '¿Tokenz tendrá un plan gratuito?' }).click();
  assert.equal(await page.locator('details').filter({ hasText: '¿Tokenz tendrá un plan gratuito?' }).getAttribute('open'), '');

  for (const section of ['privacy/', 'privacy/app/', 'help/']) {
    await page.goto(new URL(section, base).href, { waitUntil: 'networkidle' });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${section} overflow at ${width}`);
    }
    if (section === 'privacy/') {
      await page.getByRole('link', { name: 'política de privacidad de la app Tokenz', exact: true }).click();
      assert.equal(new URL(page.url()).pathname, '/privacy/app/');
    }
    if (section === 'privacy/app/') {
      await page.getByRole('link', { name: 'Eliminar cuenta', exact: true }).click();
      assert.equal(new URL(page.url()).hash, '#eliminar-cuenta');
      assert.equal(await page.locator('#eliminar-cuenta').getByText('Todavía no está operativo.', { exact: false }).isVisible(), true);
      await page.getByRole('link', { name: 'Tus derechos', exact: true }).click();
      assert.equal(new URL(page.url()).hash, '#derechos');
      await page.getByRole('link', { name: 'Tokenz, inicio' }).first().click();
      await page.goto(new URL('privacy/app/', base).href, { waitUntil: 'networkidle' });
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(new URL('privacy/app/', base).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(evidence, `privacy-app-${width}.png`) });
      }
    }
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    assert.equal(new URL(page.url()).pathname, '/');
  }
  assert.deepEqual([...requests], [url.hostname], 'no third-party asset/data requests');
  assert.equal((await context.cookies()).length, 0, 'website creates no cookies');
  assert.deepEqual(errors, [], 'browser console and HTTP resources clean');
  console.log('Browser checks passed: 4 responsive widths, keyboard/tabs, norm undo, reward insufficient/cancel/Escape/confirm/reset/reload, FAQ, help/privacy/app-policy and deletion/rights anchors, no external requests or cookies.');
  console.log(`Screenshots: ${evidence}`);
} finally {
  await browser.close();
}
