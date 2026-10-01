import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { GeminiVoice } from '../src/utils/geminiVoice';
import { getLocale, setLocale } from '../src/i18n';

type Clip = { sampleRate: number; samples: Float32Array };
const clip = (): Clip => ({ sampleRate: 24_000, samples: new Float32Array([0.1]) });
const TEST_KEY = 'unit-test-only-not-a-provider-key';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

type FakeSource = {
  buffer: unknown;
  onended: (() => void) | null;
  starts: number;
  stops: number;
  connect: () => void;
  disconnect: () => void;
  start: () => void;
  stop: () => void;
};

function fixture(t: TestContext, options: {
  state?: AudioContextState;
  resumeWait?: Promise<void>;
  startError?: Error;
} = {}) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const originalLocale = getLocale();
  const sources: FakeSource[] = [];
  const contexts: FakeAudioContext[] = [];
  const resumeEntered = deferred<void>();

  class FakeAudioContext {
    state = options.state ?? 'running';
    destination = {};
    resumeCalls = 0;
    suspendCalls = 0;
    gain = { gain: { value: 1 }, connect: () => {} };

    constructor() { contexts.push(this); }
    createGain() { return this.gain; }
    createBuffer(_channels: number, _length: number, _rate: number) {
      return { copyToChannel: () => {} };
    }
    createBufferSource() {
      const source: FakeSource = {
        buffer: null, onended: null, starts: 0, stops: 0,
        connect: () => {}, disconnect: () => {},
        start: () => {
          if (options.startError) throw options.startError;
          source.starts++;
        },
        stop: () => { source.stops++; },
      };
      sources.push(source);
      return source;
    }
    async resume() {
      this.resumeCalls++;
      resumeEntered.resolve();
      if (options.resumeWait) await options.resumeWait;
      this.state = 'running';
    }
    async suspend() {
      this.suspendCalls++;
      this.state = 'suspended';
    }
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true, value: { AudioContext: FakeAudioContext },
  });
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: () => { throw new Error('Lifecycle tests must never call a provider.'); },
  });
  t.after(() => {
    setLocale(originalLocale);
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalFetch) Object.defineProperty(globalThis, 'fetch', originalFetch);
    else Reflect.deleteProperty(globalThis, 'fetch');
  });

  const voice = new GeminiVoice();
  // Substitute only synthesis. The real public playback, caching and lifecycle
  // methods run against the fake audio device; no SDK or credentials are used.
  const injectable = voice as unknown as {
    synthesize: (text: string, apiKey: string, voice: string) => Promise<Clip | null>;
  };
  injectable.synthesize = async () => clip();
  return {
    voice, sources, contexts, resumeEntered: resumeEntered.promise,
    synthesize: (fn: typeof injectable.synthesize) => { injectable.synthesize = fn; },
  };
}

test('Stop cancels a cue still waiting for synthesis without starting audio', async (t) => {
  const h = fixture(t);
  const pending = deferred<Clip | null>();
  const events: string[] = [];
  h.synthesize(() => pending.promise);
  const result = h.voice.speak('Pending cue', TEST_KEY, 'Kore', 1,
    () => events.push('start'), () => events.push('end'));
  h.voice.stop();
  pending.resolve(clip());

  assert.equal(await result, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.contexts.length, 0);
  assert.equal(h.voice.isPlaying(), false);
  assert.deepEqual(events, []);
});

test('a newer cue owns playback when an older synthesis resolves later', async (t) => {
  const h = fixture(t);
  const oldClip = deferred<Clip | null>();
  const events: string[] = [];
  h.synthesize(text => text === 'Old cue' ? oldClip.promise : Promise.resolve(clip()));
  const oldResult = h.voice.speak('Old cue', TEST_KEY, 'Kore', 1,
    () => events.push('old start'), () => events.push('old end'));

  assert.equal(await h.voice.speak('New cue', TEST_KEY, 'Kore', 1,
    () => events.push('new start'), () => events.push('new end')), true);
  oldClip.resolve(clip());

  assert.equal(await oldResult, false);
  assert.equal(h.sources.length, 1);
  assert.equal(h.sources[0].starts, 1);
  assert.equal(h.sources[0].stops, 0);
  assert.equal(h.voice.isPlaying(), true);
  assert.deepEqual(events, ['new start']);
});

test('Pause then Resume cannot resurrect a cue waiting for synthesis', async (t) => {
  const h = fixture(t);
  const pending = deferred<Clip | null>();
  h.synthesize(() => pending.promise);
  const result = h.voice.speak('Cancelled pending cue', TEST_KEY, 'Kore', 1);
  h.voice.pause();
  h.voice.resume();
  pending.resolve(clip());

  assert.equal(await result, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.voice.isPlaying(), false);
});

test('Stop also cancels a cue waiting for the audio context to resume', async (t) => {
  const resumeWait = deferred<void>();
  const h = fixture(t, { state: 'suspended', resumeWait: resumeWait.promise });
  const events: string[] = [];
  const result = h.voice.speak('Waiting for audio device', TEST_KEY, 'Kore', 1,
    () => events.push('start'), () => events.push('end'));
  await h.resumeEntered;
  h.voice.stop();
  resumeWait.resolve();

  assert.equal(await result, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.voice.isPlaying(), false);
  assert.deepEqual(events, []);
});

test('a new cue supersedes one waiting for the audio context to resume', async (t) => {
  const resumeWait = deferred<void>();
  const h = fixture(t, { state: 'suspended', resumeWait: resumeWait.promise });
  const events: string[] = [];
  const oldResult = h.voice.speak('Old waiting cue', TEST_KEY, 'Kore', 1,
    () => events.push('old start'), () => events.push('old end'));
  await h.resumeEntered;
  const newResult = h.voice.speak('New session cue', TEST_KEY, 'Kore', 1,
    () => events.push('new start'), () => events.push('new end'));
  resumeWait.resolve();

  assert.deepEqual(await Promise.all([oldResult, newResult]), [false, true]);
  assert.equal(h.sources.length, 1);
  assert.equal(h.sources[0].starts, 1);
  assert.deepEqual(events, ['new start']);
});

test('Pause and Resume invalidate pending context-resume playback', async (t) => {
  const resumeWait = deferred<void>();
  const h = fixture(t, { state: 'suspended', resumeWait: resumeWait.promise });
  const result = h.voice.speak('Cue before pause', TEST_KEY, 'Kore', 1);
  await h.resumeEntered;
  h.voice.pause();
  h.voice.resume();
  resumeWait.resolve();

  assert.equal(await result, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.voice.isPlaying(), false);
});

test('replacement immediately stops active audio while the new clip is pending', async (t) => {
  const h = fixture(t);
  const nextClip = deferred<Clip | null>();
  h.synthesize(text => text === 'Next cue' ? nextClip.promise : Promise.resolve(clip()));
  assert.equal(await h.voice.speak('Playing cue', TEST_KEY, 'Kore', 1), true);
  const playing = h.sources[0];

  const result = h.voice.speak('Next cue', TEST_KEY, 'Kore', 1);
  assert.equal(playing.stops, 1);
  assert.equal(h.voice.isPlaying(), false);
  nextClip.resolve(clip());

  assert.equal(await result, true);
  assert.equal(h.sources.length, 2);
  assert.equal(h.sources[1].starts, 1);
  assert.equal(h.voice.isPlaying(), true);
});

test('stale source completion cannot clear or end the new cue', async (t) => {
  const h = fixture(t);
  const events: string[] = [];
  assert.equal(await h.voice.speak('First cue', TEST_KEY, 'Kore', 1,
    () => events.push('first start'), () => events.push('first end')), true);
  const staleEnded = h.sources[0].onended;
  assert.ok(staleEnded);
  assert.equal(await h.voice.speak('Second cue', TEST_KEY, 'Kore', 1,
    () => events.push('second start'), () => events.push('second end')), true);

  staleEnded();
  assert.equal(h.voice.isPlaying(), true);
  assert.deepEqual(events, ['first start', 'second start']);

  const currentEnded = h.sources[1].onended;
  assert.ok(currentEnded);
  currentEnded();
  currentEnded();
  assert.equal(h.voice.isPlaying(), false);
  assert.deepEqual(events, ['first start', 'second start', 'second end']);
});

test('Pause and Resume preserve an already-started cue without starting it twice', async (t) => {
  const h = fixture(t);
  const events: string[] = [];
  assert.equal(await h.voice.speak('Active cue', TEST_KEY, 'Kore', 1,
    () => events.push('start'), () => events.push('end')), true);
  h.voice.pause();
  assert.equal(h.contexts[0].state, 'suspended');
  assert.equal(h.sources[0].stops, 0);
  h.voice.resume();
  await Promise.resolve();

  assert.equal(h.contexts[0].state, 'running');
  assert.equal(h.sources.length, 1);
  assert.equal(h.sources[0].starts, 1);
  assert.equal(h.voice.isPlaying(), true);
  assert.deepEqual(events, ['start']);
});

test('unavailable synthesis reports failure without creating an audio source', async (t) => {
  const h = fixture(t);
  const events: string[] = [];
  h.synthesize(async () => null);

  assert.equal(await h.voice.speak('Unavailable clip', TEST_KEY, 'Kore', 1,
    () => events.push('start'), () => events.push('end')), false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.voice.isPlaying(), false);
  assert.deepEqual(events, []);
});

test('a failed audio context resume reports failure without starting playback', async (t) => {
  const resumeWait = deferred<void>();
  const h = fixture(t, { state: 'suspended', resumeWait: resumeWait.promise });
  const result = h.voice.speak('Audio unavailable', TEST_KEY, 'Kore', 1);
  await h.resumeEntered;
  resumeWait.reject(new Error('Synthetic device resume failure'));

  assert.equal(await result, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.voice.isPlaying(), false);
});

test('a failed source start reports failure and never announces playback', async (t) => {
  const h = fixture(t, { startError: new Error('Synthetic device start failure') });
  const events: string[] = [];

  assert.equal(await h.voice.speak('Cannot start', TEST_KEY, 'Kore', 1,
    () => events.push('start'), () => events.push('end')), false);
  assert.equal(h.sources[0].starts, 0);
  assert.equal(h.voice.isPlaying(), false);
  assert.deepEqual(events, []);
});

test('English narration cache stays the same when UI locale changes', async (t) => {
  const h = fixture(t);
  const synthesized: string[] = [];
  h.synthesize(async text => { synthesized.push(text); return clip(); });
  const englishText = 'Take a slow breath, and return to this moment.';
  setLocale('en');
  h.voice.prefetch([englishText], TEST_KEY, 'Kore');
  setLocale('tr');
  assert.equal(await h.voice.speak(englishText, TEST_KEY, 'Kore', 1), true);
  setLocale('es');
  assert.equal(await h.voice.speak(englishText, TEST_KEY, 'Kore', 1), true);

  assert.deepEqual(synthesized, [englishText]);
  assert.equal(h.sources.length, 2);
  assert.ok(h.sources.every(source => source.starts === 1));
});

test('a Settings preview resolving after Stop cannot start playback', async (t) => {
  const h = fixture(t);
  const pendingPreview = deferred<Clip | null>();
  h.synthesize(() => pendingPreview.promise);
  const previewResult = h.voice.test(TEST_KEY, 'Kore');
  h.voice.stop();
  pendingPreview.resolve(clip());

  assert.equal(await previewResult, false);
  assert.equal(h.sources.length, 0);
  assert.equal(h.contexts.length, 0);
  assert.equal(h.voice.isPlaying(), false);
});

test('a Settings preview resolving after a newer cue cannot interrupt it', async (t) => {
  const h = fixture(t);
  const pendingPreview = deferred<Clip | null>();
  const events: string[] = [];
  h.synthesize(text => text === 'New normal cue'
    ? Promise.resolve(clip()) : pendingPreview.promise);
  const previewResult = h.voice.test(TEST_KEY, 'Kore');
  assert.equal(await h.voice.speak('New normal cue', TEST_KEY, 'Kore', 1,
    () => events.push('new start'), () => events.push('new end')), true);
  const playing = h.sources[0];
  pendingPreview.resolve(clip());

  assert.equal(await previewResult, false);
  assert.equal(h.sources.length, 1);
  assert.equal(playing.starts, 1);
  assert.equal(playing.stops, 0);
  assert.equal(h.voice.isPlaying(), true);
  assert.deepEqual(events, ['new start']);
});
