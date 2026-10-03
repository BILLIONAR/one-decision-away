// Resize the accepted icon8 reconstruction; never redraw or crop its domino artwork.
// Run from the checkout: node scripts/brand-domino8-assets.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const master = fs.readFileSync(root + 'brand-assets/domino8/ODA-Icon8-Reconstruction-Master-1254.png');
const expected = '49ebd132ec6f67282a95a9e941631fccfd3e1d72bd5049a45179c277dcf78a96';
if (createHash('sha256').update(master).digest('hex') !== expected) throw new Error('Unexpected selected icon8 source');
const image = `data:image/png;base64,${master.toString('base64')}`;
const oldSocial = `data:image/png;base64,${fs.readFileSync(root + 'public/og-image.png').toString('base64')}`;
const records = [];
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
try {
  async function render(file, width, height, mode = 'icon', scale = 1) {
    await page.setViewportSize({ width, height });
    await page.setContent('<html><body style="margin:0"><canvas style="display:block"></canvas></body></html>');
    await page.evaluate(async ({ image, oldSocial, width, height, mode, scale }) => {
      const canvas = document.querySelector('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const load = async (src) => { const img = new Image(); img.src = src; await img.decode(); return img; };
      const img = await load(image);
      if (img.naturalWidth !== 1254 || img.naturalHeight !== 1254) throw new Error('Source must be 1254 square');
      if (mode === 'social') {
        ctx.drawImage(await load(oldSocial), 0, 0, width, height);
        // Replace only the existing mark; all original social text and layout remain.
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(90, 75, 50, 62);
        ctx.save(); ctx.beginPath(); ctx.roundRect(90, 80, 48, 48, 9); ctx.clip();
        ctx.drawImage(img, 90, 80, 48, 48); ctx.restore();
      } else {
        ctx.fillStyle = mode === 'splash' ? '#F7F3EA' : '#54010C';
        ctx.fillRect(0, 0, width, height);
        const size = mode === 'splash' ? 520 : width * scale;
        ctx.drawImage(img, (width - size) / 2, (height - size) / 2, size, size);
      }
    }, { image, oldSocial, width, height, mode, scale });
    fs.mkdirSync(root + file.slice(0, file.lastIndexOf('/')), { recursive: true });
    const data = await page.screenshot({ path: root + file, omitBackground: false });
    records.push({ file, width, height, mode, sourceScale: scale, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
  }
  await render('public/brand/domino8/oda-mark-domino8-v1-256.png', 256, 256);
  for (const size of [192, 512]) {
    await render(`public/brand/domino8/oda-app-domino8-v1-${size}.png`, size, size);
    // Entire source is contained; essential domino bounds fit the central 40% safe circle.
    await render(`public/brand/domino8/oda-app-domino8-v1-maskable-${size}.png`, size, size, 'icon', 0.70);
  }
  await render('public/brand/domino8/oda-apple-domino8-v1-180.png', 180, 180);
  await render('public/brand/domino8/oda-favicon-domino8-v1-32.png', 32, 32);
  await render('brand-assets/ios/domino8/AppIcon-512@2x.png', 1024, 1024);
  await render('brand-assets/ios/domino8/splash-2732x2732.png', 2732, 2732, 'splash');
  await render('public/brand/domino8/og-image-domino8-v1.png', 1200, 630, 'social');
  fs.writeFileSync(root + 'brand-assets/domino8/derivatives.json', JSON.stringify({
    sourceFile: 'brand-assets/domino8/ODA-Icon8-Reconstruction-Master-1254.png', sourceSha256: expected,
    provenance: 'Reference-guided reconstruction accepted by parent visual review; not the missing original.',
    resizing: 'Browser canvas contain, uniform scale, high-quality smoothing; no cropped source artwork.',
    maskable: { scale: 0.70, background: '#54010C', essentialSourceBounds: [80, 190, 1170, 1045], maxNormalizedRadius: 0.39082, safeRadius: 0.4 },
    platformMasking: 'Opaque square web/native assets without baked outer rounding; platforms apply their own masks.',
    splash: 'Full 520px master centered on existing 2732px warm ivory launch background.',
    files: records,
  }, null, 2) + '\n');
} finally { await browser.close(); }
console.log(JSON.stringify({ sourceSha256: expected, outputs: records.length }));
