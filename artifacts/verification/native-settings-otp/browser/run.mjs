import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const repo = '/workspace/oda-native-settings-otp';
const require = createRequire(path.join(repo, 'package.json'));
const { build } = require('esbuild');
const { chromium } = require('playwright');
const baseURL = 'http://127.0.0.1:4190';
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const html = fs.readFileSync(path.join(repo, 'dist/index.html'), 'utf8');
const css = html.match(/href="[^\"]*\/(assets\/index-[^\"]+\.css)"/)?.[1];
assert.ok(css, 'Root must supply fresh built main CSS before this runs.');
const mockPath = path.join(out, 'mock.ts');
const bundle = await build({ entryPoints: [path.join(out, 'fixture.tsx')], absWorkingDir: repo,
  nodePaths: [path.join(repo, 'node_modules')], bundle: true, write: false, outfile: path.join(out, 'fixture.js'),
  format: 'iife', platform: 'browser', jsx: 'automatic', define: { 'import.meta.env': '{"BASE_URL":"/one-decision-away/"}' },
  plugins: [{ name: 'synthetic-auth-boundaries', setup(build) {
    build.onResolve({ filter: /(?:^|\/)(?:cloudSync|native|pushNotifications|useApp)$/ }, args => ({ path: args.path, namespace: 'synthetic' }));
    build.onLoad({ filter: /.*/, namespace: 'synthetic' }, args => ({ loader: 'ts', resolveDir: repo,
      contents: args.path.endsWith('useApp') ? `import {app} from ${JSON.stringify(mockPath)}; export const useApp = () => app;`
        : args.path.endsWith('cloudSync') ? `export { cloudSync } from ${JSON.stringify(mockPath)};`
          : args.path.endsWith('pushNotifications') ? `export { disablePush } from ${JSON.stringify(mockPath)};`
            : `export { isNative } from ${JSON.stringify(mockPath)};` }));
  } }] });
for (const file of bundle.outputFiles) fs.writeFileSync(file.path, file.contents);
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ODA native Settings OTP synthetic acceptance fixture</title><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; object-src 'none'">
  <link rel="stylesheet" href="/one-decision-away/${css}">
  <style>body{margin:0;background:var(--bg);color:var(--fg)}#fixture-controls{margin:12px 16px;font:12px system-ui;max-width:560px}#fixture-controls button,#fixture-controls select{margin:4px;padding:6px;border:1px solid #777;border-radius:4px}#root{max-width:592px;margin:0 auto;padding:16px}</style>
  </head><body><details id="fixture-controls"></details><main id="root"></main><script src="/fixture.js"></script></body></html>`);
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, baseURL).pathname;
  const built = pathname.startsWith('/one-decision-away/');
  const relative = built ? pathname.slice('/one-decision-away/'.length) : pathname.slice(1) || 'index.html';
  const root = built ? path.join(repo, 'dist') : out;
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
  const mime = { '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp' };
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(file).pipe(response);
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4190, '127.0.0.1', resolve); });
if (process.argv.includes('--serve')) { console.log(`Interactive synthetic auth fixture at ${baseURL}`); await new Promise(() => {}); }
const report = { at: new Date().toISOString(), baseURL, browser: '', sourceHashes: Object.fromEntries([
  'src/components/BackupAndCloudSettings.tsx', 'src/pages/Account.tsx', 'src/services/useCloudState.ts', 'src/i18n/account.ts',
].map(file => [file, sha(path.join(repo, file))])), css: { path: css, sha256: sha(path.join(repo, 'dist', css)) },
  checks: [], screenshots: [], layouts: [], errors: [], externalAttempts: [], failedRequests: [], providerCalls: 0, emailsSent: 0,
  limits: ['Real BackupAndCloudSettings, Account, useCloudState, shared UI, translations and current built CSS/fonts/tree assets.',
    'One synthetic cloudSync session is shared by both screens; useApp routes, native detection and notification calls are deliberately mocked.',
    'Local auth responses only: no emails, Supabase/Apple/providers, packages, native configuration or physical-device claims.',
    'Chromium on the selected saved Linux cloud executor. This verifies client behavior, not real email delivery or native authentication.'] };
let browser, page;
const check = (name, evidence = {}) => report.checks.push({ name, passed: true, ...evidence });
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium' }); report.browser = await browser.version();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await context.route('**/*', route => { if (new URL(route.request().url()).origin === baseURL) return route.continue(); report.externalAttempts.push(route.request().url()); return route.abort(); });
  page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.failedRequests.push({ url: response.url(), status: response.status() }); });
  await page.goto(baseURL); await page.waitForFunction(() => Boolean(window.ODA_OTP_FIXTURE)); await page.evaluate(() => document.fonts.ready);
  const snap = () => page.evaluate(() => window.ODA_OTP_FIXTURE.snapshot());
  const count = async kind => (await snap()).calls.filter(call => call.kind === kind).length;
  const copy = () => page.evaluate(() => window.ODA_OTP_FIXTURE.copy());
  const translate = source => page.evaluate(source => window.ODA_OTP_FIXTURE.translate(source), source);
  const reset = async (native = true, route = '/app/settings') => { await page.evaluate(({ native, route }) => window.ODA_OTP_FIXTURE.reset(native, route), { native, route }); await page.waitForFunction(route => window.ODA_OTP_FIXTURE.snapshot().route === route, route); };
  const request = () => page.locator('form').filter({ has: page.locator('#account-email') }).locator('button[type="submit"]');
  const verify = () => page.locator('form').filter({ has: page.locator('#account-code') }).locator('button[type="submit"]');
  const next = (kind, plan) => page.evaluate(({ kind, plan }) => window.ODA_OTP_FIXTURE.next(kind, plan), { kind, plan });
  const longEmail = 'qa.native.settings.long.account@example.test';
  let currentCopy = await copy();
  assert.equal(await page.locator('#cloud-email').count(), 0);
  await page.getByRole('button', { name: currentCopy.continue, exact: true }).click();
  await page.locator('#account-email').waitFor();
  assert.equal((await snap()).route, '/app/account'); assert.equal(await count('send'), 0);
  assert.equal(await request().innerText(), currentCopy.request);
  check('Native Settings routes to Account without calling signIn or retaining a magic-link email form');

  await page.locator('#account-email').fill('invalid-email'); await request().click();
  await page.getByRole('alert').waitFor(); assert.equal(await count('send'), 0);
  check('Invalid email remains local validation and does not send a request');
  await page.locator('#account-email').fill(`  ${longEmail}  `);
  await next('send', { reject: true }); await request().click();
  await page.getByRole('alert').waitFor(); assert.equal(await request().isDisabled(), false);
  assert.equal(await page.getByRole('alert').innerText(), currentCopy.sendFailed);
  check('Rejected send releases busy state and renders retryable native code error');
  await next('send', { ok: false, message: 'Synthetic send declined.' }); await request().click();
  await page.getByText('Synthetic send declined.', { exact: true }).waitFor(); assert.equal(await request().isDisabled(), false);
  await request().click(); await page.locator('#account-code').waitFor();
  assert.equal((await snap()).calls.filter(call => call.kind === 'send').at(-1).email, longEmail);
  check('Send error retries use the trimmed same address and open code entry');

  await page.locator('#account-code').fill('1a2b3'); assert.equal(await page.locator('#account-code').inputValue(), '123'); await verify().click();
  await page.getByRole('alert').waitFor(); assert.equal(await count('verify'), 0);
  check('Code input sanitizes nondigits and invalid length does not reach auth');
  for (const message of ['Synthetic invalid code.', 'Synthetic expired code.']) {
    await page.locator('#account-code').fill('123456'); await next('verify', { ok: false, message }); await verify().click();
    await page.getByText(message, { exact: true }).waitFor(); assert.equal(await verify().isDisabled(), false); assert.equal((await snap()).cloud.session, null);
    check(`${message} preserves code entry and permits retry`);
  }
  await next('verify', { reject: true }); await verify().click(); await page.getByText(currentCopy.verifyFailed, { exact: true }).waitFor();
  assert.equal(await verify().isDisabled(), false); check('Rejected verification renders retryable error and releases busy state');

  await next('send', { ok: false, message: 'Synthetic resend declined.' });
  await page.getByRole('button', { name: currentCopy.resend, exact: true }).click();
  await page.getByText('Synthetic resend declined.', { exact: true }).waitFor(); assert.equal(await page.locator('#account-code').count(), 1);
  assert.equal((await snap()).calls.filter(call => call.kind === 'send').at(-1).email, longEmail);
  check('Resend failure retains code entry and reuses sentTo');
  await page.getByRole('button', { name: currentCopy.resend, exact: true }).click();
  await page.getByText(currentCopy.resent, { exact: true }).waitFor(); assert.equal(await page.locator('#account-code').inputValue(), '');
  assert.equal((await snap()).calls.filter(call => call.kind === 'send').at(-1).email, longEmail);
  check('Successful resend uses the same email, clears previous code and advises latest code');

  await page.locator('#account-code').fill('12345678'); await next('verify', { hold: true }); await verify().click();
  await page.waitForFunction(() => window.ODA_OTP_FIXTURE.snapshot().pending.some(item => item.kind === 'verify'));
  assert.equal(await verify().isDisabled(), true); assert.equal(await page.locator('#account-code').isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: currentCopy.resend, exact: true }).isDisabled(), true);
  const heldVerifyCount = await count('verify');
  await page.locator('#account-code').evaluate(input => input.form.requestSubmit());
  assert.equal(await count('verify'), heldVerifyCount, 'Single-flight must reject a repeated form submit while held');
  await page.evaluate(() => window.ODA_OTP_FIXTURE.release('verify', { ok: true }));
  await page.waitForFunction(() => Boolean(window.ODA_OTP_FIXTURE.snapshot().cloud.session));
  await page.getByText(await translate('Your proof is safe'), { exact: true }).waitFor();
  assert.equal(await page.locator('#account-code').count(), 0);
  check('Held verification disables concurrent controls and success updates real useCloudState from shared session');
  await page.getByRole('button', { name: currentCopy.back, exact: true }).click();
  await page.getByRole('button', { name: await translate('Sign out'), exact: true }).waitFor();
  assert.equal(await page.locator('#cloud-email').count(), 0); assert.equal((await snap()).route, '/app/settings');
  assert.ok((await page.locator('main').innerText()).includes(longEmail));
  check('Back to Settings renders the same signed-in synthetic account without separate auth state');

  await reset(); await page.getByRole('button', { name: currentCopy.continue, exact: true }).click();
  await page.locator('#account-email').fill('held-send@example.test'); await next('send', { hold: true }); await request().click();
  await page.waitForFunction(() => window.ODA_OTP_FIXTURE.snapshot().pending.some(item => item.kind === 'send'));
  assert.equal(await request().isDisabled(), true);
  const heldSendCount = await count('send');
  await page.locator('#account-email').evaluate(input => input.form.requestSubmit());
  assert.equal(await count('send'), heldSendCount, 'Single-flight must reject a repeated form submit while held');
  await page.getByRole('button', { name: currentCopy.back, exact: true }).click();
  await page.getByRole('button', { name: currentCopy.continue, exact: true }).waitFor();
  await page.evaluate(() => window.ODA_OTP_FIXTURE.release('send', { ok: true }));
  await page.waitForFunction(() => window.ODA_OTP_FIXTURE.snapshot().pending.length === 0);
  assert.equal((await snap()).route, '/app/settings'); assert.equal(await page.locator('#account-code').count(), 0);
  check('Held send can return to Settings; its late response does not navigate or resurrect Account');

  await reset(false); await page.locator('#cloud-email').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Send link', exact: true }).count(), 1);
  await page.locator('#cloud-email').fill('web-settings@example.test'); await page.getByRole('button', { name: 'Send link', exact: true }).click();
  await page.getByText('Synthetic response; no email was sent.', { exact: true }).waitFor();
  assert.equal((await snap()).calls.filter(call => call.kind === 'send').at(-1).email, 'web-settings@example.test');
  await page.evaluate(() => window.ODA_OTP_FIXTURE.navigate('/app/account')); await page.locator('#account-email').waitFor();
  assert.equal(await request().innerText(), 'Email me a sign-in link');
  await page.locator('#account-email').fill('web-account@example.test'); await request().click(); await page.locator('#account-code').waitFor();
  assert.ok((await page.getByRole('status').innerText()).includes('We sent a sign-in link'));
  assert.equal(await page.getByRole('button', { name: currentCopy.resend, exact: true }).count(), 0);
  check('Web Settings preserves Send link and web Account preserves magic-link request/success copy');

  for (const locale of ['en', 'tr', 'es']) for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 }); await reset();
    await page.evaluate(locale => window.ODA_OTP_FIXTURE.setLocale(locale), locale); currentCopy = await copy();
    await page.getByRole('button', { name: currentCopy.continue, exact: true }).waitFor();
    assert.equal(await page.locator('#cloud-email').count(), 0);
    await page.getByRole('button', { name: currentCopy.continue, exact: true }).click(); await page.locator('#account-email').waitFor();
    assert.equal(await request().innerText(), currentCopy.request); await page.locator('#account-email').fill(longEmail); await request().click();
    await page.locator('#account-code').waitFor(); await page.getByRole('button', { name: currentCopy.resend, exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const main = document.querySelector('main');
      return { viewport: innerWidth, documentScroll: document.documentElement.scrollWidth, mainScroll: main.scrollWidth, mainWidth: main.clientWidth,
        controls: [...main.querySelectorAll('button,input')].filter(element => element.getClientRects().length).map(element => {
          const rect = element.getBoundingClientRect(); return { text: element.textContent || element.id, x: rect.x, right: rect.right, width: rect.width, height: rect.height };
        }), treeLoaded: [...main.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0),
        fontStatus: document.fonts.status };
    });
    await page.evaluate(() => window.scrollTo(0, 0)); const screenshot = `native-code-${locale}-${width}.png`;
    await page.screenshot({ path: path.join(out, screenshot), fullPage: true }); report.screenshots.push(screenshot);
    report.layouts.push({ locale, width, screenshot, ...layout });
    const problems = [];
    if (layout.documentScroll > width + 1) problems.push('document overflow');
    if (layout.mainScroll > layout.mainWidth + 1) problems.push('component overflow');
    if (!layout.controls.every(control => control.x >= 0 && control.right <= width + 1)) problems.push('clipped native OTP control');
    if (!layout.treeLoaded) problems.push('tree image did not load');
    report.checks.push({ name: `${locale} ${width}px: native Settings route/code/resend/back copy and controls fit`, passed: problems.length === 0, problems, ...layout });
  }
  assert.deepEqual(report.errors, []); assert.deepEqual(report.externalAttempts, []); assert.deepEqual(report.failedRequests, []);
  check('Zero page errors, external requests, failed local assets, emails or provider calls');
  assert.equal(report.checks.filter(item => !item.passed).length, 0, 'Responsive checks failed; every requested screenshot was retained.');
} catch (error) {
  report.failure = String(error.stack || error);
  if (page) { await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {}); report.failureScreenshot = 'failure.png'; }
  throw error;
} finally {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify({ out, checks: report.checks.length, screenshots: report.screenshots.length, errors: report.errors, failure: report.failure ?? null }));
}
