import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Notebook369Practice, NotebookMutationResult, UserData } from '../src/types/models';

class MemoryStorage {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('QuotaExceededError');
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
process.env.TZ = 'Europe/Istanbul';

const { applyNotebookAction, getNotebookDateKey, normalizeNotebook, getNotebookEntries, getNotebookStats, get369Progress, normalize369Text, matches369Intention } = await import('../src/services/notebook');
const { LocalDemoRepository, getInitialDemoState } = await import('../src/services/repository');
const { cloudSync } = await import('../src/services/cloudSync');

function fixture(): UserData {
  const data = structuredClone(getInitialDemoState());
  data.dreamJournal = [];
  data.transactions = [];
  data.notebook = normalizeNotebook();
  return data;
}
const noon = (day: string) => new Date(`${day}T12:00:00+03:00`);
const source = (kind: 'journal' | 'scripting' | 'future_letter' = 'journal') => ({ type: 'save_entry', input: { kind, content: 'A real page of writing.' } } as const);
const result = (value: unknown) => value as NotebookMutationResult;

test('old backups normalize without copying or losing any legacy Dream Journal field', () => {
  const data = fixture();
  delete data.notebook;
  data.dreamJournal = [{ id: 'old', userId: 'u', title: 'Legacy', content: 'Full text\nwith paragraphs', photoDataUrl: 'data:image/png;base64,AA==', dreamId: 'd', dreamName: 'My dream', mood: 'visionary', createdAt: '2026-09-18T22:00:00Z', updatedAt: '2026-09-19T08:00:00Z' }];
  const original = JSON.stringify(data);
  const entries = getNotebookEntries(data, { kinds: ['journal'], query: 'paragraphs', dateKey: '2026-09-19' });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].source, 'dream');
  assert.equal(entries[0].photoDataUrl, data.dreamJournal[0].photoDataUrl);
  assert.equal(entries[0].dreamId, 'd');
  assert.equal(entries[0].mood, 'visionary');
  assert.equal(entries[0].createdAt, data.dreamJournal[0].createdAt);
  assert.equal(JSON.stringify(data), original);
  assert.deepEqual(normalizeNotebook().activityDays, []);
});

test('new writing of every kind including affirmation earns 25 once; intention alone does not', () => {
  for (const action of [source(), source('scripting'), source('future_letter'), { type: 'save_affirmation', input: { text: 'I am capable.' } } as const, { type: 'save_gratitude', dateKey: '2026-09-19', items: ['My family'] } as const]) {
    const first = applyNotebookAction(fixture(), action as Parameters<typeof applyNotebookAction>[1], noon('2026-09-19'));
    assert.equal(result(first.result).rewardAmount, 25);
    assert.equal(first.data.transactions[0].id, 'notebook:demo-user:2026-09-19');
    const next = applyNotebookAction(first.data, source(), noon('2026-09-19'));
    assert.equal(result(next.result).rewardAmount, 0);
    assert.equal(next.data.transactions.length, 1);
  }
  const start = applyNotebookAction(fixture(), { type: 'start_369', intention: 'I am capable.' }, noon('2026-09-19'));
  assert.equal(start.data.transactions.length, 0);
  assert.equal(start.data.notebook!.activityDays.length, 0);
});

test('edit, no-op, delete and recreate preserve immutable once-per-day reward claims', () => {
  let update = applyNotebookAction(fixture(), source(), noon('2026-09-19'));
  const entry = update.data.notebook!.entries[0];
  const unchanged = applyNotebookAction(update.data, { type: 'save_entry', input: { ...entry } }, noon('2026-09-19'));
  assert.equal(unchanged.data, update.data);
  const edited = applyNotebookAction(update.data, { type: 'save_entry', input: { ...entry, content: 'Edited writing' } }, noon('2026-09-20'));
  assert.equal(result(edited.result).firstActivityToday, false);
  assert.equal(edited.data.notebook!.activityDays.length, 1);
  update = applyNotebookAction(update.data, { type: 'delete_entry', id: entry.id }, noon('2026-09-19'));
  update = applyNotebookAction(JSON.parse(JSON.stringify(update.data)), source(), noon('2026-09-19'));
  assert.equal(result(update.result).rewardAmount, 0);
  assert.equal(update.data.transactions.length, 1);
  assert.equal(update.data.notebook!.activityDays.length, 1);
});

test('local writing day and existing UTC reward ceiling are separate and cap-safe', () => {
  const now = new Date('2026-09-19T21:30:00Z');
  assert.equal(getNotebookDateKey(now), '2026-09-20');
  const data = fixture();
  data.transactions = [{ id: 'prior', walletId: 'wallet-demo', userId: 'demo-user', kind: 'mission_reward', amount: 2490, dayKey: '2026-09-19', memo: '', createdAt: now.toISOString() }];
  let update = applyNotebookAction(data, source(), now);
  assert.equal(result(update.result).rewardAmount, 10);
  assert.equal(update.data.transactions[0].dayKey, '2026-09-19');
  assert.equal(update.data.notebook!.activityDays[0].dateKey, '2026-09-20');
  assert.equal(update.data.notebook!.activityDays[0].economyDayKey, '2026-09-19');
  data.transactions[0].amount = 2500;
  update = applyNotebookAction(data, source(), now);
  assert.equal(result(update.result).rewardAmount, 0);
  assert.equal(update.data.notebook!.activityDays.length, 1);
  // Even crossing UTC midnight during this same local day cannot reopen a claimed reward.
  const again = applyNotebookAction(update.data, source(), new Date('2026-09-20T01:00:00Z'));
  assert.equal(result(again.result).rewardAmount, 0);
  assert.equal(again.data.transactions.length, 1);
});

test('369 only counts matching written intentions, allows partial saves and retains archived histories', () => {
  let update = applyNotebookAction(fixture(), { type: 'start_369', intention: 'I am focused.' }, noon('2026-09-19'));
  const practice = update.result as Notebook369Practice;
  assert.equal(normalize369Text('  I  AM\nfocused. '), 'i am focused.');
  assert.throws(() => applyNotebookAction(update.data, { type: 'save_369', practiceId: practice.id, dateKey: '2026-09-19', slot: 'morning', writtenLines: ['Unrelated words'] }, noon('2026-09-19')), /must match/);
  update = applyNotebookAction(update.data, { type: 'save_369', practiceId: practice.id, dateKey: '2026-09-19', slot: 'morning', writtenLines: [' I AM   focused. ', ''] }, noon('2026-09-19'));
  assert.equal(result(update.result).rewardAmount, 25);
  let progress = get369Progress(update.data.notebook!.practices369[0], noon('2026-09-19'));
  assert.equal(progress.counts.morning, 1);
  assert.equal(progress.completedToday, false);
  for (const [slot, count] of [['morning', 3], ['midday', 6], ['evening', 9]] as const) {
    update = applyNotebookAction(update.data, { type: 'save_369', practiceId: practice.id, dateKey: '2026-09-19', slot, writtenLines: Array(count).fill('I am focused.') }, noon('2026-09-19'));
  }
  progress = get369Progress(update.data.notebook!.practices369[0], noon('2026-09-19'));
  assert.equal(progress.completedToday, true);
  assert.equal(progress.currentStreak, 1);
  assert.equal(update.data.transactions.length, 1);
  const corrupted = structuredClone(update.data.notebook!.practices369[0]);
  corrupted.days['2026-09-19'].morning[0] = 'Not the intention';
  assert.equal(get369Progress(corrupted, noon('2026-09-19')).completedToday, false);
  update = applyNotebookAction(update.data, { type: 'start_369', intention: 'I am patient.' }, noon('2026-09-19'));
  assert.equal(update.data.notebook!.practices369.length, 2);
  assert.ok(update.data.notebook!.practices369[1].archivedAt);
  assert.equal(get369Progress(update.data.notebook!.practices369[1], noon('2026-09-19')).completedToday, true);
});

test('369 derives a real 33-day streak and preserves the achieved target after a gap', () => {
  const practice: Notebook369Practice = { id: 'p', intention: 'I am present.', startDateKey: '2026-01-01', days: {}, createdAt: '2026-01-01T09:00:00Z', updatedAt: '' };
  for (let offset = 0; offset < 33; offset++) {
    const date = new Date(2026, 0, 1 + offset, 12);
    practice.days[getNotebookDateKey(date)] = { morning: Array(3).fill(practice.intention), midday: Array(6).fill(practice.intention), evening: Array(9).fill(practice.intention), updatedAt: date.toISOString() };
  }
  const complete = get369Progress(practice, new Date(2026, 1, 2, 12));
  assert.equal(complete.currentStreak, 33);
  assert.equal(complete.progressPercent, 100);
  assert.equal(complete.targetReached, true);
  const later = get369Progress(practice, new Date(2026, 1, 5, 12));
  assert.equal(later.currentStreak, 0);
  assert.equal(later.bestStreak, 33);
  assert.equal(later.targetReached, true);
});

test('369 matches Turkish dotted/dotless uppercase pairs without stripping meaningful accents', () => {
  assert.ok(matches369Intention('ben iyiyim', 'BEN İYİYİM'));
  assert.ok(matches369Intention('sakin kalırım', 'SAKİN KALIRIM'));
  assert.ok(matches369Intention('i am ready', 'I AM READY'));
  assert.equal(matches369Intention('si puedo', 'sí puedo'), false);
  assert.equal(matches369Intention('kir', 'kır'), false);
  const start = applyNotebookAction(fixture(), { type: 'start_369', intention: 'BEN İYİYİM' }, noon('2026-09-19'));
  const practice = start.result as Notebook369Practice;
  const saved = applyNotebookAction(start.data, { type: 'save_369', practiceId: practice.id, dateKey: '2026-09-19', slot: 'morning', writtenLines: ['ben iyiyim'] }, noon('2026-09-19'));
  assert.equal(get369Progress(saved.data.notebook!.practices369[0], noon('2026-09-19')).counts.morning, 1);
});

test('calendar streaks use local days across DST, not elapsed 24-hour periods', () => {
  const originalTZ = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    const data = fixture();
    for (const day of ['2026-03-07', '2026-03-08', '2026-03-09']) {
      data.notebook!.activityDays.push({ dateKey: day, firstRecordedAt: '', economyDayKey: day, rewardAmount: 0 });
    }
    const stats = getNotebookStats(data, new Date('2026-03-10T01:00:00Z'));
    assert.equal(getNotebookDateKey(new Date('2026-03-10T01:00:00Z')), '2026-03-09');
    assert.equal(stats.currentStreak, 3);
    assert.equal(stats.bestStreak, 3);
    assert.equal(getNotebookStats(data, new Date('2026-03-11T12:00:00-04:00')).currentStreak, 0);
  } finally { process.env.TZ = originalTZ; }
});

test('validation rejects blank entries, future dates, past creation and excess slots without altering input', () => {
  const data = fixture();
  const before = JSON.stringify(data);
  assert.throws(() => applyNotebookAction(data, { type: 'save_entry', input: { kind: 'journal', content: ' \n ' } }, noon('2026-09-19')), /Write something/);
  assert.throws(() => applyNotebookAction(data, { type: 'save_gratitude', dateKey: '2026-09-20', items: ['a'] }, noon('2026-09-19')), /Future dates/);
  assert.throws(() => applyNotebookAction(data, { type: 'save_gratitude', dateKey: '2026-09-18', items: ['a'] }, noon('2026-09-19')), /Past days/);
  assert.throws(() => applyNotebookAction(data, { type: 'save_gratitude', dateKey: '2026-09-19', items: Array(6).fill('a') }, noon('2026-09-19')), /fixed number/);
  const blank = applyNotebookAction(data, { type: 'save_gratitude', dateKey: '2026-09-19', items: ['', ''] }, noon('2026-09-19'));
  assert.equal(blank.data, data);
  assert.equal(JSON.stringify(data), before);
});

test('legacy edits preserve photos, links and original date; unified JSON roundtrip is lossless', () => {
  let update = applyNotebookAction(fixture(), { type: 'add_dream', input: { title: 'Dream', content: 'Original', photoDataUrl: 'data:image/png;base64,123', dreamId: 'dream', dreamName: 'Villa', mood: 'visionary' } }, noon('2026-09-19'));
  const original = update.data.dreamJournal![0];
  update = applyNotebookAction(update.data, { type: 'update_dream', id: original.id, patch: { content: 'Updated' } }, noon('2026-09-20'));
  assert.equal(update.data.dreamJournal![0].photoDataUrl, original.photoDataUrl);
  assert.equal(update.data.dreamJournal![0].createdAt, original.createdAt);
  assert.equal(update.data.dreamJournal![0].dreamName, 'Villa');
  assert.equal(update.data.transactions.length, 1);
  const roundtrip = JSON.parse(JSON.stringify(update.data));
  assert.deepEqual(roundtrip.notebook, update.data.notebook);
  assert.deepEqual(roundtrip.dreamJournal, update.data.dreamJournal);
  const combined = applyNotebookAction(update.data, source('scripting'), noon('2026-09-20'));
  assert.equal(getNotebookEntries(combined.data).length, 2);
  assert.equal(getNotebookEntries(combined.data, { kinds: ['journal'] }).length, 1);
});

test('real repository serializes concurrent writes, protects from stale saves, and honors explicit restore', async () => {
  storage.clear();
  const repo = new LocalDemoRepository();
  const second = new LocalDemoRepository();
  await repo.replaceAll(fixture());
  const stale = structuredClone(await repo.load());
  await Promise.all(Array.from({ length: 12 }, (_, i) => (i % 2 ? repo : second).mutateNotebook({ type: 'save_entry', input: { kind: 'journal', content: `Entry ${i}` } })));
  let saved = await repo.load();
  assert.equal(saved.notebook!.entries.length, 12);
  assert.equal(saved.notebook!.activityDays.length, 1);
  assert.equal(saved.transactions.filter((tx) => tx.kind === 'notebook_reward').length, 1);
  stale.profile.displayName = 'Updated profile';
  await second.save(stale);
  saved = await repo.load();
  assert.equal(saved.profile.displayName, 'Updated profile');
  assert.equal(saved.notebook!.entries.length, 12);
  assert.equal(stale.notebook!.entries.length, 12); // caller will publish this same object to React
  assert.equal(saved.transactions.filter((tx) => tx.kind === 'notebook_reward').length, 1);
  const backup = JSON.parse(JSON.stringify(saved));
  await repo.mutateNotebook({ type: 'delete_entry', id: saved.notebook!.entries[0].id });
  await repo.replaceAll(backup);
  assert.deepEqual((await repo.load()).notebook, backup.notebook);
  const oldBackup = fixture();
  delete oldBackup.notebook;
  await repo.replaceAll(oldBackup);
  saved = await repo.load();
  assert.equal(saved.notebook!.entries.length, 0);
  assert.equal(saved.notebook!.activityDays.length, 0);
  assert.equal(saved.transactions.length, 0);
});

test('stale whole-document saves do not resurrect deleted legacy entries or lose new ones', async () => {
  storage.clear();
  const repo = new LocalDemoRepository();
  await repo.replaceAll(fixture());
  await repo.mutateNotebook({ type: 'add_dream', input: { title: 'Dream', content: 'Preserve this', photoDataUrl: 'photo' } });
  const stale = structuredClone(await repo.load());
  await repo.mutateNotebook({ type: 'delete_dream', id: stale.dreamJournal![0].id });
  await repo.save(stale);
  assert.equal((await repo.load()).dreamJournal!.length, 0);
  assert.equal((await repo.load()).notebook!.activityDays.length, 1);
});

test('Notebook rebases after a delayed load against a concurrent profile and ledger save', async () => {
  storage.clear();
  const repo = new LocalDemoRepository();
  await repo.replaceAll(fixture());
  const originalLoad = repo.load.bind(repo);
  let release!: () => void;
  let loaded!: () => void;
  const paused = new Promise<void>((resolve) => { release = resolve; });
  const didLoad = new Promise<void>((resolve) => { loaded = resolve; });
  repo.load = async () => { const snapshot = await originalLoad(); loaded(); await paused; return snapshot; };
  const writing = repo.mutateNotebook(source());
  await didLoad;
  const other = new LocalDemoRepository();
  const latest = await other.load();
  latest.profile.displayName = 'Concurrent update';
  latest.transactions.push({ id: 'concurrent-mission', walletId: 'wallet-demo', userId: 'demo-user', kind: 'mission_reward', amount: 2490, dayKey: new Date().toISOString().slice(0, 10), memo: 'Mission', createdAt: new Date().toISOString() });
  await other.save(latest);
  release();
  await writing;
  const saved = await other.load();
  assert.equal(saved.profile.displayName, 'Concurrent update');
  assert.equal(saved.transactions.find((tx) => tx.id === 'concurrent-mission')?.amount, 2490);
  assert.equal(saved.transactions.find((tx) => tx.kind === 'notebook_reward')?.amount, 10);
});

test('concurrent mission and Notebook reward evaluation share the same 2500 ceiling', async () => {
  storage.clear();
  const repo = new LocalDemoRepository();
  const data = fixture();
  data.transactions.push({ id: 'prior', walletId: 'wallet-demo', userId: 'demo-user', kind: 'mission_reward', amount: 2480, dayKey: new Date().toISOString().slice(0, 10), memo: '', createdAt: new Date().toISOString() });
  await repo.replaceAll(data);
  await Promise.all([
    repo.mutateNotebook(source()),
    repo.completeMission({ missionId: 'mission-seed-3', method: 'self' }),
  ]);
  const saved = await repo.load();
  assert.equal(saved.transactions.reduce((sum, tx) => sum + tx.amount, 0), 2500);
  assert.equal(saved.notebook!.entries.length, 1);
  assert.equal(saved.completions.length, 1);
});

test('failed storage saves reject, do not push cloud or claim rewards, and queue recovers', async () => {
  storage.clear();
  const repo = new LocalDemoRepository();
  await repo.replaceAll(fixture());
  const before = storage.getItem('one_decision_away_app_data_v1');
  const schedulePush = cloudSync.schedulePush;
  let pushes = 0;
  cloudSync.schedulePush = () => { pushes += 1; };
  try {
    storage.failWrites = true;
    await assert.rejects(repo.mutateNotebook(source()), /could not be saved/);
    assert.equal(pushes, 0);
    assert.equal(storage.getItem('one_decision_away_app_data_v1'), before);
    storage.failWrites = false;
    await repo.mutateNotebook(source());
    assert.equal(pushes, 1);
    const saved = await repo.load();
    assert.equal(saved.notebook!.entries.length, 1);
    assert.equal(saved.transactions[0].amount, 25);
  } finally {
    storage.failWrites = false;
    cloudSync.schedulePush = schedulePush;
  }
});

test('unreadable saved JSON is preserved, never silently replaced with seed data', async () => {
  storage.clear();
  storage.setItem('one_decision_away_app_data_v1', '{broken');
  await assert.rejects(new LocalDemoRepository().load(), /not replaced/);
  assert.equal(storage.getItem('one_decision_away_app_data_v1'), '{broken');
});

test('explicit local restore blocks older cloud data across failed uploads and is account/project scoped', async () => {
  storage.clear();
  const internal = cloudSync as any;
  const original = { client: internal.client, session: internal.session, config: internal.config };
  let failUpload = true;
  let remoteReads = 0;
  let uploaded: UserData | undefined;
  const remote = fixture();
  remote.profile.displayName = 'Old cloud copy';
  const restored = applyNotebookAction(fixture(), source(), noon('2026-09-19')).data;
  const mockClient = { from: () => ({
    upsert: async (row: { data: UserData }) => {
      if (failUpload) return { error: new Error('offline') };
      uploaded = structuredClone(row.data);
      return { error: null };
    },
    select: () => ({ eq: () => ({ maybeSingle: async () => { remoteReads += 1; return { data: { data: remote, updated_at: '2028-01-01T00:00:00Z' }, error: null }; } }) }),
  }) };
  Object.assign(internal, { client: mockClient, session: { user: { id: 'account-a' } }, config: { url: 'https://project-a.example', anonKey: 'test' } });
  try {
    const repo = new LocalDemoRepository();
    await repo.replaceAll(restored);
    cloudSync.markLocalRestore();
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    assert.equal(await cloudSync.push(restored), false);
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    assert.equal(remoteReads, 0);
    assert.deepEqual((await repo.load()).notebook, restored.notebook);
    // A restore for account A never suppresses account B's normal cloud policy.
    internal.session = { user: { id: 'account-b' } };
    assert.equal((await cloudSync.pullIfNewer(restored))?.profile.displayName, 'Old cloud copy');
    internal.session = { user: { id: 'account-a' } };
    assert.equal(await cloudSync.pullIfNewer(restored), null);
    internal.config = { url: 'https://project-b.example', anonKey: 'test' };
    assert.equal((await cloudSync.pullIfNewer(null))?.profile.displayName, 'Old cloud copy');
    internal.config = { url: 'https://project-a.example', anonKey: 'test' };
    failUpload = false;
    assert.equal(await cloudSync.push(restored), true);
    assert.deepEqual(uploaded?.notebook, restored.notebook);
    assert.deepEqual(uploaded?.dreamJournal, restored.dreamJournal);
    assert.equal([...storage.values.keys()].filter((key) => key.startsWith('oda_cloud_pending_restore')).length, 0);
  } finally { Object.assign(internal, original); }
});

test('an old in-flight cloud upload cannot overwrite a newer restored snapshot or clear its marker', async () => {
  storage.clear();
  const internal = cloudSync as any;
  const original = { client: internal.client, session: internal.session, config: internal.config };
  const old = fixture();
  const restored = applyNotebookAction(fixture(), source(), noon('2026-09-19')).data;
  let releaseOld!: () => void;
  let releaseNew!: () => void;
  let firstStarted!: () => void;
  let secondStarted!: () => void;
  const oldWait = new Promise<void>((resolve) => { releaseOld = resolve; });
  const newWait = new Promise<void>((resolve) => { releaseNew = resolve; });
  const first = new Promise<void>((resolve) => { firstStarted = resolve; });
  const second = new Promise<void>((resolve) => { secondStarted = resolve; });
  const uploads: UserData[] = [];
  const mockClient = { from: () => ({ upsert: async (row: { data: UserData }) => {
    const index = uploads.length;
    uploads.push(structuredClone(row.data));
    if (index === 0) { firstStarted(); await oldWait; } else { secondStarted(); await newWait; }
    return { error: null };
  } }) };
  Object.assign(internal, { client: mockClient, session: { user: { id: 'restore-account' } }, config: { url: 'https://project.example', anonKey: 'test' } });
  try {
    const pendingOld = cloudSync.push(old);
    await first;
    cloudSync.markLocalRestore();
    const pendingNew = cloudSync.push(restored);
    assert.equal(uploads.length, 1);
    releaseOld();
    await pendingOld;
    await second;
    assert.equal([...storage.values.keys()].filter((key) => key.startsWith('oda_cloud_pending_restore')).length, 1);
    assert.equal(await cloudSync.pullIfNewer(restored), null);
    releaseNew();
    assert.equal(await pendingNew, true);
    assert.deepEqual(uploads[uploads.length - 1].notebook, restored.notebook);
    assert.equal([...storage.values.keys()].filter((key) => key.startsWith('oda_cloud_pending_restore')).length, 0);
  } finally { releaseOld(); releaseNew(); Object.assign(internal, original); }
});

test('a signed-out import binds to the first later connection and stays isolated from other accounts', async () => {
  storage.clear();
  const internal = cloudSync as any;
  const original = { client: internal.client, session: internal.session, config: internal.config };
  const restored = applyNotebookAction(fixture(), source(), noon('2026-09-19')).data;
  const remote = fixture();
  remote.profile.displayName = 'Old cloud copy';
  let remoteReads = 0;
  let failUpload = true;
  let uploaded: UserData | undefined;
  const mockClient = { from: () => ({
    upsert: async (row: { data: UserData }) => {
      if (failUpload) return { error: new Error('offline') };
      uploaded = structuredClone(row.data);
      return { error: null };
    },
    select: () => ({ eq: () => ({ maybeSingle: async () => {
      remoteReads += 1;
      return { data: { data: remote, updated_at: '2028-01-01T00:00:00Z' }, error: null };
    } }) }),
  }) };
  Object.assign(internal, { client: null, session: null, config: null });
  try {
    const repo = new LocalDemoRepository();
    await repo.replaceAll(restored);
    cloudSync.markLocalRestore();
    const pendingToken = storage.getItem('oda_cloud_pending_restore:unbound');
    assert.ok(pendingToken);
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    Object.assign(internal, { client: mockClient, session: { user: { id: 'first-account' } }, config: { url: 'https://first-project.example', anonKey: 'test' } });
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    assert.equal(remoteReads, 0);
    assert.equal(storage.getItem('oda_cloud_pending_restore:unbound'), null);
    const boundKey = 'oda_cloud_pending_restore:https%3A%2F%2Ffirst-project.example:first-account';
    assert.equal(storage.getItem(boundKey), pendingToken);
    assert.equal(await cloudSync.push(restored), false);
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    internal.session = { user: { id: 'second-account' } };
    assert.equal((await cloudSync.pullIfNewer(null))?.profile.displayName, 'Old cloud copy');
    assert.equal(storage.getItem(boundKey), pendingToken);
    internal.session = { user: { id: 'first-account' } };
    assert.equal(await cloudSync.pullIfNewer(await repo.load()), null);
    failUpload = false;
    assert.equal(await cloudSync.push(restored), true);
    assert.deepEqual(uploaded?.notebook, restored.notebook);
    assert.equal(storage.getItem(boundKey), null);
    assert.deepEqual((await repo.load()).notebook, restored.notebook);
  } finally { Object.assign(internal, original); }
});
