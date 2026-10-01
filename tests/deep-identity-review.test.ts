import assert from 'node:assert/strict';
import { test } from 'node:test';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';
import { SEED_MARKET_ITEMS } from '../src/data/seed';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
const { LocalDemoRepository, getInitialDemoState } = await import('../src/services/repository');

test('purchases and payments committed within one clock tick keep distinct identities', async () => {
  const seed = structuredClone(getInitialDemoState());
  seed.transactions[0].amount = 500_000;
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(seed));
  const original = Date.now;
  Date.now = () => 1_790_812_800_000;
  try {
    const repository = new LocalDemoRepository();
    await Promise.all([
      repository.purchaseItem(SEED_MARKET_ITEMS[0].id),
      repository.purchaseItem(SEED_MARKET_ITEMS[1].id),
    ]);
    const saved = await repository.load();
    assert.equal(saved.purchases.length, 2);
    assert.equal(new Set(saved.purchases.map(item => item.id)).size, 2);
    const payments = saved.transactions.filter(item => item.kind === 'purchase');
    assert.equal(payments.length, 2);
    assert.equal(new Set(payments.map(item => item.id)).size, 2);
  } finally {
    Date.now = original;
  }
});
