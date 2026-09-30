import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { prepareBackupRestore, InvalidBackupError } from '../src/services/backup';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';
import { SEED_MARKET_ITEMS } from '../src/data/seed';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  },
});
const { getInitialDemoState, LocalDemoRepository } = await import('../src/services/repository');
beforeEach(() => values.clear());

const cases: { name: string; corrupt: (backup: Record<string, any>) => void }[] = [
  { name: 'weekly review text cannot be an object', corrupt: backup => {
    backup.weeklyReviews = [{ weekKey: '2026-09-27', kept: 1, change: { malformed: true }, createdAt: '2026-09-27T12:00:00Z' }];
  } },
  { name: 'life score records need sortable timestamps', corrupt: backup => {
    backup.lifeScores = [{}, {}];
  } },
  { name: 'bridge records need their rendered amounts', corrupt: backup => {
    backup.realityBridges = [{}];
  } },
  { name: 'a pinned dream name cannot be a React object child', corrupt: backup => {
    backup.customMarketItems = [{ ...SEED_MARKET_ITEMS[0], id: 'corrupt-dream', name: { malformed: true } }];
    backup.inVisionItemIds = ['corrupt-dream'];
  } },
];

for (const scenario of cases) {
  test(`restore safety: ${scenario.name}`, async () => {
    const original = structuredClone(getInitialDemoState());
    original.profile.displayName = 'Keep my saved record';
    const stored = JSON.stringify(original);
    values.set(APP_DATA_STORAGE_KEY, stored);
    const corrupt = structuredClone(original) as unknown as Record<string, any>;
    scenario.corrupt(corrupt);
    assert.throws(() => prepareBackupRestore(corrupt), InvalidBackupError);
    const repository = new LocalDemoRepository();
    await assert.rejects(() => repository.replaceAll(corrupt as typeof original), InvalidBackupError);
    assert.equal(values.get(APP_DATA_STORAGE_KEY), stored, 'Rejected records must not replace personal data');
  });
}
