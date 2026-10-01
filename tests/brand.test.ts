import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BRAND } from '../src/brand/current';
import { LogoV5, LogoV5Compact, LogoV5Lockup } from '../src/components/brand/LogoV5';
import { BRAND_V5, brandV5MarkSvg } from '../src/brand/v5';

const root = new URL('../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const referenceFiles = ['index.html', 'public/manifest.webmanifest', 'public/sw.js', 'src/services/notificationScheduler.ts', 'src/pages/Settings.tsx', 'supabase/functions/send-nudges/push-worker.test.ts'];

test('active web metadata, offline shell and notifications use existing v5 identity assets', () => {
  assert.equal(BRAND, 'v5');
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  assert.equal(manifest.icons.length, 4);
  for (const icon of manifest.icons) {
    assert.match(icon.src, /^\.\/brand\/v5\//);
    const bytes = readFileSync(new URL(`public/${icon.src.slice(2)}`, root));
    assert.equal(bytes.readUInt32BE(16), Number(icon.sizes.split('x')[0]));
    assert.equal(bytes.readUInt32BE(20), Number(icon.sizes.split('x')[1]));
    assert.match(read('public/sw.js'), new RegExp(icon.src.slice(2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const path of referenceFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /brand\/oda-(?:app|apple|favicon)-c4/);
    for (const match of source.matchAll(/brand\/v5\/[\w.-]+\.(?:png|svg)/g)) assert.ok(existsSync(new URL(`public/${match[0]}`, root)), `${path}: ${match[0]} exists`);
  }
  assert.match(read('index.html'), /brand\/v5\/og-image-v5\.png/);
  assert.ok(existsSync(new URL('public/brand/oda-c4.png', root)));
  for (const version of ['v2', 'v3', 'v4']) assert.ok(existsSync(new URL(`public/brand/${version}/oda-mark-${version}.svg`, root)));
});

test('small and horizontal identity are accessible vector paths with explicit inversions', () => {
  for (const [Component, viewBox] of [[LogoV5, '0 0 40 40'], [LogoV5Compact, '0 0 84 32'], [LogoV5Lockup, '0 0 192 64']] as const) {
    const html = renderToStaticMarkup(createElement(Component, { title: 'ODA', variant: 'inverted' }));
    assert.ok(html.includes(`viewBox="${viewBox}"`));
    assert.match(html, /role="img" aria-label="ODA"/);
    assert.match(html, /data-brand-variant="inverted"/);
    assert.doesNotMatch(html, /<image|filter:|brightness/);
    for (const path of BRAND_V5.branchPaths) assert.ok(html.includes(path));
    assert.match(html, /--oda-brand-outline:var\(--brand-ivory/);
  }
  assert.match(renderToStaticMarkup(createElement(LogoV5)), /aria-hidden="true"/);
  const mono = brandV5MarkSvg('monochrome');
  assert.doesNotMatch(mono, new RegExp(BRAND_V5.wine));
});

test('native icon and splash select v5 artwork while former active originals remain preserved', () => {
  for (const [active, source, archive] of [
    ['AppIcon.appiconset/AppIcon-512@2x.png', 'AppIcon-512@2x.png', 'AppIcon-512@2x.png'],
    ['Splash.imageset/splash-2732x2732.png', 'splash-2732x2732.png', 'splash-2732x2732.png'],
    ['Splash.imageset/splash-2732x2732-1.png', 'splash-2732x2732.png', 'splash-2732x2732-1.png'],
    ['Splash.imageset/splash-2732x2732-2.png', 'splash-2732x2732.png', 'splash-2732x2732-2.png'],
  ]) {
    const selected = readFileSync(new URL(`ios/App/App/Assets.xcassets/${active}`, root));
    assert.deepEqual(selected, readFileSync(new URL(`brand-assets/ios/v5/${source}`, root)));
    assert.notDeepEqual(selected, readFileSync(new URL(`brand-assets/ios/pre-v5-active/${archive}`, root)));
  }
});

test('brand switch can return to every retained identity without stale web references', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'oda-brand-switch-'));
  try {
    for (const path of ['scripts/brand.mjs', 'src/brand/current.ts', ...referenceFiles]) {
      mkdirSync(dirname(join(workspace, path)), { recursive: true });
      copyFileSync(new URL(path, root), join(workspace, path));
    }
    for (const version of ['c4', 'v2', 'v3', 'v4', 'v5']) {
      execFileSync(process.execPath, [join(workspace, 'scripts/brand.mjs'), version]);
      const current = readFileSync(join(workspace, 'src/brand/current.ts'), 'utf8');
      assert.ok(current.includes(`= '${version}';`));
      const manifest = JSON.parse(readFileSync(join(workspace, 'public/manifest.webmanifest'), 'utf8'));
      for (const icon of manifest.icons) assert.ok(icon.src.includes(version === 'c4' ? '-c4-' : `/brand/${version}/`));
      const shell = readFileSync(join(workspace, 'public/sw.js'), 'utf8');
      assert.ok(shell.includes(version === 'c4' ? 'brand/oda-c4.png' : `brand/${version}/oda-mark-${version}.svg`));
    }
  } finally { rmSync(workspace, { recursive: true, force: true }); }
});
