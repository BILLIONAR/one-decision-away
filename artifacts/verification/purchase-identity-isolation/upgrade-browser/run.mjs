import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const repo = '/workspace/oda-purchase-identity-fix';
const require = createRequire(path.join(repo, 'package.json'));
const { build } = await import(require.resolve('esbuild'));
const { chromium } = require('playwright');
const baseURL = 'http://127.0.0.1:4189';
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const html = fs.readFileSync(path.join(repo, 'dist/index.html'), 'utf8');
const css = html.match(/href="\/one-decision-away\/(assets\/index-[^"]+\.css)"/)?.[1];
assert.ok(css, 'Fresh built main CSS must exist.');
const mockPath = path.join(out, 'mock.ts');
const result = await build({ entryPoints: [path.join(out, 'fixture.tsx')], absWorkingDir: repo,
  nodePaths: [path.join(repo, 'node_modules')], bundle: true, write: false, format: 'iife', platform: 'browser',
  jsx: 'automatic', define: { 'import.meta.env': '{}' }, plugins: [{ name: 'synthetic-boundaries', setup(build) {
    build.onResolve({ filter: /(?:services\/(?:purchases|cloudSync|native)|store\/useApp)$/ }, args => ({ path: args.path, namespace: 'synthetic' }));
    build.onLoad({ filter: /.*/, namespace: 'synthetic' }, args => ({ loader: 'ts', resolveDir: repo,
      contents: args.path.endsWith('store/useApp')
        ? `import {app} from ${JSON.stringify(mockPath)}; export const useApp = () => app;`
        : args.path.endsWith('services/purchases')
          ? `export { purchases, usePro, MANAGE_SUBSCRIPTIONS_URL, productIdFor, annualSavingPercent } from ${JSON.stringify(mockPath)};`
          : args.path.endsWith('services/cloudSync')
            ? `export { cloudSync } from ${JSON.stringify(mockPath)};`
            : `export { haptic, openExternal } from ${JSON.stringify(mockPath)};` }));
  } }] });
fs.writeFileSync(path.join(out, 'fixture.js'), result.outputFiles[0].text);
const pageHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ODA Upgrade synthetic native acceptance fixture</title>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; object-src 'none'">
  <link rel="stylesheet" href="/built/${css}">
  <style>body{margin:0;background:var(--bg);color:var(--fg)}#fixture-controls{margin:12px 16px;font:12px system-ui;max-width:560px}#fixture-controls button,#fixture-controls select{margin:4px;padding:6px;border:1px solid #777;border-radius:4px}#root{max-width:592px;margin:0 auto;padding:16px}#fixture-message{font:12px system-ui}</style>
  </head><body><details id="fixture-controls"></details><div id="fixture-message"></div><main id="root"></main><script src="/fixture.js"></script></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), pageHTML);
const mime = { '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, baseURL).pathname;
  const relative = pathname.startsWith('/built/') ? pathname.slice('/built/'.length) : pathname.slice(1) || 'index.html';
  const root = pathname.startsWith('/built/') ? path.join(repo, 'dist') : out;
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4189, '127.0.0.1', resolve); });
if (process.argv.includes('--serve')) { console.log(`Interactive mock fixture ready at ${baseURL}. Ctrl+C stops it.`); await new Promise(() => {}); }

const report = { at: new Date().toISOString(), baseURL, browser: '', sourceHashes: {
  upgrade: sha(path.join(repo, 'src/pages/Upgrade.tsx')), purchases: sha(path.join(repo, 'src/services/purchases.ts')),
  mainCSS: { path: css, sha256: sha(path.join(repo, 'dist', css)) }, fixture: sha(path.join(out, 'fixture.tsx')), mocks: sha(mockPath),
}, checks: [], screenshots: [], errors: [], externalAttempts: [], providerCalls: 0, deliberatelySyntheticNative: true,
  limits: ['Real Upgrade component, translations, entitlements, course data and current built main CSS/fonts; synthetic store/native/cloud/purchase boundaries.',
    'Browser verification covers UI state and layout, not native RevenueCat or Apple purchase behavior.',
    'The synthetic identity guard models the independently tested real service revision/confirmation contract.',
    'Chromium on the selected saved Linux cloud environment; no physical phone or WebKit claim.'] };
let browser;
const check = (name, evidence = {}) => { report.checks.push({ name, passed: true, ...evidence }); };
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
  report.browser = await browser.version();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === baseURL) return route.continue();
    report.externalAttempts.push(route.request().url()); return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(baseURL);
  await page.waitForFunction(() => Boolean(window.ODA_PURCHASE_FIXTURE));
  await page.evaluate(() => document.fonts.ready);
  const snap = () => page.evaluate(() => window.ODA_PURCHASE_FIXTURE.snapshot());
  const reset = async () => { await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.reset()); await page.getByRole('button', { name: 'Start 7 days free', exact: true }).waitFor(); };
  const buy = () => page.getByRole('button', { name: 'Start 7 days free', exact: true });
  const restore = () => page.getByRole('button', { name: 'Restore purchases', exact: true });

  for (const [kind, lateResult] of [['purchase', 'pending'], ['restore', 'restored']]) {
    await reset();
    await (kind === 'purchase' ? buy() : restore()).click();
    await page.waitForFunction(kind => window.ODA_PURCHASE_FIXTURE.snapshot().pending.some(operation => operation.kind === kind), kind);
    await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.transition('B', 'pending'));
    assert.equal(await page.getByRole('button', { name: /^Restore purchases$|^Restoring…$/ }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: 'Start 7 days free', exact: true }).count(), 0);
    await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.transition('A'));
    assert.equal(await page.getByRole('button', { name: kind === 'purchase' ? 'One moment…' : 'Start 7 days free', exact: true }).isDisabled(), true);
    assert.equal((await snap()).state.identityRevision > 1, true);
    await page.evaluate(({ kind, lateResult }) => window.ODA_PURCHASE_FIXTURE.release(kind, lateResult), { kind, lateResult });
    await page.waitForFunction(() => window.ODA_PURCHASE_FIXTURE.snapshot().pending.length === 0);
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'Start 7 days free' && !button.disabled));
    assert.deepEqual((await snap()).toasts, []);
    assert.equal(await page.getByRole('status').count(), 0);
    check(`${kind}: A→B→A suppresses late ${lateResult} toast/notice and clears busy`, { state: (await snap()).state, calls: (await snap()).calls });
  }

  await reset();
  await buy().click();
  await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.release('purchase', 'pending'));
  await page.getByRole('status').waitFor();
  assert.equal(await buy().isDisabled(), true);
  assert.equal((await snap()).toasts.length, 1);
  await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.transition('B'));
  await page.waitForFunction(() => document.querySelector('[role="status"]') === null);
  assert.equal(await buy().isDisabled(), false);
  check('Pending purchase notice/awaiting tier clears on desired B revision', { toastBeforeSwitch: (await snap()).toasts[0] });
  await reset();
  await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.transition('B', 'pending'));
  await page.getByLabel('Checking the subscription for this account…', { exact: true }).waitFor();
  assert.equal(await restore().isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Start 7 days free', exact: true }).count(), 0);
  assert.equal(await page.getByRole('list', { name: 'How the free trial works', exact: true }).count(), 0);
  check('Identity pending makes buy unavailable, disables restore and removes all confirmed-trial UI');

  const labels = {
    en: { retry: 'Retry account verification', restore: 'Restore purchases', buy: 'Subscribe to Pro', pending: 'Checking the subscription for this account…', trial: '7 days free' },
    tr: { retry: 'Hesap doğrulamasını yeniden dene', restore: 'Satın alımları geri yükle', buy: 'Pro için abone ol', pending: 'Bu hesabın aboneliği kontrol ediliyor…', trial: '7 gün ücretsiz' },
    es: { retry: 'Reintentar la verificación de la cuenta', restore: 'Restaurar compras', buy: 'Suscribirme a Pro', pending: 'Comprobando la suscripción de esta cuenta…', trial: '7 días gratis' },
  };
  for (const locale of ['en', 'tr', 'es']) for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.transition('A', 'failed'));
    await page.evaluate(locale => window.ODA_PURCHASE_FIXTURE.setLocale(locale), locale);
    const retry = page.getByRole('button', { name: labels[locale].retry, exact: true });
    await retry.waitFor();
    assert.equal(await page.getByRole('button', { name: labels[locale].restore, exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: labels[locale].buy, exact: true }).isDisabled(), true);
    assert.equal(await page.getByText(labels[locale].trial, { exact: true }).count(), 0);
    const layout = await page.evaluate(() => {
      const main = document.querySelector('main'), alert = main.querySelector('[role="alert"]');
      const button = alert.querySelector('button'), rect = button.getBoundingClientRect(), mainRect = main.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(button); const text = range.getBoundingClientRect();
      return { viewport: innerWidth, documentScroll: document.documentElement.scrollWidth, mainScroll: main.scrollWidth, mainWidth: main.clientWidth,
        retry: { x: rect.x, right: rect.right, width: rect.width, height: rect.height, textWidth: text.width, textHeight: text.height },
        mainBounds: { x: mainRect.x, right: mainRect.right }, alertOverflow: alert.scrollWidth > alert.clientWidth,
        cssLoaded: getComputedStyle(main.querySelector('h1')).fontSize, fontStatus: document.fonts.status };
    });
    assert.ok(layout.documentScroll <= width + 1, `${locale}${width}: document overflow`);
    assert.ok(layout.mainScroll <= layout.mainWidth + 1, `${locale}${width}: component overflow`);
    assert.equal(layout.alertOverflow, false);
    assert.ok(layout.retry.x >= 0 && layout.retry.right <= width + 1);
    assert.ok(layout.retry.textWidth <= layout.retry.width + 1 && layout.retry.textHeight <= layout.retry.height + 1, `${locale}${width}: clipped retry text`);
    assert.ok(parseFloat(layout.cssLoaded) >= 36, 'Actual built component CSS is active.');
    await page.evaluate(() => window.scrollTo(0, 0));
    const screenshot = `identity-failed-${locale}-${width}.png`;
    await page.screenshot({ path: path.join(out, screenshot), fullPage: true });
    report.screenshots.push(screenshot);
    check(`${locale} ${width}px: failed identity disables buy/restore, suppresses stale eligible trial and fits localized retry`, layout);
    await retry.click();
    await page.getByLabel(labels[locale].pending, { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: labels[locale].restore, exact: true }).isDisabled(), true);
    await page.evaluate(() => window.ODA_PURCHASE_FIXTURE.resolveIdentity(true));
    await page.waitForFunction(() => window.ODA_PURCHASE_FIXTURE.snapshot().state.identityConfirmed === true);
    await page.getByRole('alert').waitFor({ state: 'hidden' });
    check(`${locale} ${width}px: localized retry invokes actual binding helper and returns through pending verification`, { calls: (await snap()).calls.filter(call => ['cloud-init', 'identify'].includes(call.kind)) });
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.externalAttempts, []);
  check('No page errors, provider calls or external requests');
} catch (error) {
  report.failure = String(error.stack || error);
  throw error;
} finally {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify({ out, checks: report.checks.length, screenshots: report.screenshots.length, errors: report.errors, failure: report.failure ?? null }));
}
