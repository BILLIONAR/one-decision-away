// Reproducible original v5 identity assets. Uses the installed Playwright/Chromium renderer.
// Run: node --import tsx scripts/brand-v5-assets.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import { BRAND_V5, brandV5MarkSvg, brandV5LockupSvg } from '../src/brand/v5.ts';

const root = new URL('../', import.meta.url);
const out = p => { const url = new URL(p, root); fs.mkdirSync(new URL('.', url), { recursive: true }); return url.pathname; };
const svgImage = svg => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const icon = maskable => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${BRAND_V5.ivory}"/><image x="${maskable ? 123 : 99}" y="${maskable ? 123 : 99}" width="${maskable ? 266 : 314}" height="${maskable ? 266 : 314}" href="${svgImage(brandV5MarkSvg())}"/></svg>`;

const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function render(svg, width, height, path, background = 'transparent') {
  await page.setViewportSize({ width, height });
  await page.setContent(`<html><head><meta charset="utf-8"/></head><body style="margin:0;background:${background}"><img src="${svgImage(svg)}" style="display:block;width:${width}px;height:${height}px"/></body></html>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({ path: out(path), omitBackground: background === 'transparent' });
}

for (const [name, variant] of [['oda-mark-v5', 'default'], ['oda-mark-v5-inverted', 'inverted'], ['oda-mark-v5-monochrome', 'monochrome']]) fs.writeFileSync(out(`public/brand/v5/${name}.svg`), brandV5MarkSvg(variant));
fs.writeFileSync(out('public/brand/v5/oda-lockup-v5.svg'), brandV5LockupSvg());
fs.writeFileSync(out('public/brand/v5/oda-lockup-v5-inverted.svg'), brandV5LockupSvg('inverted'));
fs.writeFileSync(out('public/brand/v5/oda-compact-v5.svg'), brandV5LockupSvg('default', true));
for (const size of [192, 512]) {
  await render(icon(false), size, size, `public/brand/v5/oda-app-v5-${size}.png`);
  await render(icon(true), size, size, `public/brand/v5/oda-app-v5-maskable-${size}.png`);
}
await render(icon(false), 180, 180, 'public/brand/v5/oda-apple-v5-180.png');
await render(icon(false), 32, 32, 'public/brand/v5/oda-favicon-v5-32.png');
await render(icon(false), 1024, 1024, 'brand-assets/ios/v5/AppIcon-512@2x.png');
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="${BRAND_V5.ivory}"/><image x="1106" y="1106" width="520" height="520" href="${svgImage(brandV5MarkSvg())}"/></svg>`;
await render(splash, 2732, 2732, 'brand-assets/ios/v5/splash-2732x2732.png');
if (process.argv.includes('--sync-native-artwork')) {
  // Artwork only: preserve the exact formerly active sources before selecting v5.
  // This never runs Capacitor, changes signing, or edits the asset-catalog metadata.
  for (const [active, source, archive] of [
    ['AppIcon.appiconset/AppIcon-512@2x.png', 'AppIcon-512@2x.png', 'AppIcon-512@2x.png'],
    ['Splash.imageset/splash-2732x2732.png', 'splash-2732x2732.png', 'splash-2732x2732.png'],
    ['Splash.imageset/splash-2732x2732-1.png', 'splash-2732x2732.png', 'splash-2732x2732-1.png'],
    ['Splash.imageset/splash-2732x2732-2.png', 'splash-2732x2732.png', 'splash-2732x2732-2.png'],
  ]) {
    const activeUrl = new URL(`ios/App/App/Assets.xcassets/${active}`, root);
    const archivePath = out(`brand-assets/ios/pre-v5-active/${archive}`);
    if (!fs.existsSync(archivePath)) fs.copyFileSync(activeUrl, archivePath);
    fs.copyFileSync(new URL(`brand-assets/ios/v5/${source}`, root), activeUrl);
  }
}
const social = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${BRAND_V5.ivory}"/><path d="M90 526 H138" stroke="${BRAND_V5.wine}" stroke-width="3"/><image x="90" y="80" width="520" height="173.33" href="${svgImage(brandV5LockupSvg())}"/><text x="90" y="366" font-family="Georgia,serif" font-size="60" fill="${BRAND_V5.forest}">Change starts with</text><text x="90" y="436" font-family="Georgia,serif" font-size="60" fill="${BRAND_V5.forest}">one decision.</text><text x="156" y="533" font-family="Arial,sans-serif" font-size="21" fill="${BRAND_V5.forest}">Designed by Yahya</text></svg>`;
await render(social, 1200, 630, 'public/brand/v5/og-image-v5.png');

// Actual-size proof sheet, not an enlarged claim of small-size legibility.
await page.setViewportSize({ width: 720, height: 460 });
await page.setContent(`<html><head><meta charset="utf-8"/></head><body style="margin:0;padding:32px;background:${BRAND_V5.ivory};font:14px Arial;color:${BRAND_V5.forest}"><p>ODA v5 · original vector · actual CSS pixels</p><div style="display:flex;gap:32px;align-items:center;margin:24px 0"><img src="${svgImage(brandV5MarkSvg('monochrome'))}" width="24" height="24"/><img src="${svgImage(brandV5MarkSvg())}" width="28" height="28"/><img src="${svgImage(brandV5LockupSvg('default', true))}" width="84" height="32"/><img src="${svgImage(brandV5LockupSvg())}" width="192" height="64"/></div><p>24px monochrome · 28px emblem · 84×32 compact · 192×64 primary</p><div style="background:${BRAND_V5.forest};padding:24px;margin-top:32px;display:flex;align-items:center;gap:40px"><img src="${svgImage(brandV5LockupSvg('inverted'))}" width="192" height="64"/><img src="${svgImage(brandV5LockupSvg('inverted', true))}" width="84" height="32"/></div></body></html>`);
await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
await page.screenshot({ path: out('artifacts/verification/premium-brand/brand-v5-size-review.png') });
await browser.close();
console.log('v5 vectors, web icons, native source assets and actual-size review sheet generated');
