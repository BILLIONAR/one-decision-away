import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { soundRoomPlayer as player, type SoundRoomPlayOptions as Options } from '../src/services/soundRoomPlayer';
import { purchases, type PurchasesState } from '../src/services/purchases';
import { soundSynthesizer } from '../src/utils/soundSynthesizer';
import { SOUND_ROOM_SECTIONS } from '../src/data/soundRoom';
import { soundSynthesizerFixture } from './helpers/soundSynthesizerFixture';

// This fixture only changes in-memory state. No initialization or native SDK runs.
const patchPurchases = (patch: Partial<PurchasesState>) =>
  (purchases as unknown as { set(patch: Partial<PurchasesState>): void }).set(patch);
let revision = 100;

function fixture(t: TestContext, initial: Partial<PurchasesState> = {}) {
  const original = purchases.getState();
  soundSynthesizer.stopAmbient();
  // Each fake context belongs to this test's clock; the production singleton stays intact.
  Object.assign(soundSynthesizer, { ctx: null, userGainNode: null });
  const f = soundSynthesizerFixture(t);
  patchPurchases({ available: true, ready: true, identityConfirmed: true, identityRevision: ++revision,
    tier: 'essentials', isPro: false, ...initial });
  player.setTimer(null);
  soundSynthesizer.setMuted(false);
  soundSynthesizer.setVolume(0.5);
  t.mock.method(purchases, 'init', async () => { throw new Error('No provider initialization allowed'); });
  t.after(() => patchPurchases(original));
  return { ...f, emit: patchPurchases };
}

const bowls: Options = { sectionId: 'relax', indexInCategory: 3 };
const sleepBrown: Options = { sectionId: 'sleep', indexInCategory: 2, sleep: true };
function assertRevoked() {
  const s = player.getSnapshot();
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), false);
  assert.equal(s.track, null);
  assert.equal(s.playing, false);
  assert.equal(s.sleep, false);
  assert.equal(s.endsAt, null);
  assert.equal(s.pausedRemainingMs, null);
}

test('native free direct starts and toggles cannot start an all-paid track', t => {
  fixture(t, { tier: 'free' });
  player.play('tibetan_bowls', bowls);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
  assert.equal(player.play('tibetan_bowls'), false);
  assert.equal(player.toggle('tibetan_bowls', bowls), false);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
});

for (const phase of ['playing', 'paused', 'expired'] as const) test(`downgrade hard-stops owned restricted ${phase} selection without page subscribers`, t => {
  const f = fixture(t);
  player.setTimer(10);
  player.play('brown_noise', sleepBrown);
  const ctx = f.contexts[0];
  if (phase === 'paused') { f.advance(10); player.pause(); }
  if (phase === 'expired') f.advance(600.1);
  f.emit({ tier: 'free' });
  assertRevoked();
  assert.equal(player.getSnapshot().timerMinutes, 10, 'timer preference survives revocation');
  assert.equal(f.timers.size, 0, 'all owned engine callbacks and fades are removed');
  assert.ok(ctx.sources.every(source => source.disconnected && source.stops.length > 0));
  assert.equal(player.resume(), false);
  f.advance(1000);
  assertRevoked();
});

for (const change of [{ identityConfirmed: false }, { identityRevision: 999_999 }] as const)
  for (const phase of ['playing', 'paused', 'expired'] as const)
  test(`owned paid ${phase} selection revokes on ${Object.keys(change)[0]} even with a paid cached tier`, t => {
    const f = fixture(t);
    player.setTimer(10);
    player.play('tibetan_bowls', bowls);
    if (phase === 'paused') { f.advance(10); player.pause(); }
    if (phase === 'expired') f.advance(600.1);
    f.emit(change);
    assertRevoked();
    f.emit({ ready: true, identityConfirmed: true, tier: 'coach' });
    assertRevoked();
    assert.equal(player.resume(), false, 'restored access does not restore cleared selection');
    assert.equal(player.play('tibetan_bowls', bowls), true, 'a new explicit tap can use new access');
  });

test('same-account confirmed paid access survives offerings loading or failed offline refresh', t => {
  const f = fixture(t);
  player.play('tibetan_bowls', bowls);
  f.emit({ ready: false });
  assert.equal(soundSynthesizer.getCurrentTrack(), 'tibetan_bowls');
  player.pause(); assert.equal(player.resume(), true);
  f.emit({ ready: true, error: 'unavailable' });
  assert.equal(soundSynthesizer.getCurrentTrack(), 'tibetan_bowls');
  assert.equal(player.play('tibetan_bowls', bowls), true);
});

test('admission reads current purchase state even if a notification has not been emitted', t => {
  fixture(t);
  const stalePlay = player.play.bind(player);
  const current = purchases.getState();
  t.mock.method(purchases, 'getState', () => ({ ...current, tier: 'free' }));
  stalePlay('tibetan_bowls', bowls);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
});

test('live resume and timer change reconcile access even without a purchase notification', t => {
  fixture(t);
  player.play('tibetan_bowls', bowls);
  player.pause();
  const current = purchases.getState();
  t.mock.method(purchases, 'getState', () => ({ ...current, tier: 'free' }));
  player.resume();
  assertRevoked();
  player.setTimer(60);
  assertRevoked();
});

for (const options of [
  { sectionId: 'relax' }, { indexInCategory: 3 },
  { sectionId: 'focus', indexInCategory: 0 }, { sectionId: 'relax', indexInCategory: -1 },
  { sectionId: 'relax', indexInCategory: 0.5 }, { sectionId: 'relax', indexInCategory: 99 },
] as Options[]) test(`invalid or mismatched provenance rejects ${JSON.stringify(options)} without replacing audio`, t => {
  fixture(t);
  soundSynthesizer.playAmbient('waves');
  player.play('tibetan_bowls', options);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'waves');
  assert.equal(player.play('tibetan_bowls', options), false);
});

for (const tier of ['essentials', 'pro', 'coach'] as const) test(`${tier} admits all catalog origins and preserves the timer and user volume`, t => {
  const f = fixture(t, { tier });
  player.setTimer(10); player.setVolume(0.7);
  for (const section of SOUND_ROOM_SECTIONS) section.sounds.forEach((sound, index) => {
    assert.equal(player.play(sound.track, { sectionId: section.id, indexInCategory: index, sleep: section.id === 'sleep' }), true);
    assert.equal(soundSynthesizer.getCurrentTrack(), sound.track);
    assert.equal(player.getSnapshot().endsAt, Date.now() + 600_000);
  });
  assert.equal(player.getVolume(), 0.7);
  player.setVolume(0); assert.equal(player.getVolume(), 0);
  f.advance(600.1);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
});

test('each category first two entries remain free, including duplicate 432 and brown-noise origins', t => {
  const f = fixture(t, { tier: 'free', identityConfirmed: false, ready: false });
  for (const section of SOUND_ROOM_SECTIONS) section.sounds.slice(0, 2).forEach((sound, index) => {
    assert.equal(player.play(sound.track, { sectionId: section.id, indexInCategory: index }), true);
    assert.equal(soundSynthesizer.getCurrentTrack(), sound.track);
  });
  for (const section of SOUND_ROOM_SECTIONS) section.sounds.slice(2).forEach((sound, index) => {
    assert.equal(player.play(sound.track, { sectionId: section.id, indexInCategory: index + 2 }), false);
    assert.equal(player.toggle(sound.track, { sectionId: section.id, indexInCategory: index + 2 }), false);
  });
  player.play('brown_noise', { sectionId: 'focus', indexInCategory: 0 });
  f.emit({ identityRevision: 888_888 });
  assert.equal(player.getSnapshot().playing, true);
  player.pause();
  assert.equal(player.resume(), true);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'brown_noise');
  assert.equal(player.play('brown_noise', sleepBrown), false);
  assert.equal(player.play('meditation_432hz', { sectionId: 'relax', indexInCategory: 2 }), false);
});

test('omitted-origin admission allows any-free aliases and denies exclusively paid tracks', t => {
  fixture(t, { tier: 'free' });
  for (const track of ['brown_noise', 'meditation_432hz', 'solfeggio_528hz', 'breath_pacer'] as const)
    assert.equal(player.play(track), true);
  for (const track of ['tibetan_bowls', 'rain', 'fireplace', 'theta_meditation'] as const) {
    assert.equal(player.play(track), false);
    assert.equal(soundSynthesizer.getCurrentTrack(), 'breath_pacer');
  }
});

for (const available of [false]) test('web and unconfigured purchases keep paid sounds open through identity transitions', t => {
  const f = fixture(t, { available, ready: false, identityConfirmed: false, tier: 'free' });
  assert.equal(player.play('tibetan_bowls', bowls), true);
  f.emit({ identityRevision: 777_777, identityConfirmed: false });
  assert.equal(soundSynthesizer.getCurrentTrack(), 'tibetan_bowls');
  player.pause(); assert.equal(player.resume(), true);
});

for (const track of ['tibetan_bowls', 'waves'] as const) test(`external Focus ${track} replacement survives Sound Room downgrade`, t => {
  const f = fixture(t);
  player.setTimer(10); player.play('tibetan_bowls', { ...bowls, sleep: true });
  soundSynthesizer.playAmbient(track);
  f.emit({ tier: 'free', identityConfirmed: false, identityRevision: 666_666 });
  assert.equal(soundSynthesizer.getCurrentTrack(), track);
  const s = player.getSnapshot();
  assert.equal(s.track, track); assert.equal(s.playing, true);
  assert.equal(s.timerMinutes, null); assert.equal(s.endsAt, null);
  assert.equal(s.pausedRemainingMs, null); assert.equal(s.sleep, false);
  f.advance(700); assert.equal(soundSynthesizer.getCurrentTrack(), track);
  player.pause();
  assert.equal(player.resume(), track === 'waves', 'external replay gets fresh conservative admission');
});

test('purchase event during an engine start cannot publish a revoked playing selection', t => {
  const f = fixture(t);
  let switched = false;
  const remove = soundSynthesizer.subscribe(() => {
    if (!switched && soundSynthesizer.getCurrentTrack() === 'tibetan_bowls') {
      switched = true; f.emit({ tier: 'free' });
    }
  });
  t.after(remove);
  player.play('tibetan_bowls', bowls);
  assertRevoked();
});

test('purchase event during player publication cannot re-arm the revoked timer', t => {
  const f = fixture(t);
  player.setTimer(10);
  let switched = false;
  const remove = player.subscribe(() => {
    if (!switched && player.getSnapshot().playing) {
      switched = true; f.emit({ tier: 'free' });
    }
  });
  t.after(remove);
  assert.equal(player.play('tibetan_bowls', bowls), false);
  assertRevoked();
  assert.equal(f.timers.size, 0);
});

for (const track of ['waves', 'tibetan_bowls'] as const) test(`external ${track} replacement during player publication retains its untimed graph`, t => {
  const f = fixture(t);
  player.setTimer(10);
  let replaced = false;
  const remove = player.subscribe(() => {
    if (!replaced && player.getSnapshot().playing) {
      replaced = true; soundSynthesizer.playAmbient(track);
    }
  });
  t.after(remove);
  assert.equal(player.play('tibetan_bowls', bowls), false);
  assert.equal(soundSynthesizer.getCurrentTrack(), track);
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), false);
  assert.equal(player.getSnapshot().endsAt, null);
  f.advance(700); assert.equal(soundSynthesizer.getCurrentTrack(), track);
});

test('an unavailable AudioContext rejects the actual engine start without claiming playback', t => {
  fixture(t, { available: false });
  Object.defineProperty(window, 'AudioContext', { value: undefined, configurable: true });
  assert.equal(player.play('waves'), false);
  assert.equal(player.getSnapshot().playing, false);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
});

for (const failure of ['buffer allocation', 'no replacement'] as const) test(`failed ${failure} retains entitlement ownership of the existing paid graph`, t => {
  const f = fixture(t);
  player.play('tibetan_bowls', bowls);
  if (failure === 'buffer allocation') t.mock.method(f.contexts[0], 'createBuffer', () => { throw new Error('synthetic allocation failure'); });
  else t.mock.method(soundSynthesizer, 'playAmbient', () => {});
  assert.equal(player.play('waves', { sectionId: 'relax', indexInCategory: 1 }), false);
  assert.equal(soundSynthesizer.getCurrentTrack(), 'tibetan_bowls');
  assert.equal(player.getSnapshot().track, 'tibetan_bowls');
  f.emit({ tier: 'free' });
  assertRevoked();
});

test('same-track no-op cannot take revocation ownership of an external Focus graph', t => {
  const f = fixture(t);
  soundSynthesizer.playAmbient('tibetan_bowls');
  t.mock.method(soundSynthesizer, 'playAmbient', () => {});
  assert.equal(player.play('tibetan_bowls', bowls), false);
  f.emit({ tier: 'free' });
  assert.equal(soundSynthesizer.getCurrentTrack(), 'tibetan_bowls');
  assert.equal(player.getSnapshot().playing, true);
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), false);
});

for (const action of ['pause', 'setTimer'] as const)
  for (const track of ['tibetan_bowls', 'waves'] as const)
  for (const initialOwner of ['SoundRoom', 'Focus'] as const)
    test(`${action} publication from ${initialOwner} cannot fade or time the reentrant external ${track} graph`, t => {
      const f = fixture(t);
      if (initialOwner === 'SoundRoom') player.play('tibetan_bowls', bowls);
      else soundSynthesizer.playAmbient('tibetan_bowls');
      let replaced = false;
      const remove = player.subscribe(() => {
        if (!replaced && (action === 'pause' ? !player.getSnapshot().playing : player.getSnapshot().timerMinutes === 20)) {
          replaced = true; soundSynthesizer.playAmbient(track);
        }
      });
      t.after(remove);
      if (action === 'pause') player.pause(); else player.setTimer(20);
      assert.equal(soundSynthesizer.getCurrentTrack(), track);
      assert.equal(soundSynthesizer.hasFadeOutScheduled(), false);
      assert.equal(player.getSnapshot().playing, true);
      assert.equal(player.getSnapshot().timerMinutes, null);
      assert.equal(player.getSnapshot().endsAt, null);
      f.advance(1200.1);
      assert.equal(soundSynthesizer.getCurrentTrack(), track);
    });

test('ordinary PlayerBar timer and pause controls still act on the current external Focus graph', t => {
  const f = fixture(t, { tier: 'free' });
  soundSynthesizer.playAmbient('waves');
  player.setTimer(20);
  assert.equal(player.getSnapshot().endsAt, Date.now() + 1_200_000);
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), true);
  f.advance(10); player.pause();
  assert.equal(player.getSnapshot().playing, false);
  assert.equal(player.getSnapshot().pausedRemainingMs, 1_190_000);
  f.advance(0.7); assert.equal(soundSynthesizer.getCurrentTrack(), 'silence');
  assert.equal(player.resume(), true);
  assert.equal(player.getSnapshot().endsAt, Date.now() + 1_190_000);
});

test('silence or an absent audio context cannot publish a playing selection', t => {
  fixture(t, { available: false });
  assert.equal(player.play('silence'), false);
  assert.equal(player.getSnapshot().playing, false);
  t.mock.method(soundSynthesizer, 'playAmbient', () => {});
  assert.equal(player.play('waves'), false);
  assert.equal(player.getSnapshot().playing, false);
});
