import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { cpus, platform, arch } from 'node:os';
const base = 'http://localhost:3000';
const report = { at: new Date().toISOString(), environment: { browserExecutable: '/usr/bin/chromium', browserArgs: ['--no-sandbox', '--enable-unsafe-swiftshader'], os: `${platform()} ${arch()}`, cpu: cpus()[0].model, logicalCpus: cpus().length, hardwarePhone: false, viewport: { width: 900, height: 1000 }, pixelRatio: 1, note: 'Cloud Linux software rendering. CPU submission timing and host requestAnimationFrame cadence; not GPU query timing or physical iPhone performance.' }, checks: [], matureProbe: null, errors: [] };
const browser = await chromium.launch({ executablePath: report.environment.browserExecutable, args: report.environment.browserArgs });
report.environment.browserVersion = browser.version();
const check = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const open = async (options = {}, initialize) => { const context = await browser.newContext({ viewport: report.environment.viewport, reducedMotion: 'no-preference', ...options }); if (initialize) await context.addInitScript(initialize); const page = await context.newPage(); page.on('pageerror', e => report.errors.push(e.message)); await page.goto(`${base}/artifacts/tree-3d/component-review.html?count=0`); return { page, context }; };
const ready = page => page.waitForFunction(() => window.treeMetrics, null, { timeout: 20000 });
const data = page => page.locator('canvas').evaluate(canvas => ({ yaw: Number(canvas.dataset.yaw), zoom: Number(canvas.dataset.zoom), touchAction: getComputedStyle(canvas).touchAction }));
try {
  const { page, context } = await open(); await ready(page);
  report.seedlingProbe = await page.evaluate(() => window.treeMetrics);
  report.environment.webGLRenderer = await page.evaluate(() => { const gl = document.querySelector('canvas').getContext('webgl2'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
  const canvas = page.locator('canvas'); await canvas.focus(); for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  assert.ok(Math.abs((await data(page)).yaw - Math.PI / 2) < .001); check('component keyboard performs actual 90 degree orbit');
  for (let i = 0; i < 20; i++) await page.keyboard.press('+'); await page.waitForTimeout(70); assert.equal((await data(page)).zoom, 1.16);
  for (let i = 0; i < 30; i++) await page.keyboard.press('-'); await page.waitForTimeout(70); assert.equal((await data(page)).zoom, .84); check('keyboard zoom stays within 0.84–1.16 bounds');
  await page.keyboard.press('Home'); await page.waitForTimeout(70); assert.equal((await data(page)).yaw, 0); assert.equal((await data(page)).zoom, 1); check('keyboard reset restores orientation and zoom');
  const rect = await canvas.boundingBox(); await page.mouse.move(rect.x + rect.width * .45, rect.y + rect.height * .5); await page.mouse.down(); await page.mouse.move(rect.x + rect.width * .65, rect.y + rect.height * .5, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(70); assert.ok(Math.abs((await data(page)).yaw) > .5); check('mouse drag orbits the 3D camera');
  const yawBefore = (await data(page)).yaw; await page.waitForTimeout(400); assert.equal((await data(page)).yaw, yawBefore); check('orientation remains still without input');
  await page.getByRole('button', { name: 'Return to still tree' }).click(); assert.equal(await canvas.count(), 0); await page.getByRole('button', { name: 'Open tree' }).click(); await canvas.waitFor();
  for (const count of [1, 10, 30, 60, 90, 0]) { await page.locator('#qa-count').fill(String(count)); await page.waitForTimeout(30); }
  await page.waitForTimeout(400); assert.equal(await canvas.count(), 1); check('close/reopen and rapid count changes dispose and rebuild without page errors');
  await context.close();
  const loss = await open(); await ready(loss.page); await loss.page.locator('canvas').evaluate(c => c.dispatchEvent(new Event('webglcontextlost'))); await loss.page.waitForFunction(() => window.treeFallback === 'context-lost'); check('WebGL context loss invokes static fallback'); await loss.context.close();

  for (const test of [
    { name: 'reduced motion selects static fallback', reason: 'reduced-motion', options: { reducedMotion: 'reduce' } },
    { name: 'low-memory device selects static fallback', reason: 'low-power', init: () => Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 }) },
    { name: 'unsupported WebGL selects static fallback', reason: 'webgl-unavailable', init: () => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); }; } },
    { name: 'post-model texture initialization failure cleans up and falls back', reason: 'render-error', init: () => { let calls = 0; const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (type === '2d' && ++calls === 2) return null; return original.call(this, type, ...args); }; } },
    { name: 'observer initialization failure cleans up and falls back', reason: 'render-error', init: () => { window.ResizeObserver = class { constructor() { throw new Error('simulated unavailable observer'); } }; } },
    { name: 'simulated 100 ms RAF cadence selects static fallback', reason: 'slow-rendering', init: () => { const original = requestAnimationFrame; window.requestAnimationFrame = fn => original(() => setTimeout(() => fn(performance.now()), 100)); } },
  ]) {
    const next = await open(test.options, test.init); await next.page.waitForFunction(reason => window.treeFallback === reason, test.reason, { timeout: 25000 }); check(test.name); await next.context.close();
  }

  const mobile = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await ready(mobile.page); const mobileCanvas = mobile.page.locator('canvas'); assert.equal((await data(mobile.page)).touchAction, 'pan-y');
  const box = await mobileCanvas.boundingBox(); const cdp = await mobile.context.newCDPSession(mobile.page); const startX = box.x + box.width * .3; const startY = box.y + box.height * .55;
  const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y]) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 })) });
  await touch('touchStart', [[startX, startY]]); for (let i = 1; i <= 5; i++) { await touch('touchMove', [[startX + i * 16, startY + 1]]); await mobile.page.waitForTimeout(25); } await touch('touchEnd', []); await mobile.page.waitForTimeout(100); assert.ok(Math.abs((await data(mobile.page)).yaw) > .4); check('390 px touch emulation: horizontal touch orbits');
  const beforeScroll = await mobile.page.evaluate(() => scrollY); const beforeYaw = (await data(mobile.page)).yaw;
  await touch('touchStart', [[startX + 20, startY]]); for (let i = 1; i <= 6; i++) { await touch('touchMove', [[startX + 20, startY - i * 25]]); await mobile.page.waitForTimeout(25); } await touch('touchEnd', []); await mobile.page.waitForTimeout(250); assert.ok(await mobile.page.evaluate(() => scrollY) > beforeScroll + 30); assert.equal((await data(mobile.page)).yaw, beforeYaw); check('390 px touch emulation: vertical swipe scrolls page without rotation');
  await mobile.page.screenshot({ path: 'artifacts/tree-3d/component-mobile-input.png' }); await mobile.context.close();

  const mature = await open(); await mature.page.goto(`${base}/artifacts/tree-3d/component-review.html?count=60`); await mature.page.waitForFunction(() => window.treeMetrics || window.treeFallback, null, { timeout: 25000 }); report.matureProbe = await mature.page.evaluate(() => ({ accepted: Boolean(window.treeMetrics), fallback: window.treeFallback || null, metrics: window.treeMetrics || window.treeRejectedMetrics })); await mature.context.close();
  const js = readFileSync('artifacts/tree-3d/component-bundle/InteractiveTree.js'); const css = readFileSync('artifacts/tree-3d/component-bundle/InteractiveTree.css'); report.isolatedBundle = { jsBytes: js.length, jsGzipBytes: gzipSync(js).length, cssBytes: css.length, cssGzipBytes: gzipSync(css).length, note: 'esbuild minified isolated component with React and existing i18n external. Not a deployed network transfer; production UI does not import this held prototype.' };
  assert.deepEqual(report.errors, []); check('no uncaught page errors across interaction and fallback checks');
} catch (error) { report.failure = error.message; throw error; }
finally { writeFileSync('artifacts/tree-3d/benchmark-report.json', JSON.stringify(report, null, 2)); await browser.close(); }
