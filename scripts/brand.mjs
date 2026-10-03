// Switch the whole app between preserved brand versions: `node scripts/brand.mjs domino8|v4|v3|v2|c4`.
// Old assets are never deleted, so switching back is always one command.
import fs from 'node:fs';

const target = process.argv[2];
const SETS = {
  domino8: {
    app192: 'brand/domino8/oda-app-domino8-v1-192.png', app512: 'brand/domino8/oda-app-domino8-v1-512.png',
    mask192: 'brand/domino8/oda-app-domino8-v1-maskable-192.png', mask512: 'brand/domino8/oda-app-domino8-v1-maskable-512.png',
    apple: 'brand/domino8/oda-apple-domino8-v1-180.png', favicon: 'brand/domino8/oda-favicon-domino8-v1-32.png', og: 'brand/domino8/og-image-domino8-v1.png',
    mark: 'brand/domino8/oda-mark-domino8-v1-256.png', native: 'domino8',
  },
  v4: {
    app192: 'brand/v4/oda-app-v4-192.png', app512: 'brand/v4/oda-app-v4-512.png',
    mask192: 'brand/v4/oda-app-v4-maskable-192.png', mask512: 'brand/v4/oda-app-v4-maskable-512.png',
    apple: 'brand/v4/oda-apple-v4-180.png', favicon: 'brand/v4/oda-favicon-v4-32.png', og: 'brand/v4/og-image-v4.png',
    mark: 'brand/v4/oda-mark-v4.svg', native: 'v4',
  },
  c4: {
    app192: 'brand/oda-app-c4-v1-192.png', app512: 'brand/oda-app-c4-v1-512.png',
    mask192: 'brand/oda-app-c4-v1-maskable-192.png', mask512: 'brand/oda-app-c4-v1-maskable-512.png',
    apple: 'brand/oda-apple-c4-v1-180.png', favicon: 'brand/oda-favicon-c4-v1-32.png', og: 'og-image.png',
    mark: 'brand/oda-c4.png', native: 'c4',
  },
  v3: {
    app192: 'brand/v3/oda-app-v3-192.png', app512: 'brand/v3/oda-app-v3-512.png',
    mask192: 'brand/v3/oda-app-v3-maskable-192.png', mask512: 'brand/v3/oda-app-v3-maskable-512.png',
    apple: 'brand/v3/oda-apple-v3-180.png', favicon: 'brand/v3/oda-favicon-v3-32.png', og: 'brand/v3/og-image-v3.png',
    mark: 'brand/v3/oda-mark-v3.svg',
  },
  v2: {
    app192: 'brand/v2/oda-app-v2-192.png', app512: 'brand/v2/oda-app-v2-512.png',
    mask192: 'brand/v2/oda-app-v2-maskable-192.png', mask512: 'brand/v2/oda-app-v2-maskable-512.png',
    apple: 'brand/v2/oda-apple-v2-180.png', favicon: 'brand/v2/oda-favicon-v2-32.png', og: 'brand/v2/og-image-v2.png',
    mark: 'brand/v2/oda-mark-v2.svg',
  },
};
if (!SETS[target]) { console.error('Usage: node scripts/brand.mjs domino8|v4|v3|v2|c4'); process.exit(1); }
const FILES = ['index.html', 'public/manifest.webmanifest', 'public/sw.js', 'src/services/notificationScheduler.ts', 'src/pages/Settings.tsx', 'supabase/functions/send-nudges/push-worker.test.ts'];
const root = new URL('../', import.meta.url);
for (const file of FILES) {
  const url = new URL(file, root);
  let text = fs.readFileSync(url, 'utf8');
  for (const [from, set] of Object.entries(SETS)) {
    if (from === target) continue;
    for (const [key, path] of Object.entries(set)) {
      if (key === 'native') continue;
      // og-image.png only appears as an absolute URL; avoid touching other names.
      const pattern = key === 'og' ? new RegExp(`(?<=/)${path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?=["'])`, 'g') : new RegExp(path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'g');
      text = text.replace(pattern, SETS[target][key]);
    }
  }
  fs.writeFileSync(url, text);
}
const current = new URL('src/brand/current.ts', root);
fs.writeFileSync(current, fs.readFileSync(current, 'utf8').replace(/export const BRAND: [^=]+= '(domino8|v4|v3|v2|c4)';/, `export const BRAND: 'domino8' | 'v4' | 'v3' | 'v2' | 'c4' = '${target}';`));
for (const [key, file] of Object.entries({ app192: 'icon-192.png', app512: 'icon-512.png', mask192: 'icon-192-maskable.png', mask512: 'icon-512-maskable.png', apple: 'apple-touch-icon.png' })) {
  fs.copyFileSync(new URL(`public/${SETS[target][key]}`, root), new URL(`public/${file}`, root));
}
if (SETS[target].native) {
  const native = `brand-assets/ios/${SETS[target].native}/`;
  fs.copyFileSync(new URL(`${native}AppIcon-512@2x.png`, root), new URL('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', root));
  for (const file of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
    fs.copyFileSync(new URL(`${native}splash-2732x2732.png`, root), new URL(`ios/App/App/Assets.xcassets/Splash.imageset/${file}`, root));
  }
}
console.log(`Brand switched to ${target}.`);
