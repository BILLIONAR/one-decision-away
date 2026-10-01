import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { evidenceSummary } from '../src/services/momentum';
import { treePresentation } from '../src/data/treePresentation';
import type { Mission } from '../src/types/models';

test('growth keeps an exact capped ledger through every stage boundary and beyond the canopy', () => {
  for (const [count, stage, leaves, blossoms] of [
    [0, 'seedling', 0, 0], [1, 'sapling', 1, 0], [9, 'sapling', 9, 0], [10, 'young', 10, 0],
    [29, 'young', 29, 0], [30, 'fuller', 30, 0], [59, 'fuller', 59, 0], [60, 'mature', 60, 0],
    [61, 'flowering', 60, 1], [89, 'flowering', 60, 29], [90, 'flowering', 60, 30], [120, 'flowering', 60, 30],
  ] as const) {
    const tree = treePresentation(count);
    assert.equal(tree.total, count); assert.equal(tree.stage, stage);
    assert.equal(tree.leaves, leaves); assert.equal(tree.blossoms, blossoms);
  }
  const now = new Date('2026-10-01T12:00:00');
  const missions = Array.from({ length: 12 }, (_, i) => ({ id: `kept-${i}`, title: 'Kept', status: 'completed', isOneDecision: true, completedAt: now.toISOString() } as Mission));
  const summary = evidenceSummary(missions, now);
  assert.equal(treePresentation(summary.total).total, 12);
  assert.equal(summary.last7, 1, 'Several kept decisions on one day count once in weekly applied progress');
});

test('approved tree pixels and normalized roots match their independent asset manifest', () => {
  const root = new URL('../public/assets/oda/trees/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
  for (const asset of manifest.assets) {
    const tree = treePresentation(asset.minKeptDecisions);
    assert.equal(tree.file, asset.file);
    assert.equal(createHash('sha256').update(readFileSync(new URL(tree.file, root))).digest('hex'), asset.sha256);
    assert.deepEqual(tree.origin, asset.transformOriginPercent);
    assert.equal(tree.scale, asset.displayScale);
    assert.deepEqual(tree.offset, [asset.displayOffsetXPercent, asset.displayOffsetYPercent]);
    assert.ok(Math.abs(tree.origin[0] + tree.offset[0] - 50) < .001);
    assert.ok(Math.abs(tree.origin[1] + tree.offset[1] - 88) < .001);
  }
});
