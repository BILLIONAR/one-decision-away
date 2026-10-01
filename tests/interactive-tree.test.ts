import test from 'node:test';
import assert from 'node:assert/strict';
import { treeGrowth } from '../src/components/momentum/treeGeometry';

test('3D decorative growth preserves 60 kept decisions and 30 extra blossoms', () => {
  assert.deepEqual(treeGrowth(0), { kept: 0, leaves: 0, blossoms: 0 });
  assert.deepEqual(treeGrowth(59), { kept: 59, leaves: 59, blossoms: 0 });
  assert.deepEqual(treeGrowth(60), { kept: 60, leaves: 60, blossoms: 0 });
  assert.deepEqual(treeGrowth(61), { kept: 61, leaves: 60, blossoms: 1 });
  assert.deepEqual(treeGrowth(90), { kept: 90, leaves: 60, blossoms: 30 });
  assert.deepEqual(treeGrowth(150), { kept: 150, leaves: 60, blossoms: 30 });
});

test('3D display normalizes invalid counts without changing the evidence source', () => {
  for (const count of [-1, NaN, Infinity]) assert.deepEqual(treeGrowth(count), { kept: 0, leaves: 0, blossoms: 0 });
  assert.deepEqual(treeGrowth(30.9), { kept: 30, leaves: 30, blossoms: 0 });
});
