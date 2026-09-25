// Switch the whole app between brand versions: `node scripts/brand.mjs v3`, `v2` or `c4`.
// Old assets are never deleted, so switching back is always one command.
import fs from 'node:fs';

const target = process.argv[2];
const SETS = {
  c4: {
    app192: 'brand/oda-app-c4-v1-192.png', app512: 'brand/oda-app-c4-v1-512.png',
    mask192: 'brand/oda-app-c4-v1-maskable-192.png', mask512: 'brand/oda-app-c4-v1-maskable-512.png',
    apple: 'brand/oda-apple-c4-v1-180.png', favicon: 'brand/oda-favicon-c4-v1-32.png', og: 'og-image.png',
  },
  v3: {
    app192: 'brand/v3/oda-app-v3-192.png', app512: 'brand/v3/oda-app-v3-512.png',
    mask192: 'brand/v3/oda-app-v3-maskable-192.png', mask512: 'brand/v3/oda-app-v3-maskable-512.png',
    apple: 'brand/v3/oda-apple-v3-180.png', favicon: 'brand/v3/oda-favicon-v3-32.png', og: 'brand/v3/og-image-v3.png',
  },
  v2: {
    app192: 'brand/v2/oda-app-v2-192.png', app512: 'brand/v2/oda-app-v2-512.png',
    mask192: 'brand/v2/oda-app-v2-maskable-192.png', mask512: 'brand/v2/oda-app-v2-maskable-512.png',
    apple: 'brand/v2/oda-apple-v2-180.png', favicon: 'brand/v2/oda-favicon-v2-32.png', og: 'brand/v2/og-image-v2.png',
  },
};
if (!SETS[target]) { console.error('Usage: node scripts/brand.mjs v3|v2|c4'); process.exit(1); }
const FILES = ['index.html', 'public/manifest.webmanifest', 'public/sw.js', 'src/services/notificationScheduler.ts', 'src/pages/Settings.tsx', 'supabase/functions/send-nudges/push-worker.test.ts'];
const root = new URL('../', import.meta.url);
for (const file of FILES) {
  const url = new URL(file, root);
  let text = fs.readFileSync(url, 'utf8');
  for (const [from, set] of Object.entries(SETS)) {
    if (from === target) continue;
    for (const [key, path] of Object.entries(set)) {
      // og-image.png only appears as an absolute URL; avoid touching other names.
      const pattern = key === 'og' ? new RegExp(`(?<=/)${path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?=["'])`, 'g') : new RegExp(path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'g');
      text = text.replace(pattern, SETS[target][key]);
    }
  }
  fs.writeFileSync(url, text);
}
const current = new URL('src/brand/current.ts', root);
fs.writeFileSync(current, fs.readFileSync(current, 'utf8').replace(/export const BRAND: 'v3' \| 'v2' \| 'c4' = '(v3|v2|c4)';/, `export const BRAND: 'v3' | 'v2' | 'c4' = '${target}';`));
console.log(`Brand switched to ${target}.`);
