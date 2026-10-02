import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IMAGE_DELIVERY_ASSETS } from '../src/data/imageDeliveryAssets';
import { imageDeliverySources, imageFailureKind } from '../src/data/imageDelivery';
import { courseCatalogFor } from '../src/data/courseCatalog';
import { courseCoverFor } from '../src/data/coursePresentation';
import { treePresentation } from '../src/data/treePresentation';

const root = new URL('../public/', import.meta.url);
const read = (src: string) => readFileSync(new URL(src, root));
const sha256 = (value: Buffer) => createHash('sha256').update(value).digest('hex');
const manifest = JSON.parse(read('assets/oda/delivery/manifest.json').toString());

function losslessDimensions(bytes: Buffer) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 < bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4);
    if (bytes.toString('ascii', offset, offset + 4) === 'VP8L') {
      assert.equal(bytes[offset + 8], 0x2f);
      const bits = bytes.readUInt32LE(offset + 9);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset += 8 + size + (size % 2);
  }
  assert.fail('Delivery asset must contain lossless VP8L image data');
}

test('every approved PNG and both approval manifests remain unchanged', () => {
  assert.equal(Object.keys(manifest.immutableSources).length, 12);
  for (const [src, hash] of Object.entries(manifest.immutableSources)) assert.equal(sha256(read(src)), hash, src);
});

test('served responsive variants match actual lossless bitstream dimensions, hashes, and complete-frame geometry', () => {
  assert.equal(Object.keys(IMAGE_DELIVERY_ASSETS).length, 10);
  for (const [original, variants] of Object.entries(IMAGE_DELIVERY_ASSETS)) {
    const approved = manifest.assets[original];
    assert.equal(variants.length, approved.variants.length);
    let previous = 0;
    for (const [index, variant] of variants.entries()) {
      const quality = approved.variants[index];
      const bytes = read(variant.src);
      assert.equal(sha256(bytes), quality.sha256);
      assert.equal(bytes.length, quality.bytes);
      assert.deepEqual(losslessDimensions(bytes), { width: variant.width, height: variant.height });
      assert.ok(variant.width > previous && variant.width <= approved.width);
      assert.equal(variant.height, Math.round(approved.height * variant.width / approved.width));
      assert.equal(quality.fullFrame, true);
      assert.equal(quality.referencePixelErrorMaxRGBA, 0);
      assert.equal(quality.referenceAlphaErrorMax, 0);
      if (original.includes('/trees/')) {
        assert.deepEqual(quality.alphaExtrema, [0, 255]);
        assert.ok(quality.fullyTransparentPixels > 0 && quality.partiallyTransparentPixels > 0);
        assert.ok(quality.rootBaselineDeviationCSSPixelsAt260 < 1, `Root drift in main's 260px tree: ${variant.src}`);
      }
      previous = variant.width;
    }
  }
});

test('all real course covers and tree stages have deployment-scoped responsive sources and retain PNG fallbacks', () => {
  const paths = [...courseCatalogFor('en').map(course => courseCoverFor(course.id).src),
    ...[0, 1, 10, 30, 60, 90].map(count => `assets/oda/trees/${treePresentation(count).file}`)];
  assert.equal(new Set(paths).size, 10);
  for (const original of paths) {
    assert.ok(read(original).length > 0);
    const sources = imageDeliverySources(original, '/one-decision-away/');
    assert.ok(sources);
    assert.ok(sources.split(', ').every(candidate => candidate.startsWith('/one-decision-away/assets/oda/delivery/')));
  }
  assert.equal(imageDeliverySources('constructor', '/'), undefined);
  assert.equal(imageDeliverySources('assets/unknown.png', '/'), undefined);
});

test('modern-image failures retry the original; PNG and malformed failures reach the existing final fallback', () => {
  assert.equal(imageFailureKind('https://example.test/repo/tree-320.webp?version=1'), 'webp');
  assert.equal(imageFailureKind('/repo/cover-640.webp'), 'webp');
  assert.equal(imageFailureKind('/repo/original.png?name=.webp'), 'original');
  assert.equal(imageFailureKind(''), 'original');
});
