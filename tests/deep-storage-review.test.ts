import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';
import { SEED_MARKET_ITEMS } from '../src/data/seed';
import { computeLedgerBalance } from '../src/services/economy';
import { DataSaveConflictError, REPLACEMENT_EPOCH_KEY, subscribeDataSaveConflicts } from '../src/services/dataSnapshots';
import { queueDataWrite } from '../src/services/dataWrites';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
const { LocalDemoRepository, getInitialDemoState } = await import('../src/services/repository');
beforeEach(() => storage.values.clear());

function fixture() {
  const data = structuredClone(getInitialDemoState());
  data.missions = [{ id: 'daily-decision', userId: data.profile.id, title: 'Open my outline', type: 'daily_quest', area: 'Work', difficulty: 'easy', estimatedMinutes: 2, isOneDecision: true, status: 'active', createdAt: new Date().toISOString() }];
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  return data;
}

test('a profile save captured before a decision completion retains the kept decision and its evidence', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  // An open settings screen, or a second tab, holds the same snapshot that
  // useApp spreads before updateProfile/setSoundMuted submit their save.
  const settings = await repository.load();
  await repository.completeMission({ missionId: 'daily-decision', method: 'self', focusMinutes: 2 });
  const updated = { ...settings, profile: { ...settings.profile, soundMuted: true } };
  await repository.save(updated);
  const after = await repository.load();
  assert.equal(after.profile.soundMuted, true);
  assert.equal(after.missions[0].status, 'completed');
  assert.equal(after.completions.filter(item => item.missionId === 'daily-decision').length, 1);
  assert.equal(after.transactions.filter(item => item.kind === 'one_decision_reward').length, 1);
  assert.equal(after.twoFutures.buildingVotes, 1);
});

test('concurrent purchases retain both dreams and both payments', async () => {
  const data = fixture();
  data.transactions[0].amount = 500_000;
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const first = SEED_MARKET_ITEMS[0];
  const second = SEED_MARKET_ITEMS[1];
  const repository = new LocalDemoRepository();
  await Promise.all([repository.purchaseItem(first.id), new LocalDemoRepository().purchaseItem(second.id)]);
  const after = await repository.load();
  assert.deepEqual(new Set(after.purchases.map(item => item.itemId)), new Set([first.id, second.id]));
  assert.equal(after.transactions.filter(item => item.kind === 'purchase').length, 2);
  assert.equal(computeLedgerBalance(after.transactions), 500_000 - first.dreamDollarPrice - second.dreamDollarPrice);
});

test('concurrent purchase checks reject a second claim for the same dream', async () => {
  const data = fixture();
  data.transactions[0].amount = 500_000;
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const item = SEED_MARKET_ITEMS[0];
  const result = await Promise.allSettled([
    new LocalDemoRepository().purchaseItem(item.id),
    new LocalDemoRepository().purchaseItem(item.id),
  ]);
  assert.equal(result.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(result.filter(item => item.status === 'rejected').length, 1);
  const after = await new LocalDemoRepository().load();
  assert.equal(after.purchases.length, 1);
  assert.equal(computeLedgerBalance(after.transactions), 500_000 - item.dreamDollarPrice);
});

test('concurrent purchases check affordability against the payment that committed first', async () => {
  const data = fixture();
  data.transactions[0].amount = 70_000;
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const result = await Promise.allSettled([
    new LocalDemoRepository().purchaseItem(SEED_MARKET_ITEMS[0].id),
    new LocalDemoRepository().purchaseItem(SEED_MARKET_ITEMS[1].id),
  ]);
  assert.equal(result.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(result.filter(item => item.status === 'rejected').length, 1);
  const after = await new LocalDemoRepository().load();
  assert.equal(after.purchases.length, 1);
  assert.equal(after.transactions.filter(item => item.kind === 'purchase').length, 1);
  assert.ok(computeLedgerBalance(after.transactions) >= 0);
});

test('concurrent savings additions retain both amounts and log entries', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const { bridge } = await repository.createRealityBridge({
    userId: 'demo-user', purchaseId: 'purchase-one', realCostUsd: 1000,
    currentSavingsUsd: 100, targetDate: '2027-01-01', requiredMonthlySavingsUsd: 100,
    incomeProject: '', firstRealAction: '', nextMilestone: 'Save 150', realProgressPct: 10,
  });
  await Promise.all([
    repository.updateRealityBridgeSavings(bridge.id, 20, 'First addition'),
    new LocalDemoRepository().updateRealityBridgeSavings(bridge.id, 30, 'Second addition'),
  ]);
  const after = await repository.load();
  assert.equal(after.realityBridges[0].currentSavingsUsd, 150);
  assert.equal(after.realityBridges[0].savingsLogs.length, 3);
  assert.deepEqual(new Set(after.realityBridges[0].savingsLogs.map(item => item.note)), new Set(['First addition', 'Second addition', 'Initial Reality Bridge baseline']));
});

test('disjoint profile changes from the same baseline both survive', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const first = await repository.load();
  const second = await repository.load();
  await repository.save({ ...first, profile: { ...first.profile, displayName: 'A new name' } });
  const changed = { ...second, profile: { ...second.profile, soundMuted: true } };
  await repository.save(changed);
  const after = await repository.load();
  assert.equal(after.profile.displayName, 'A new name');
  assert.equal(after.profile.soundMuted, true);
  assert.equal(changed.profile.displayName, 'A new name', 'The caller receives the merged latest record');
});

test('conflicting edits to the same profile field reject before any write and notify the UI', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const first = await repository.load();
  const second = await repository.load();
  await repository.save({ ...first, profile: { ...first.profile, displayName: 'First name' } });
  const before = new Map(storage.values);
  let notifications = 0;
  const unsubscribe = subscribeDataSaveConflicts(() => notifications++);
  try {
    await assert.rejects(repository.save({ ...second, profile: { ...second.profile, displayName: 'Second name' } }), error => error instanceof DataSaveConflictError && error.field === 'profile.displayName');
  } finally { unsubscribe(); }
  assert.equal(notifications, 1);
  assert.deepEqual(storage.values, before);
});

test('an intentional mission deletion and reorder survive a disjoint newer settings save', async () => {
  const data = fixture();
  data.missions = ['one', 'two', 'three'].map(id => ({ ...data.missions[0], id }));
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const repository = new LocalDemoRepository();
  const edit = await repository.load();
  const settings = await repository.load();
  await repository.save({ ...settings, profile: { ...settings.profile, soundMuted: true } });
  await repository.save({ ...edit, missions: [edit.missions[2], edit.missions[0]] });
  const after = await repository.load();
  assert.deepEqual(after.missions.map(mission => mission.id), ['three', 'one']);
  assert.equal(after.profile.soundMuted, true);
});

test('concurrent edits to the mission array reject rather than inventing a merged list', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const first = await repository.load();
  const second = await repository.load();
  await repository.save({ ...first, missions: [...first.missions, { ...first.missions[0], id: 'first-new' }] });
  const before = new Map(storage.values);
  await assert.rejects(repository.save({ ...second, missions: [...second.missions, { ...second.missions[0], id: 'second-new' }] }), error => error instanceof DataSaveConflictError && error.field === 'missions');
  assert.deepEqual(storage.values, before);
});

test('even an identical explicit restore invalidates snapshots that were captured before it', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const stale = await repository.load();
  await repository.replaceAll(JSON.parse(JSON.stringify(stale)));
  const before = new Map(storage.values);
  const restored = JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!);
  assert.equal(typeof restored[REPLACEMENT_EPOCH_KEY], 'string');
  await assert.rejects(repository.save({ ...stale, profile: { ...stale.profile, soundMuted: true } }), DataSaveConflictError);
  assert.deepEqual(storage.values, before);
});

test('a profile write queued behind a restore cannot resurrect pre-restore writing', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  await repository.mutateNotebook({ type: 'save_entry', input: { kind: 'journal', content: 'Before import private writing' } });
  const stale = await repository.load();
  const replacement = structuredClone(getInitialDemoState());
  replacement.notebook!.entries = [{ id: 'restored-note', kind: 'journal', title: '', content: 'Restored private writing', dateKey: '2026-09-30', createdAt: '2026-09-30T12:00:00Z', updatedAt: '2026-09-30T12:00:00Z' }];
  let release!: () => void;
  const held = queueDataWrite(() => new Promise<void>(resolve => { release = resolve; }));
  await Promise.resolve();
  const restore = repository.replaceAll(replacement);
  const save = repository.save({ ...stale, profile: { ...stale.profile, soundMuted: true } });
  release();
  await held; await restore;
  await assert.rejects(save, DataSaveConflictError);
  const after = await repository.load();
  assert.deepEqual(after.notebook!.entries.map(entry => entry.content), ['Restored private writing']);
});

test('legacy records missing transactions can merge a settings edit after a course-only write', async () => {
  const legacy = fixture();
  delete (legacy as Partial<typeof legacy>).transactions;
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(legacy));
  const repository = new LocalDemoRepository();
  const stale = await repository.load();
  const current = JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!);
  current.courseProgress = { version: 1, lessons: {} };
  current.courseProgress.experiments = {};
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(current));
  await repository.save({ ...stale, profile: { ...stale.profile, soundMuted: true } });
  const after = await repository.load();
  assert.equal(after.profile.soundMuted, true);
  assert.deepEqual(after.transactions, []);
});

test('clearing and recreating the personal record invalidates earlier editable snapshots', async () => {
  fixture();
  const repository = new LocalDemoRepository();
  const stale = await repository.load();
  await repository.clear();
  await repository.load();
  const before = new Map(storage.values);
  await assert.rejects(repository.save({ ...stale, profile: { ...stale.profile, displayName: 'An old edit' } }), DataSaveConflictError);
  assert.deepEqual(storage.values, before);
});

test('deleting imported own magic keys while another nested field changes never revives them', async () => {
  const data = fixture() as ReturnType<typeof fixture> & { privateMetadata: Record<string, unknown> };
  data.privateMetadata = JSON.parse('{"__proto__":{"note":"Private imported field"},"constructor":{"note":"Another imported field"},"extra":"before"}');
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const repository = new LocalDemoRepository();
  const stale = await repository.load() as typeof data;
  const latest = await repository.load() as typeof data;
  const concurrentMetadataEdit = { ...latest, privateMetadata: { ...latest.privateMetadata, extra: 'after' } };
  await repository.save(concurrentMetadataEdit);
  const privateMetadata = { ...stale.privateMetadata };
  delete privateMetadata.__proto__;
  delete privateMetadata.constructor;
  const metadataDeletion = { ...stale, privateMetadata };
  await repository.save(metadataDeletion);
  const after = await repository.load() as typeof data;
  assert.deepEqual(after.privateMetadata, { extra: 'after' });
  assert.equal(Object.getPrototypeOf(after.privateMetadata), Object.prototype);
  assert.equal(({} as Record<string, unknown>).note, undefined);
});

test('mission evidence, generated bridges and savings logs keep unique IDs in a single clock tick', async () => {
  const data = fixture();
  data.missions.push({ ...data.missions[0], id: 'second-decision' });
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  const originalNow = Date.now;
  Date.now = () => 1_800_000_000_000;
  try {
    const repository = new LocalDemoRepository();
    await Promise.all(['daily-decision', 'second-decision'].map(missionId => repository.completeMission({ missionId, method: 'self' })));
    const base = { userId: 'demo-user', purchaseId: 'purchase-one', realCostUsd: 1000, currentSavingsUsd: 100, targetDate: '2027-01-01', requiredMonthlySavingsUsd: 100, incomeProject: '', firstRealAction: 'Write a plan', nextMilestone: 'Save 150', realProgressPct: 10 };
    const bridges = await Promise.all([repository.createRealityBridge(base), repository.createRealityBridge(base)]);
    await Promise.all(bridges.map(({ bridge }) => repository.updateRealityBridgeSavings(bridge.id, 20)));
    const after = await repository.load();
    for (const collection of [after.completions, after.transactions, after.realityBridges, after.missions, after.realityBridges.flatMap(bridge => bridge.savingsLogs)]) {
      assert.equal(new Set(collection.map(item => item.id)).size, collection.length);
    }
    assert.deepEqual(after.realityBridges.map(bridge => bridge.currentSavingsUsd), [120, 120]);
    assert.deepEqual(new Set(after.realityBridges.map(bridge => bridge.generatedMissionId)), new Set(after.missions.filter(mission => mission.purchaseId === base.purchaseId).map(mission => mission.id)));
  } finally { Date.now = originalNow; }
});
