import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { RecordedNarration, type RecordedCueAsset } from '../src/utils/recordedNarration';

const bytes = new Uint8Array([10, 20, 30, 40]);
const sha = (data: Uint8Array | string | ArrayBuffer) => createHash('sha256').update(typeof data === 'string' ? data : new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer)).digest('hex');
const asset = (cueIndex = 0, sessionId = 'session-a'): RecordedCueAsset => ({
  sessionId, cueIndex, text: `English cue ${cueIndex}`, file: `assets/oda/narration/en-US/v1/clips/${sessionId}-${cueIndex}.mp3`, bytes: 4,
  language: 'en-US', version: 'v1', checksum: sha(bytes), sourceTextHash: sha(`English cue ${cueIndex}`),
  decodedDurationSeconds: 9.5, containerDurationSeconds: 9.55, scheduledStartSeconds: cueIndex * 22, slotSeconds: 22,
});
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
const response = () => new Response(bytes.slice(), { headers: { 'Content-Type': 'audio/mpeg' } });
const context = (cueIndex = 0, sessionId = 'session-a', maxDurationSeconds = 22) => ({ cueIndex, sessionId, maxDurationSeconds });

function fixture(options: { fetch?: typeof fetch; state?: AudioContextState; resumeWait?: Promise<void>; decodedDuration?: number; cacheStorage?: CacheStorage | null } = {}) {
  let time = 0, requests = 0, decodeCount = 0;
  const sources: any[] = [];
  const audio = {
    state: options.state ?? 'running', currentTime: 0, destination: {},
    gain: { gain: { value: 1 }, connect() {} },
    createGain() { return this.gain; },
    async resume() { if (options.resumeWait) await options.resumeWait; this.state = 'running'; },
    async decodeAudioData() { decodeCount++; return { duration: options.decodedDuration ?? 9.5, numberOfChannels: 1 }; },
    createBufferSource() {
      const source = { buffer: null, onended: null as (() => void) | null, stops: 0, disconnects: 0, offset: -1, startedGain: -1,
        connect() {}, disconnect() { this.disconnects++; }, stop() { this.stops++; },
        start(_when: number, offset: number) { this.offset = offset; this.startedGain = audio.gain.gain.value; },
      };
      sources.push(source); return source;
    },
  };
  const assets = [asset(), asset(1), asset(2), asset(3), asset(0, 'session-b')];
  const player = new RecordedNarration(assets, {
    fetch: async (input, init) => { requests++; return options.fetch ? options.fetch(input, init) : response(); },
    cacheStorage: options.cacheStorage ?? null,
    createContext: () => audio as unknown as AudioContext,
    sha256: async data => sha(data), now: () => time,
  });
  const play = (index = 0, sessionId = 'session-a', maxDurationSeconds = 22, onStart = () => {}, onEnd = () => {}) =>
    player.speak(`English cue ${index}`, 1, onStart, onEnd, context(index, sessionId, maxDurationSeconds));
  return { player, assets, audio, sources, play, advance: (seconds: number) => { time += seconds * 1000; audio.currentTime += seconds; }, requests: () => requests, decodes: () => decodeCount };
}

test('construction does no fetch/decode; current/upcoming preload reuses the current request', async () => {
  const h = fixture();
  assert.equal(h.requests(), 0); assert.equal(h.decodes(), 0);
  h.player.prefetch(['English cue 0', 'English cue 1', 'English cue 2'], [context(), context(1), context(2)]);
  assert.equal(await h.play(), true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.requests(), 3);
  assert.equal(h.decodes(), 3);
  assert.equal(h.sources.length, 1);
});

test('Stop aborts loading and no late response starts a source', async () => {
  const pending = deferred<Response>(), entered = deferred<void>(); let signal: AbortSignal | null = null;
  const h = fixture({ fetch: async (_url, options) => { signal = options!.signal as AbortSignal; entered.resolve(); return pending.promise; } });
  const result = h.play(); await entered.promise;
  h.player.stop(); assert.equal(signal!.aborted, true); pending.resolve(response());
  assert.equal(await result, false); assert.equal(h.sources.length, 0);
});

test('Pause cancels original load; Resume retries current cue with a frozen slot and latest volume', async () => {
  const pending = deferred<Response>(), entered = deferred<void>(); let call = 0;
  const h = fixture({ fetch: async () => { if (++call === 1) { entered.resolve(); return pending.promise; } return response(); } });
  const old = h.play(); await entered.promise; h.advance(1); h.player.pause(); h.advance(50); h.player.setVolume(0.35);
  assert.equal(await h.player.resume(), true);
  pending.resolve(response()); assert.equal(await old, false);
  assert.equal(h.sources.length, 1); assert.equal(h.sources[0].startedGain, 0.35);
});

test('Pause→Stop discards current loading retry and Resume does not resurrect it', async () => {
  const pending = deferred<Response>(), entered = deferred<void>();
  const h = fixture({ fetch: async () => { entered.resolve(); return pending.promise; } });
  const old = h.play(); await entered.promise; h.player.pause(); h.player.stop(); await h.player.resume(); pending.resolve(response());
  assert.equal(await old, false); assert.equal(h.sources.length, 0);
});

test('new session cancels old load and only the new session owns audio', async () => {
  const pending = deferred<Response>(), entered = deferred<void>(); let calls = 0;
  const h = fixture({ fetch: async () => { if (++calls === 1) { entered.resolve(); return pending.promise; } return response(); } });
  const old = h.play(); await entered.promise;
  assert.equal(await h.play(0, 'session-b'), true); pending.resolve(response());
  assert.equal(await old, false); assert.equal(h.sources.length, 1);
});

test('active pause/resume continues the same cue offset without repeating its start or accepting stale end', async () => {
  const h = fixture(), events: string[] = [];
  assert.equal(await h.play(0, 'session-a', 22, () => events.push('start'), () => events.push('end')), true);
  const staleEnd = h.sources[0].onended!;
  h.advance(2); h.player.pause(); assert.equal(h.sources[0].stops, 1); assert.equal(h.player.isPlaying(), false);
  h.advance(40); assert.equal(await h.player.resume(), true);
  assert.equal(h.sources[1].offset, 2); staleEnd(); assert.deepEqual(events, ['start']);
  h.sources[1].onended!(); h.sources[1].onended!();
  assert.deepEqual(events, ['start', 'end']); assert.equal(h.player.isPlaying(), false);
});

test('Replay replaces current source at offset zero and reuses decoded audio', async () => {
  const h = fixture(); await h.play(); h.advance(3); await h.play();
  assert.equal(h.sources[0].stops, 1); assert.equal(h.sources[1].offset, 0);
  assert.equal(h.requests(), 1); assert.equal(h.decodes(), 1);
});

for (const volume of [0, 0.35]) {
  test(`latest volume ${volume} wins after delayed clip loading and changes active gain`, async () => {
    const pending = deferred<Response>(), entered = deferred<void>();
    const h = fixture({ fetch: async () => { entered.resolve(); return pending.promise; } });
    const result = h.play(); await entered.promise; h.player.setVolume(volume); pending.resolve(response());
    assert.equal(await result, true); assert.equal(h.sources[0].startedGain, volume);
    h.player.setVolume(0.4); assert.equal(h.audio.gain.gain.value, 0.4);
  });
}

test('latest volume after deferred context resume and Stop/new cue protects pending resume', async () => {
  const pending = deferred<void>(), h = fixture({ state: 'suspended', resumeWait: pending.promise });
  const result = h.play(); await new Promise(resolve => setImmediate(resolve));
  h.player.setVolume(0); pending.resolve(); assert.equal(await result, true); assert.equal(h.sources[0].startedGain, 0);
});

test('expired loading budget and decoder duration mismatch never start audio', async () => {
  const h = fixture({ fetch: async () => { h.advance(18); return response(); } });
  assert.equal(await h.play(), false); assert.equal(h.sources.length, 0);
  const invalid = fixture({ decodedDuration: 12 });
  assert.equal(await invalid.play(), false); assert.equal(invalid.sources.length, 0);
});

test('missing bytes, bad checksum/source text and nonrunning device fail without invoking a provider', async () => {
  for (const fetch of [async () => new Response('', { status: 404 }), async () => new Response(new Uint8Array([1, 2, 3, 4]))]) {
    const h = fixture({ fetch }); assert.equal(await h.play(), false); assert.equal(h.sources.length, 0);
  }
  const mismatch = fixture(); assert.equal(await mismatch.player.speak('Wrong source', 1, () => {}, () => {}, context()), false);
  assert.equal(mismatch.requests(), 0);
  const closed = fixture({ state: 'closed' }); assert.equal(await closed.play(), false); assert.equal(closed.sources.length, 0);
});

test('verified persisted bytes permit offline replay in a new player; corrupt cached bytes are rejected', async () => {
  const values = new Map<string, Response>();
  const fakeCache = {
    match: async (url: string) => values.get(url)?.clone(),
    put: async (url: string, value: Response) => { values.set(url, value.clone()); },
    delete: async (url: string | Request) => values.delete(typeof url === 'string' ? url : new URL(url.url).pathname),
    keys: async () => [...values.keys()].map(url => new Request(`http://localhost${url}`)),
  };
  const cacheStorage = { open: async () => fakeCache } as unknown as CacheStorage;
  const online = fixture({ cacheStorage }); assert.equal(await online.play(), true); assert.equal(values.size, 1);
  const offline = fixture({ cacheStorage, fetch: async () => { throw Error('Synthetic offline'); } });
  assert.equal(await offline.play(), true); assert.equal(offline.requests(), 0);
  values.set([...values.keys()][0], new Response(new Uint8Array([0, 0, 0, 0])));
  const corrupted = fixture({ cacheStorage, fetch: async () => { throw Error('Synthetic offline'); } });
  assert.equal(await corrupted.play(), false); assert.equal(corrupted.sources.length, 0);
});

test('a definitive recording failure cannot retry on Pause→Resume over a device fallback', async () => {
  let calls = 0;
  const h = fixture({ fetch: async () => ++calls === 1 ? new Response('', { status: 404 }) : response() });
  assert.equal(await h.play(), false);
  h.player.pause(); await h.player.resume();
  assert.equal(calls, 1); assert.equal(h.sources.length, 0);
});

test('resumed load failure retains only bounded fallback metadata, never a resumable recording', async () => {
  const pending = deferred<Response>(), entered = deferred<void>(); let calls = 0;
  const h = fixture({ fetch: async () => { if (++calls === 1) { entered.resolve(); return pending.promise; } return new Response('', { status: 404 }); } });
  const old = h.play(); await entered.promise; h.advance(2); h.player.pause(); h.advance(40);
  assert.equal(await h.player.resume(), false);
  assert.equal(h.player.getResumeFallback()!.text, 'English cue 0');
  assert.equal(h.player.getResumeFallback()!.context.maxDurationSeconds, 20);
  h.player.pause(); await h.player.resume(); assert.equal(calls, 2);
  h.player.stop(); assert.equal(h.player.getResumeFallback(), null);
  pending.resolve(response()); assert.equal(await old, false);
});
