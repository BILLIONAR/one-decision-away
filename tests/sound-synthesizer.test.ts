import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { SoundSynthesizer, soundSynthesizer, AMBIENT_SWITCH_SECONDS } from '../src/utils/soundSynthesizer';
import { soundRoomPlayer } from '../src/services/soundRoomPlayer';

type Automation = { type: 'set' | 'linear' | 'target'; time: number; value: number; constant?: number };
function fixture(t: TestContext) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const contexts: FakeContext[] = [];
  const timers = new Map<number, { callback: () => void; at: number; interval?: number }>();
  const engines: SoundSynthesizer[] = [];
  let timeMs = 0, timerId = 0;
  t.mock.method(Date, 'now', () => 1_700_000_000_000 + timeMs);
  t.mock.method(globalThis, 'clearTimeout', (id: number) => { timers.delete(Number(id)); });
  t.mock.method(globalThis, 'clearInterval', (id: number) => { timers.delete(Number(id)); });

  class FakeParam {
    events: Automation[] = [];
    constructor(private ctx: FakeContext) {}
    get value() { return this.at(this.ctx.currentTime); }
    at(time: number) {
      let value = 1, cursor = 0, previous: Automation | undefined;
      for (const event of this.events) {
        if (event.time > time) {
          if (event.type === 'linear') return value + (event.value - value) * Math.max(0, time - cursor) / (event.time - cursor);
          return previous?.type === 'target' ? previous.value + (value - previous.value) * Math.exp(-(time - cursor) / previous.constant!) : value;
        }
        if (previous?.type === 'target') value = previous.value + (value - previous.value) * Math.exp(-(event.time - cursor) / previous.constant!);
        if (event.type !== 'target') value = event.value;
        cursor = event.time; previous = event;
      }
      return previous?.type === 'target' ? previous.value + (value - previous.value) * Math.exp(-(time - cursor) / previous.constant!) : value;
    }
    setValueAtTime(value: number, time: number) { this.events.push({ type: 'set', value, time }); this.events.sort((a,b) => a.time - b.time); }
    linearRampToValueAtTime(value: number, time: number) { this.events.push({ type: 'linear', value, time }); this.events.sort((a,b) => a.time - b.time); }
    exponentialRampToValueAtTime(value: number, time: number) { this.linearRampToValueAtTime(value, time); }
    setTargetAtTime(value: number, time: number, constant: number) { this.events.push({ type: 'target', value, time, constant }); this.events.sort((a,b) => a.time - b.time); }
    cancelScheduledValues(time: number) { this.events = this.events.filter(event => event.time < time); }
    cancelAndHoldAtTime(time: number) { const value = this.at(time); this.cancelScheduledValues(time); this.setValueAtTime(value, time); }
  }
  class FakeNode {
    connections: unknown[] = [];
    disconnected = false;
    gain: FakeParam;
    frequency: FakeParam;
    Q: FakeParam;
    type = 'sine';
    buffer: { numberOfChannels: number; length: number } | null = null;
    loop = false;
    starts = 0;
    stops: (number | undefined)[] = [];
    onended: (() => void) | null = null;
    private endTimer: number | null = null;
    constructor(private ctx: FakeContext) { this.gain = new FakeParam(ctx); this.frequency = new FakeParam(ctx); this.Q = new FakeParam(ctx); }
    connect(destination: unknown) { this.connections.push(destination); }
    disconnect() { this.disconnected = true; this.connections = []; }
    start() { this.starts++; }
    stop(time?: number) {
      this.stops.push(time);
      if (this.endTimer !== null) timers.delete(this.endTimer);
      this.endTimer = null;
      if (time !== undefined && time > this.ctx.currentTime) {
        const id = ++timerId;
        this.endTimer = id;
        timers.set(id, { at: time * 1000, callback: () => { this.endTimer = null; this.onended?.(); } });
      } else this.onended?.();
    }
  }
  class FakeContext {
    state = 'running';
    currentTime = 0;
    sampleRate = 8000;
    destination = {};
    gains: FakeNode[] = [];
    sources: FakeNode[] = [];
    nodes: FakeNode[] = [];
    constructor() { contexts.push(this); }
    createNode() { const node = new FakeNode(this); this.nodes.push(node); return node; }
    createGain() { const node = this.createNode(); this.gains.push(node); return node; }
    createBufferSource() { const node = this.createNode(); this.sources.push(node); return node; }
    createOscillator() { return this.createBufferSource(); }
    createBiquadFilter() { return this.createNode(); }
    createChannelMerger() { return this.createNode(); }
    createBuffer(numberOfChannels: number, length: number) {
      const channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
      return { numberOfChannels, length, getChannelData: (channel: number) => channels[channel] };
    }
    async resume() { this.state = 'running'; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    AudioContext: FakeContext,
    setTimeout: (callback: () => void, delay: number) => { const id = ++timerId; timers.set(id, { callback, at: timeMs + delay }); return id; },
    setInterval: (callback: () => void, delay: number) => { const id = ++timerId; timers.set(id, { callback, at: timeMs + delay, interval: delay }); return id; },
  }});
  function advance(seconds: number) {
    const end = timeMs + seconds * 1000;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a,b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      timeMs = timer.at; contexts.forEach(ctx => { ctx.currentTime = timeMs / 1000; });
      if (timer.interval) timer.at += timer.interval; else timers.delete(id);
      timer.callback();
    }
    timeMs = end; contexts.forEach(ctx => { ctx.currentTime = timeMs / 1000; });
  }
  t.after(() => {
    engines.forEach(engine => engine.stopAmbient());
    soundSynthesizer.stopAmbient();
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window');
  });
  return { contexts, timers, advance, engine: () => { const engine = new SoundSynthesizer(); engines.push(engine); return engine; } };
}

test('arming a timer retains the independent three-second attack and actual stereo loop', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('rain', { fadeInSeconds: 3 });
  const ctx = f.contexts[0], attack = ctx.gains[1].gain, envelope = ctx.gains[2].gain;
  const attackEvents = JSON.stringify(attack.events);
  engine.fadeOutAndStop(60, 540);
  assert.equal(JSON.stringify(attack.events), attackEvents);
  f.advance(1.5);
  assert.ok(Math.abs(attack.value - 0.5) < 0.001);
  assert.equal(envelope.value, 1);
  assert.equal(ctx.sources[0].buffer!.numberOfChannels, 2);
  assert.equal(ctx.sources[0].buffer!.length, 8000 * 24);
  assert.equal(ctx.sources[0].loop, true);
  f.advance(539.5);
  assert.ok(envelope.value < 1 && envelope.value > 0.9);
  f.advance(59.1);
  assert.equal(engine.getCurrentTrack(), 'silence');
  assert.ok(ctx.sources[0].disconnected);
});

for (const [phase, seconds] of [['beginning', 2], ['middle', 3], ['end', 3.99]] as const) test(`mute and volume respond immediately at the ${phase} of a timer fade`, t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('brown_noise'); engine.fadeOutAndStop(2, 2);
  f.advance(seconds);
  const ctx = f.contexts[0], user = ctx.gains[0].gain, envelope = ctx.gains[2].gain;
  const envelopeEvents = JSON.stringify(envelope.events);
  engine.setVolume(0); assert.equal(user.value, 0);
  engine.setVolume(0.7); engine.setMuted(true); assert.equal(user.value, 0);
  assert.equal(engine.isSoundMuted(), true);
  engine.setMuted(false); assert.equal(engine.isSoundMuted(), false);
  assert.equal(JSON.stringify(envelope.events), envelopeEvents);
  assert.equal(engine.hasFadeOutScheduled(), true);
  f.advance(4.1 - seconds);
  assert.equal(engine.isPlaying(), false);
});

test('running fades can shorten but do not extend, and timer cancellation preserves user volume', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('rain'); engine.fadeOutAndStop(10);
  f.advance(5);
  const ctx = f.contexts[0], envelope = ctx.gains[2].gain;
  const original = JSON.stringify(envelope.events);
  engine.fadeOutAndStop(20);
  assert.equal(JSON.stringify(envelope.events), original);
  engine.fadeOutAndStop(1);
  assert.ok(Math.abs(envelope.value - 0.5) < 0.001);
  f.advance(0.5); assert.ok(Math.abs(envelope.value - 0.25) < 0.001);
  engine.setVolume(0); engine.cancelFadeOut(); f.advance(1);
  assert.equal(ctx.gains[0].gain.value, 0);
  assert.equal(engine.hasFadeOutScheduled(), false);
  assert.equal(engine.isPlaying(), true);
  assert.ok(envelope.value > 0.99);
});

test('shortening a running fade with a delay cannot restore a louder envelope', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('rain'); engine.fadeOutAndStop(10); f.advance(5);
  const envelope = f.contexts[0].gains[2].gain;
  engine.fadeOutAndStop(1, 1);
  f.advance(0.5); assert.ok(Math.abs(envelope.value - 0.5) < 0.001);
  f.advance(1); assert.ok(Math.abs(envelope.value - 0.25) < 0.001);
  f.advance(0.6); assert.equal(engine.isPlaying(), false);
});

test('browsers without cancelAndHold retain the current level when shortening a fade', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('rain'); engine.fadeOutAndStop(10); f.advance(5);
  const envelope = f.contexts[0].gains[2].gain;
  Object.defineProperty(envelope, 'cancelAndHoldAtTime', { value: undefined });
  engine.fadeOutAndStop(1);
  assert.ok(Math.abs(envelope.value - 0.5) < 0.001);
  f.advance(0.5); assert.ok(Math.abs(envelope.value - 0.25) < 0.001);
});

test('track switches release the previous graph and repeated switches/stops bound resources', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('rain'); const ctx = f.contexts[0], old = ctx.sources[0];
  engine.playAmbient('waves');
  assert.equal(engine.getCurrentTrack(), 'waves');
  assert.equal(old.stops.length, 0, 'old source overlaps during its release');
  assert.ok(ctx.gains[2].gain.events.some(event => event.type === 'linear' && event.value === 0 && event.time === AMBIENT_SWITCH_SECONDS));
  f.advance(0.23); assert.equal(old.stops.length, 1); assert.equal(old.disconnected, true);
  for (let i = 0; i < 8; i++) engine.playAmbient(i % 2 ? 'rain' : 'fireplace');
  assert.ok(f.timers.size <= 2, 'at most two retiring graphs');
  engine.stopAmbient(); engine.stopAmbient();
  assert.equal(engine.getCurrentTrack(), 'silence'); assert.equal(engine.getTrackStartedAt(), null);
  assert.equal(f.timers.size, 0);
  assert.ok(ctx.sources.every(source => source.disconnected && source.stops.length > 0));
  assert.equal(ctx.gains.filter(gain => !gain.disconnected).length, 1, 'only reusable user gain remains');
});

test('stop/restart of a tone cancels its initial bowl and recurring callbacks', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('meditation_432hz'); const ctx = f.contexts[0];
  engine.stopAmbient(); assert.equal(f.timers.size, 0);
  engine.playAmbient('meditation_432hz'); const before = ctx.sources.length;
  f.advance(0.3);
  assert.equal(ctx.sources.length - before, 5, 'one current initial bowl rather than the stopped session');
  engine.stopAmbient(); assert.equal(f.timers.size, 0);
  assert.ok(ctx.sources.every(source => source.disconnected && source.stops.includes(undefined)), 'current bowl tails stop with the ambient session');
});

test('natural bowl endings disconnect their tails while the current ambient drone continues', t => {
  const f = fixture(t), engine = f.engine();
  engine.playAmbient('meditation_432hz'); const ctx = f.contexts[0];
  f.advance(0.3);
  const bowls = ctx.sources.slice(-5), bowlGains = ctx.gains.slice(-5);
  assert.ok(bowls.every(source => !source.disconnected));
  f.advance(7.1);
  assert.ok(bowls.every(source => source.disconnected));
  assert.ok(bowlGains.every(gain => gain.disconnected));
  assert.equal(engine.getCurrentTrack(), 'meditation_432hz');
  assert.equal(f.timers.size, 1, 'only the next recurring bowl remains scheduled');
  engine.stopAmbient(); assert.equal(f.timers.size, 0);
});

test('Sound Room timer arming, pause/resume and expiry keep player state and start fade intact', t => {
  const f = fixture(t);
  soundRoomPlayer.setTimer(null);
  soundRoomPlayer.play('rain', { sleep: true });
  const ctx = f.contexts[0], attack = ctx.gains[1].gain;
  const original = JSON.stringify(attack.events);
  soundRoomPlayer.setTimer(10);
  assert.equal(JSON.stringify(attack.events), original);
  f.advance(10); soundRoomPlayer.pause();
  assert.equal(soundRoomPlayer.getSnapshot().pausedRemainingMs, 590_000);
  assert.equal(soundRoomPlayer.getSnapshot().playing, false);
  soundRoomPlayer.resume();
  assert.equal(soundRoomPlayer.getSnapshot().playing, true);
  assert.equal(soundRoomPlayer.getSnapshot().endsAt, Date.now() + 590_000);
  f.advance(590.1);
  assert.equal(soundRoomPlayer.getSnapshot().playing, false);
  assert.equal(soundRoomPlayer.getSnapshot().endsAt, null);
  soundRoomPlayer.setTimer(null);
});

test('external restart of the same track clears the Sound Room countdown and timer selection', t => {
  const f = fixture(t);
  soundRoomPlayer.setTimer(null);
  soundRoomPlayer.play('rain', { sleep: true });
  soundRoomPlayer.setTimer(10);
  assert.equal(soundRoomPlayer.getSnapshot().endsAt, Date.now() + 600_000);
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), true);
  f.advance(5);
  soundSynthesizer.playAmbient('rain'); // Focus starts a new Rain graph.
  const state = soundRoomPlayer.getSnapshot();
  assert.equal(state.track, 'rain'); assert.equal(state.playing, true);
  assert.equal(state.endsAt, null); assert.equal(state.timerMinutes, null);
  assert.equal(state.pausedRemainingMs, null); assert.equal(state.sleep, false);
  assert.equal(soundSynthesizer.hasFadeOutScheduled(), false);
  f.advance(600.2);
  assert.equal(soundRoomPlayer.getSnapshot().endsAt, null, 'no stale countdown survives its former deadline');
  assert.equal(soundRoomPlayer.getSnapshot().timerMinutes, null);
  assert.equal(soundSynthesizer.isPlaying(), true, 'the external controller owns the untimed session');
  soundSynthesizer.stopAmbient();
});
