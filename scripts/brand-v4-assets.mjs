// Brand v4 "Fork" (Sep 2026): renders every icon, favicon, social image and iOS asset from one SVG.
// Run: node scripts/brand-v4-assets.mjs  (needs Playwright + Chromium; outputs are committed).
import { chromium } from 'playwright';
import fs from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const out = (p) => { const f = root + p; fs.mkdirSync(f.slice(0, f.lastIndexOf('/')), { recursive: true }); return f; };

const stem = 'M512 860 L512 560';
const left = 'M512 560 C512 450 400 420 330 360 C285 320 270 275 270 230';
const right = 'M512 560 C512 450 624 420 694 360 C739 320 754 275 754 230';
const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A7560"/><stop offset="1" stop-color="#143A31"/></linearGradient>
<linearGradient id="ch" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F6E2D6"/><stop offset="1" stop-color="#F2B98F"/></linearGradient></defs>`;
const mark = `<path d="${left}" stroke="#F4F0E8" stroke-opacity=".32" stroke-width="64" fill="none" stroke-linecap="round"/>
<path d="${stem}" stroke="#F4F0E8" stroke-width="64" fill="none" stroke-linecap="round"/>
<path d="${right}" stroke="url(#ch)" stroke-width="64" fill="none" stroke-linecap="round"/>
<circle cx="754" cy="200" r="70" fill="#F2B98F"/>`;
// The mark's visual centre is slightly above the canvas centre; nudge it down for balance.
const icon = (scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${defs}<rect width="1024" height="1024" fill="url(#bg)"/>
<g transform="translate(512 530) scale(${scale}) translate(-512 -530)">${mark}</g></svg>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage();
async function render(svg, w, h, file, { bg = 'transparent', inner = null } = {}) {
  await page.setViewportSize({ width: w, height: h });
  const body = inner ?? `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:${w}px;height:${h}px;display:block">`;
  await page.setContent(`<html><body style="margin:0;background:${bg}">${body}</body></html>`);
  await page.waitForTimeout(100);
  await page.screenshot({ path: out(file), omitBackground: bg === 'transparent' });
}

fs.writeFileSync(out('public/brand/v4/oda-mark-v4.svg'), icon());
for (const s of [192, 512]) {
  await render(icon(), s, s, `public/brand/v4/oda-app-v4-${s}.png`);
  await render(icon(0.78), s, s, `public/brand/v4/oda-app-v4-maskable-${s}.png`);
}
await render(icon(), 180, 180, 'public/brand/v4/oda-apple-v4-180.png');
await render(icon(1.12), 32, 32, 'public/brand/v4/oda-favicon-v4-32.png');

// iOS: 1024 app icon (opaque) and the launch image (mark centred on the same green).
await render(icon(), 1024, 1024, 'brand-assets/ios/v4/AppIcon-512@2x.png', { bg: '#143A31' });
const splash = `<div style="width:2732px;height:2732px;background:linear-gradient(160deg,#2F6653,#143A31);display:flex;align-items:center;justify-content:center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="160 140 704 760" width="520" height="561">${defs}${mark}</svg></div>`;
for (const f of ['splash-2732x2732.png'])
  await render('', 2732, 2732, `brand-assets/ios/v4/${f}`, { bg: '#143A31', inner: splash });

// Social preview 1200×630.
const FONTS = root + 'dist/assets/';
const nr = fs.existsSync(FONTS) ? fs.readdirSync(FONTS).find(f => f.startsWith('newsreader-latin-opsz-normal')) : null;
const og = `<style>${nr ? `@font-face{font-family:NR;src:url(file://${FONTS}${nr})}` : ''}</style>
<div style="width:1200px;height:630px;background:linear-gradient(165deg,#DDEBE2 0%,#F4F0E8 46%,#F6E2D6 100%);display:flex;align-items:center;gap:56px;padding:0 90px;box-sizing:border-box">
<img src="data:image/svg+xml;base64,${Buffer.from(icon()).toString('base64')}" style="width:260px;height:260px;border-radius:58px;box-shadow:0 30px 60px -30px rgba(20,58,49,.6)">
<div style="font-family:NR,Georgia,serif;color:#1C201D"><div style="font-size:92px;line-height:1">One Decision<br>Away</div>
<div style="font-size:34px;color:#5B625D;margin-top:22px;font-style:italic">One small decision a day, kept.</div></div></div>`;
await render('', 1200, 630, 'public/brand/v4/og-image-v4.png', { bg: '#F4F0E8', inner: og });
await b.close();
console.log('brand v4 assets written');
