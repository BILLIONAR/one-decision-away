/** Focused hero-copy QA against a disposable loopback HTTPS production preview. */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { webkit, devices } from 'playwright';

const BASE = 'https://127.0.0.1:4176/one-decision-away/';
const ORIGIN = new URL(BASE).origin;
const BUILD = '/tmp/oda-hero-copy-project-build';
const OUT = process.env.ODA_HERO_QA_OUT || 'artifacts/verification/hero-copy';
const ENGINE = '/workspace/.cloud-tools/playwright-browsers/webkit-2359/pw_run.sh';
const expected = {
  en: { headline: 'Change starts with one decision.', introduction: 'Turn what matters to you into daily action—with practical courses, guided reflection, and progress you can see.' },
  tr: { headline: 'Değişim tek bir kararla başlar.', introduction: 'Senin için önemli olanları günlük adımlara dönüştür—uygulamalı kurslar, rehberli düşünme ve görebileceğin ilerlemeyle.' },
  es: { headline: 'El cambio empieza con una decisión.', introduction: 'Convierte lo que te importa en acciones diarias, con cursos prácticos, reflexión guiada y un progreso que puedes ver.' },
};
const require = createRequire(import.meta.url);
const sha256 = value => createHash('sha256').update(value).digest('hex');
mkdirSync(OUT, { recursive: true });
const report = {
  at: new Date().toISOString(), base: BASE, build: BUILD, engine: 'webkit', executablePath: ENGINE,
  playwrightVersion: require('playwright/package.json').version, nodeVersion: process.version,
  checkoutHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  landingCopySha256: sha256(readFileSync('src/data/landingCopy.ts')),
  buildIndexSha256: sha256(readFileSync(`${BUILD}/index.html`)),
  localSelfSignedPreview: true, expected, checks: [], cases: [], screenshots: [], errors: [], blockedRequests: [],
  limits: ['Official Linux WebKit 26.6; mobile contexts are emulation, not physical iPhone or branded Safari.',
    'Only read-only requests to the owned loopback HTTPS origin are permitted; external requests are aborted.',
    'Text ranges measure rendered line boxes; screenshots support visual review. No native keyboard or device safe-area test.',
    'Targeted hero-copy validation; no live Pages requests, production account, deployment, or provider writes.'],
};
const tls = mkdtempSync(join(tmpdir(), 'oda-hero-copy-https-'));
let preview, previewClosed, browser, activePage, phase = 'loopback HTTPS preview startup';
const pass = message => { report.checks.push(message); console.log(`PASS ${message}`); };
const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const inspectHero = page => page.evaluate(() => {
  const box = element => {
    const r = element.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
  };
  const one = selector => document.querySelector(selector);
  const title = one('#landing-title'), introduction = one('.oda-landing-introduction');
  const textGeometry = element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let offset = 0; offset < node.length; offset++) {
        const range = document.createRange(); range.setStart(node, offset); range.setEnd(node, offset + 1);
        for (const r of range.getClientRects()) {
          if (!r.width || !r.height) continue;
          const center = (r.top + r.bottom) / 2;
          let line = lines.find(item => Math.abs(item.center - center) < 3);
          if (!line) { line = { center, left: r.left, right: r.right, top: r.top, bottom: r.bottom, text: '' }; lines.push(line); }
          line.left = Math.min(line.left, r.left); line.right = Math.max(line.right, r.right);
          line.top = Math.min(line.top, r.top); line.bottom = Math.max(line.bottom, r.bottom);
          line.text += node.textContent[offset];
        }
      }
    }
    const clippingAncestors = [];
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX) || ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)) {
        clippingAncestors.push({ tag: ancestor.tagName, className: ancestor.className, overflowX: style.overflowX, overflowY: style.overflowY, rect: box(ancestor) });
      }
    }
    return { text: element.textContent, rect: box(element), lines: lines.sort((a, b) => a.top - b.top), clippingAncestors };
  };
  const controls = [...document.querySelectorAll('.oda-landing-hero-actions button, .oda-landing-nav .oda-landing-button')].map(element => ({ text: element.textContent, rect: box(element), inInitialViewport: box(element).top >= 0 && box(element).bottom <= innerHeight }));
  return {
    viewport: { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
    lang: document.documentElement.lang, theme: document.documentElement.getAttribute('data-theme'), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    title: textGeometry(title), introduction: textGeometry(introduction), hero: box(one('.oda-landing-hero')),
    copy: box(one('.oda-landing-hero-copy')), kicker: box(one('.oda-landing-hero-copy > .oda-landing-kicker')),
    actions: box(one('.oda-landing-hero-actions')), privacy: box(one('.oda-landing-privacy')), preview: box(one('.oda-landing-preview')),
    header: box(one('.oda-landing-nav')), brand: box(one('.oda-landing-brand')), logo: box(one('.oda-landing-brand-mark')),
    logoImage: one('.oda-landing-brand-mark image').getAttribute('href'), controls,
  };
});
const hitControl = async locator => {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await frames(locator.page());
  return locator.evaluate(element => {
    const r = element.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { text: element.textContent, rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom }, centerHit: Boolean(hit && element.contains(hit)), inViewport: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1 };
  });
};

try {
  const key = join(tls, 'key.pem'), cert = join(tls, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '2', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
  preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--config', 'scripts/qa-webkit-https.config.mjs', '--outDir', BUILD, '--host', '127.0.0.1', '--port', '4176', '--strictPort'], {
    cwd: process.cwd(), env: { ...process.env, ODA_WEBKIT_PREVIEW_KEY: key, ODA_WEBKIT_PREVIEW_CERT: cert }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  previewClosed = new Promise(resolve => preview.once('exit', resolve));
  await new Promise((resolve, reject) => {
    let started = false;
    const timer = setTimeout(() => reject(new Error('Owned hero HTTPS preview did not start')), 10000);
    preview.stdout.on('data', data => { const text = String(data); if (!started && text.includes('https://127.0.0.1:4176/')) { started = true; clearTimeout(timer); resolve(); } });
    preview.stderr.on('data', data => process.stderr.write(data));
    preview.once('error', error => { clearTimeout(timer); reject(error); });
    preview.once('exit', code => { if (!started) { clearTimeout(timer); reject(new Error(`Owned preview exited ${code}`)); } });
  });
  report.previewPid = preview.pid;
  phase = 'official cached WebKit launch';
  browser = await webkit.launch({ executablePath: ENGINE });
  report.browserVersion = browser.version(); assert.equal(report.browserVersion, '26.6');
  pass('cached official WebKit 26.6 launched against owned loopback HTTPS production preview');
  for (const locale of ['en', 'tr', 'es']) {
    for (const scenario of [{ width: 320, height: 740, theme: 'light' }, { width: 390, height: 844, theme: 'light' }, { width: 1440, height: 1000, theme: 'light' }, { width: 390, height: 844, theme: 'dark' }]) {
      const { width, height, theme } = scenario, name = `${locale}-${width}x${height}-${theme}`;
      phase = name;
      const context = await browser.newContext({ ...(width < 768 ? devices['iPhone 13'] : {}), viewport: { width, height }, locale: 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block', colorScheme: theme, ignoreHTTPSErrors: true });
      await context.addInitScript(({ locale, theme }) => { localStorage.setItem('oda_locale', locale); localStorage.setItem('oda_theme', theme); }, { locale, theme });
      await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin === ORIGIN && ['GET', 'HEAD'].includes(request.method())) await route.continue();
        else { report.blockedRequests.push({ case: name, method: request.method(), url: url.href }); await route.abort('blockedbyclient'); }
      });
      const page = await context.newPage(); activePage = page;
      page.on('pageerror', error => report.errors.push({ case: name, message: error.message }));
      const response = await page.goto(BASE); assert.equal(response.status(), 200);
      await page.locator('#landing-title').waitFor(); await page.evaluate(() => document.fonts.ready); await frames(page);
      const geometry = await inspectHero(page);
      const result = { name, ...scenario, locale, mobileEmulation: width < 768, ...geometry, controlHitTests: [] };
      report.cases.push(result);
      assert.equal(geometry.lang, locale); assert.equal(geometry.theme, theme); assert.equal(geometry.reducedMotion, true);
      assert.equal(geometry.title.text.replace(/\s+/g, ' ').trim(), expected[locale].headline);
      assert.equal(geometry.introduction.text, expected[locale].introduction);
      pass(`${name}: exact localized headline/subheadline and requested theme render`);
      assert.equal(geometry.viewport.width, width);
      assert.ok(geometry.viewport.scrollWidth <= geometry.viewport.documentWidth + 1, `${name}: document horizontal overflow`);
      for (const text of [geometry.title, geometry.introduction]) {
        assert.ok(text.lines.length > 0, `${name}: missing rendered text lines`);
        for (const line of text.lines) {
          assert.ok(line.left >= geometry.copy.left - 1 && line.right <= geometry.copy.right + 1, `${name}: hero text line exceeds copy bounds ${JSON.stringify(line)}`);
          for (const ancestor of text.clippingAncestors) {
            if (['hidden', 'clip'].includes(ancestor.overflowX)) assert.ok(line.left >= ancestor.rect.left - 1 && line.right <= ancestor.rect.right + 1, `${name}: horizontally clipped text`);
            if (['hidden', 'clip'].includes(ancestor.overflowY)) assert.ok(line.top >= ancestor.rect.top - 1 && line.bottom <= ancestor.rect.bottom + 1, `${name}: vertically clipped text`);
          }
        }
      }
      assert.ok(geometry.kicker.bottom <= geometry.title.rect.top + 1 && geometry.title.rect.bottom <= geometry.introduction.rect.top + 1 && geometry.introduction.rect.bottom <= geometry.actions.top + 1 && geometry.actions.bottom <= geometry.privacy.top + 1, `${name}: hero copy blocks overlap`);
      const intersectionWidth = Math.min(geometry.copy.right, geometry.preview.right) - Math.max(geometry.copy.left, geometry.preview.left);
      const intersectionHeight = Math.min(geometry.copy.bottom, geometry.preview.bottom) - Math.max(geometry.copy.top, geometry.preview.top);
      assert.ok(intersectionWidth <= 1 || intersectionHeight <= 1, `${name}: hero copy overlaps daily preview`);
      for (const target of [geometry.brand, geometry.logo, ...geometry.controls.map(item => item.rect)]) assert.ok(target.left >= -1 && target.right <= width + 1 && target.width > 0 && target.height > 0, `${name}: CTA/logo extends beyond horizontal viewport`);
      assert.ok(geometry.logo.top >= geometry.header.top - 1 && geometry.logo.bottom <= geometry.header.bottom + 1, `${name}: logo outside header`);
      assert.equal(geometry.logoImage, '/one-decision-away/brand/oda-c4.png');
      pass(`${name}: rendered line boxes stay in bounds without clipping, block/preview overlap, or CTA/logo overflow`);
      for (const [suffix, locator] of [['viewport', null], ['hero', page.locator('.oda-landing-hero')]]) {
        const file = `hero-${name}-${suffix}.png`;
        if (locator) await locator.screenshot({ path: `${OUT}/${file}` }); else await page.screenshot({ path: `${OUT}/${file}` });
        report.screenshots.push(file);
      }
      for (const control of await page.locator('.oda-landing-hero-actions button, .oda-landing-nav .oda-landing-button').all()) {
        const hit = await hitControl(control); result.controlHitTests.push(hit);
        assert.ok(hit.inViewport && hit.centerHit, `${name}: CTA cannot be reached without occlusion ${JSON.stringify(hit)}`);
      }
      pass(`${name}: hero/header CTAs scroll into view and receive unobscured center hit-tests`);
      await context.close();
    }
  }
  assert.deepEqual(report.errors, []);
  pass('all twelve hero-copy cases have zero uncaught browser errors');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failurePhase = phase; report.failure = String(error.stack || error); process.exitCode = 1; console.error(error);
  if (activePage && !activePage.isClosed()) try { await activePage.screenshot({ path: `${OUT}/failure.png`, fullPage: true }); report.screenshots.push('failure.png'); } catch (captureError) { report.captureError = String(captureError); }
} finally {
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  if (preview && preview.exitCode === null && preview.signalCode === null) preview.kill('SIGTERM');
  if (previewClosed) await previewClosed;
  rmSync(tls, { recursive: true, force: true });
}
