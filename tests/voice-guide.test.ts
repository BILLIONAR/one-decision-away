import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { VoiceGuide, type EnglishRecordedCueAsset, type EnglishRecordedNarration, type GuidedCueContext } from '../src/utils/voiceGuide';
import { geminiVoice } from '../src/utils/geminiVoice';
import { getLocale, setLocale, type Locale } from '../src/i18n';

const voice = (lang: string, name: string, isDefault = false): SpeechSynthesisVoice => ({
  lang, name, voiceURI: `${lang}:${name}`, default: isDefault, localService: true,
});
const english = voice('en-US', 'English device voice');
const turkish = voice('tr-TR', 'Turkish device voice', true);
const spanish = voice('es-ES', 'Spanish device voice');
const context: GuidedCueContext = { sessionId: 'fixture-session', cueIndex: 0, maxDurationSeconds: 22 };
const manifest = (overrides: Partial<EnglishRecordedCueAsset> = {}): EnglishRecordedCueAsset => ({
  sessionId: context.sessionId, cueIndex: 0, language: 'en-US', version: 'fixture-v1',
  sourceTextHash: 'a'.repeat(64), checksum: 'b'.repeat(64), decodedDurationSeconds: 9.5, ...overrides,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
const settled = async () => { await Promise.resolve(); await Promise.resolve(); };

function fixture(t: TestContext, options: { voices?: SpeechSynthesisVoice[]; prefs?: Record<string, unknown>; supported?: boolean } = {}) {
  const originals = new Map(['window', 'localStorage', 'SpeechSynthesisUtterance', 'fetch'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const originalLocale = getLocale();
  const originalProvider = {
    speak: geminiVoice.speak, stop: geminiVoice.stop, pause: geminiVoice.pause, resume: geminiVoice.resume,
    isPlaying: geminiVoice.isPlaying, prefetch: geminiVoice.prefetch,
  };
  const stored = new Map<string, string>(options.prefs ? [['oda_voice_prefs', JSON.stringify(options.prefs)]] : []);
  const spoken: FakeUtterance[] = [];
  const inventoryEvents = new Set<() => void>();
  let inventory = options.voices ?? [english, turkish, spanish];
  let cancelError = false;
  let speakError = false;
  let cancelled = 0;
  let providerCalls = 0;
  let providerStops = 0;
  let providerPlaying = false;
  let providerSpeak: typeof geminiVoice.speak = async () => false;
  class FakeUtterance {
    voice: SpeechSynthesisVoice | null = null;
    lang = '';
    rate = 1;
    pitch = 1;
    volume = 1;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(public text: string) {}
  }
  const synthesis = {
    speaking: false, paused: false,
    getVoices: () => inventory,
    addEventListener: (_type: string, fn: () => void) => inventoryEvents.add(fn),
    cancel: () => {
      cancelled++;
      if (cancelError) throw new Error('Synthetic device cancellation failure');
      synthesis.speaking = false;
    },
    speak: (utterance: FakeUtterance) => {
      if (speakError) throw new Error('Synthetic device enqueue failure');
      spoken.push(utterance);
    },
    pause: () => { synthesis.paused = true; },
    resume: () => { synthesis.paused = false; },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
  } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: options.supported === false ? {} : {
    speechSynthesis: synthesis, SpeechSynthesisUtterance: FakeUtterance,
  } });
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: () => { throw new Error('Voice tests must not call a provider or network.'); } });
  geminiVoice.speak = async (...args) => { providerCalls++; return providerSpeak(...args); };
  geminiVoice.stop = () => { providerStops++; providerPlaying = false; };
  geminiVoice.pause = () => {};
  geminiVoice.resume = () => {};
  geminiVoice.isPlaying = () => providerPlaying;
  geminiVoice.prefetch = () => { throw new Error('No provider prefetch is permitted in this fixture.'); };
  const guide = new VoiceGuide();
  t.after(() => {
    guide.stop();
    Object.assign(geminiVoice, originalProvider);
    setLocale(originalLocale);
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  });
  return {
    guide, spoken, stored, synthesis,
    inventory: (next: SpeechSynthesisVoice[]) => { inventory = next; inventoryEvents.forEach(fn => fn()); },
    failCancel: () => { cancelError = true; }, failSpeak: () => { speakError = true; },
    provider: (fn: typeof providerSpeak) => { providerSpeak = fn; },
    providerPlaying: (playing: boolean) => { providerPlaying = playing; },
    providerCalls: () => providerCalls, providerStops: () => providerStops, cancelled: () => cancelled,
  };
}

for (const locale of ['en', 'tr', 'es'] as Locale[]) {
  test(`guided narration keeps original English text and voice with ${locale} UI`, t => {
    const h = fixture(t, { prefs: { voiceURI: turkish.voiceURI } });
    setLocale(locale);
    assert.deepEqual(h.guide.getEnglishVoices(), [english]);
    assert.equal(h.guide.getSelectedVoice(), english);
    assert.equal(h.guide.speak('Take a slow breath.'), true);
    assert.equal(h.spoken[0].text, 'Take a slow breath.');
    assert.equal(h.spoken[0].voice, english);
    assert.equal(h.spoken[0].lang, 'en-US');
    assert.equal(h.spoken[0].rate, 0.88);
    assert.equal(h.spoken[0].pitch, 0.95);
    assert.equal(h.providerCalls(), 0);
  });
}

test('English inventory accepts language tags and rejects names or unrelated prefixes', t => {
  const valid = [voice('en', 'One'), voice('EN-gb', 'Two'), voice('en_AU', 'Three')];
  const invalid = [voice('eng', 'English-looking name'), voice('fr-FR', 'Samantha'), voice('', 'English')];
  const h = fixture(t, { voices: [...invalid, ...valid] });
  assert.deepEqual(h.guide.getEnglishVoices(), valid);
  assert.equal(h.guide.getSelectedVoice(), valid[0]);
});

test('an explicitly selected English voice wins over a preferred device name', t => {
  const chosen = voice('en-GB', 'Chosen English voice');
  const h = fixture(t, { voices: [voice('en-US', 'Samantha'), chosen], prefs: { voiceURI: chosen.voiceURI } });
  assert.equal(h.guide.getSelectedVoice(), chosen);
});

for (const inventory of [[], [turkish, spanish]]) {
  test(`guided speech truthfully reports unavailable with ${inventory.length ? 'non-English' : 'empty'} inventory`, t => {
    const h = fixture(t, { voices: inventory });
    assert.equal(h.guide.isSupported(), true);
    assert.equal(h.guide.isAvailable(), false);
    assert.equal(h.guide.getSelectedVoice(), null);
    assert.equal(h.guide.speak('English cue'), false);
    assert.equal(h.spoken.length, 0);
    assert.equal(h.providerCalls(), 0);
  });
}

test('late English voice installation refreshes availability and unsubscribe removes listeners', t => {
  const h = fixture(t, { voices: [] });
  const available: boolean[] = [];
  const remove = h.guide.onAvailabilityChange(value => {
    available.push(value);
    h.guide.getEnglishVoices(); // An empty inventory must not recursively notify.
  });
  assert.deepEqual(available, [false]);
  h.inventory([turkish]);
  h.inventory([turkish, english]);
  h.inventory([turkish, english]);
  assert.deepEqual(available, [false, false, true]);
  assert.equal(h.guide.speak('Now available'), true);
  remove();
  h.inventory([]);
  assert.deepEqual(available, [false, false, true]);
  assert.equal(h.guide.isAvailable(), false);
});

for (const [locale, selected, text] of [
  ['tr', turkish, 'Bugün kendime verdiğim sözü tutuyorum.'],
  ['es', spanish, 'Hoy cumplo mi promesa.'],
] as const) {
  test(`Notebook retains verbatim ${locale} text, matching device voice and saved meditation preferences`, t => {
    const h = fixture(t, { prefs: { enabled: false, engine: 'gemini', geminiApiKey: 'unit-test-only-not-a-real-key' } });
    setLocale(locale);
    const before = h.stored.get('oda_voice_prefs');
    assert.equal(h.guide.speakBrowserOnly(text), true);
    assert.equal(h.spoken[0].text, text);
    assert.equal(h.spoken[0].voice, selected);
    assert.equal(h.stored.get('oda_voice_prefs'), before);
    assert.equal(h.providerCalls(), 0);
  });
}

test('Notebook preserves implicit device language when its voice list has not loaded', t => {
  const h = fixture(t, { voices: [] });
  setLocale('es');
  assert.equal(h.guide.speakBrowserOnly('Mis propias palabras.'), true);
  assert.equal(h.spoken[0].voice, null);
  assert.equal(h.spoken[0].lang, 'es-ES');
  assert.equal(h.guide.speak('English guidance'), false);
});

test('unsupported device speech does not report available or queued playback', t => {
  const unsupported = fixture(t, { supported: false });
  assert.equal(unsupported.guide.isAvailable(), false);
  assert.equal(unsupported.guide.speak('Cue'), false);
  assert.equal(unsupported.guide.speakBrowserOnly('Words'), false);
});

test('empty or disabled cues leave the device queue empty', t => {
  const h = fixture(t);
  assert.equal(h.guide.speak('  '), false);
  h.guide.setEnabled(false);
  assert.equal(h.guide.speak('Cue'), false);
  assert.equal(h.spoken.length, 0);
});

test('nonzero device volume changes apply to the next utterance without pretending to change active speech', t => {
  const h = fixture(t);
  h.guide.speak('Current device cue');
  h.synthesis.speaking = true;
  h.spoken[0].onstart!();
  h.guide.setVolume(0.35);
  assert.equal(h.spoken[0].volume, 1);
  assert.equal(h.guide.isSpeaking(), true);
  h.guide.speak('Next device cue');
  assert.equal(h.spoken[1].volume, 0.35);
  assert.equal(JSON.parse(h.stored.get('oda_voice_prefs')!).volume, 0.35);
  assert.equal(h.providerCalls(), 0);
});

test('zero device volume cancels the owned paused utterance and Resume cannot revive it', t => {
  const h = fixture(t), events: boolean[] = [];
  h.guide.onSpeakingChange(value => events.push(value));
  h.guide.speak('Owned device cue');
  h.synthesis.speaking = true;
  const old = h.spoken[0], staleStart = old.onstart!;
  old.onstart!();
  h.guide.pause();
  const cancelledBefore = h.cancelled();
  h.guide.setVolume(0);
  assert.equal(h.cancelled(), cancelledBefore + 1);
  assert.equal(old.onstart, null);
  assert.equal(old.onend, null);
  assert.equal(old.onerror, null);
  h.guide.setVolume(0.4);
  assert.equal(h.guide.speak('Must remain paused'), false);
  h.guide.resume();
  staleStart();
  assert.equal(h.guide.isSpeaking(), false);
  assert.equal(h.spoken.length, 1);
  assert.deepEqual(events, [true, false, false]);
  assert.equal(h.guide.speak('Next device cue'), true);
  assert.equal(h.spoken[1].volume, 0.4);
  assert.equal(h.providerCalls(), 0);
});

test('Stop while device speech is paused lets a new session resume the device queue', t => {
  const h = fixture(t);
  h.guide.speak('Old paused session');
  h.synthesis.speaking = true;
  h.guide.pause();
  h.guide.setVolume(0);
  assert.equal(h.synthesis.paused, true);
  h.guide.stop();
  h.guide.setVolume(0.4);
  assert.equal(h.guide.speak('New session'), true);
  assert.equal(h.synthesis.paused, false);
  assert.equal(h.spoken[1].volume, 0.4);
  assert.equal(h.providerCalls(), 0);
});

for (const failure of ['cancel', 'enqueue'] as const) {
  test(`device ${failure} failures produce an honest false result`, t => {
    const h = fixture(t);
    if (failure === 'cancel') h.failCancel(); else h.failSpeak();
    assert.equal(h.guide.speak('Cue'), false);
    assert.equal(h.spoken.length, 0);
    assert.equal(h.guide.isSpeaking(), false);
  });
}

test('new cues and Stop detach utterance handlers and ignore captured stale callbacks', t => {
  const h = fixture(t);
  const events: boolean[] = [];
  h.guide.onSpeakingChange(value => events.push(value));
  assert.equal(h.guide.speak('Old cue'), true);
  const old = h.spoken[0];
  const stale = { start: old.onstart!, end: old.onend!, error: old.onerror! };
  old.onstart!();
  assert.equal(h.guide.speak('Current cue'), true);
  assert.equal(old.onstart, null);
  assert.equal(old.onend, null);
  assert.equal(old.onerror, null);
  h.spoken[1].onstart!();
  stale.end(); stale.error(); stale.start();
  assert.deepEqual(events, [true, true]);
  const latestEnd = h.spoken[1].onend!;
  latestEnd(); latestEnd();
  assert.deepEqual(events, [true, true, false]);
  assert.equal(h.guide.speak('Stopped cue'), true);
  const stoppedStart = h.spoken[2].onstart!;
  h.guide.stop();
  stoppedStart();
  assert.equal(h.spoken[2].onstart, null);
  assert.deepEqual(events, [true, true, false, false]);
});

test('pause and resume keep the active browser cue, restore speaking state and reject replay while paused', t => {
  const h = fixture(t);
  const events: boolean[] = [];
  h.guide.onSpeakingChange(value => events.push(value));
  h.guide.speak('Current cue');
  h.synthesis.speaking = true;
  h.spoken[0].onstart!();
  h.guide.pause();
  assert.equal(h.guide.isSpeaking(), false);
  assert.equal(h.guide.speak('Paused replay'), false);
  h.guide.resume();
  assert.equal(h.guide.isSpeaking(), true);
  assert.equal(h.spoken.length, 1);
  assert.deepEqual(events, [true, false, true]);
  h.spoken[0].onend!();
  assert.equal(h.guide.isSpeaking(), false);
});

for (const action of ['stop', 'pause-resume', 'new-cue'] as const) {
  test(`${action} prevents a delayed provider failure from reviving an obsolete English device cue`, async t => {
    const h = fixture(t, { prefs: { engine: 'gemini', geminiApiKey: 'unit-test-only-not-a-real-key' } });
    const pending = deferred<boolean>();
    h.provider(text => text === 'Old cue' ? pending.promise : Promise.resolve(true));
    h.guide.speak('Old cue');
    if (action === 'stop') h.guide.stop();
    if (action === 'pause-resume') { h.guide.pause(); h.guide.resume(); }
    if (action === 'new-cue') h.guide.speak('New cue');
    pending.resolve(false);
    await settled();
    assert.equal(h.spoken.length, 0);
  });
}

test('current provider failure falls back to English device speech; a non-English inventory cannot substitute', async t => {
  const h = fixture(t, { prefs: { engine: 'gemini', geminiApiKey: 'unit-test-only-not-a-real-key' } });
  h.provider(async () => false);
  h.guide.speak('Original English cue');
  await settled();
  assert.equal(h.spoken[0].text, 'Original English cue');
  assert.equal(h.spoken[0].voice, english);
  h.inventory([spanish]);
  h.guide.speak('Unavailable English cue');
  await settled();
  assert.equal(h.spoken.length, 1);
});

function recorder(assets: EnglishRecordedCueAsset[] = [manifest()]) {
  const requests: { text: string; context?: GuidedCueContext; start: () => void; end: () => void; result: ReturnType<typeof deferred<boolean>> }[] = [];
  const preloads: { texts: string[]; contexts?: GuidedCueContext[] }[] = [];
  let stops = 0, pauses = 0, resumes = 0, playing = false, hasCue = true;
  const player: EnglishRecordedNarration = {
    assets, isAvailable: () => assets.length > 0, hasCue: () => hasCue,
    speak: (text, _volume, start, end, cueContext) => {
      const result = deferred<boolean>();
      requests.push({ text, context: cueContext, start, end, result });
      return result.promise;
    },
    prefetch: (texts, contexts) => preloads.push({ texts, contexts }),
    isPlaying: () => playing,
    stop: () => { stops++; playing = false; },
    pause: () => { pauses++; }, resume: () => { resumes++; },
  };
  return { player, requests, preloads, stops: () => stops, pauses: () => pauses, resumes: () => resumes,
    playing: (value: boolean) => { playing = value; }, hasCue: (value: boolean) => { hasCue = value; } };
}

test('the optional recorder remains dormant until registration and receives identified current/upcoming cues', t => {
  const h = fixture(t);
  const r = recorder();
  h.guide.speak('Default English cue', context);
  assert.equal(r.requests.length, 0);
  assert.equal(h.spoken.length, 1);
  h.guide.setRecordedNarration(r.player);
  const next = { ...context, cueIndex: 1, maxDurationSeconds: 18 };
  h.guide.prefetch(['Current', 'Upcoming'], [context, next]);
  assert.deepEqual(r.preloads, [{ texts: ['Current', 'Upcoming'], contexts: [context, next] }]);
  assert.equal(h.guide.speak('Recorded English cue', context), true);
  assert.equal(r.requests[0].text, 'Recorded English cue');
  assert.deepEqual(r.requests[0].context, context);
  assert.equal(h.providerCalls(), 0);
  assert.equal(h.spoken.length, 1);
});

for (const [name, assets, cueContext] of [
  ['missing clip', [], context],
  ['overlong clip', [manifest({ decodedDurationSeconds: 23 })], context],
  ['wrong language', [manifest({ language: 'es-ES' as 'en-US' })], context],
  ['missing text hash', [manifest({ sourceTextHash: '' })], context],
  ['missing checksum', [manifest({ checksum: '' })], context],
  ['missing version', [manifest({ version: '' })], context],
  ['wrong cue identity', [manifest({ cueIndex: 1 })], context],
  ['expired cue slot', [manifest()], { ...context, maxDurationSeconds: 0 }],
  ['unbounded cue slot', [manifest()], { ...context, maxDurationSeconds: Infinity }],
] as const) {
  test(`registered recorder ${name} uses truthful English device fallback without a provider`, t => {
    const h = fixture(t, { prefs: { engine: 'gemini', geminiApiKey: 'unit-test-only-not-a-real-key' } });
    const r = recorder([...assets]);
    h.guide.setRecordedNarration(r.player);
    assert.equal(h.guide.speak('English source cue', cueContext), true);
    assert.equal(r.requests.length, 0);
    assert.equal(h.spoken[0].voice, english);
    assert.equal(h.providerCalls(), 0);
  });
}

test('a recorder hash/source verification failure falls back, and absent English speech reports unavailable', t => {
  const h = fixture(t, { voices: [spanish] });
  const r = recorder();
  r.hasCue(false);
  h.guide.setRecordedNarration(r.player);
  assert.equal(h.guide.speak('Mismatched source text', context), false);
  assert.equal(r.requests.length, 0);
  assert.equal(h.spoken.length, 0);
  assert.equal(h.providerCalls(), 0);
});

test('new cues stop clips and stale recorded callbacks/failures cannot change current playback', async t => {
  const h = fixture(t);
  const r = recorder([manifest(), manifest({ cueIndex: 1 })]);
  const events: boolean[] = [];
  h.guide.setRecordedNarration(r.player);
  h.guide.onSpeakingChange(value => events.push(value));
  h.guide.speak('Old recorded cue', context);
  h.guide.speak('Current recorded cue', { ...context, cueIndex: 1 });
  assert.equal(r.stops(), 2);
  const old = r.requests[0], current = r.requests[1];
  current.start();
  old.start(); old.end(); old.result.reject(new Error('Stale load failed'));
  await settled();
  assert.deepEqual(events, [true]);
  assert.equal(h.spoken.length, 0);
  current.end(); current.end();
  assert.deepEqual(events, [true, false]);
});

test('recorded pause invalidates pending start/fallback even after resume, and Stop invalidates callbacks', async t => {
  const h = fixture(t);
  const r = recorder();
  const events: boolean[] = [];
  h.guide.setRecordedNarration(r.player);
  h.guide.onSpeakingChange(value => events.push(value));
  h.guide.speak('Pending recorded cue', context);
  h.guide.pause();
  h.guide.resume();
  assert.equal(r.pauses(), 1);
  assert.equal(r.resumes(), 1);
  r.requests[0].start();
  r.requests[0].result.resolve(false);
  await settled();
  assert.deepEqual(events, [false]);
  assert.equal(h.spoken.length, 0);
  h.guide.speak('Stopped recorded cue', context);
  h.guide.stop();
  r.requests[1].start(); r.requests[1].end();
  assert.deepEqual(events, [false, false]);
});

test('current recorded load failure falls back to English and unregistering restores device narration', async t => {
  const h = fixture(t);
  const r = recorder();
  h.guide.setRecordedNarration(r.player);
  h.guide.speak('Failed recorded cue', context);
  r.requests[0].result.reject(new Error('Synthetic missing bytes'));
  await settled();
  assert.equal(h.spoken[0].text, 'Failed recorded cue');
  assert.equal(h.spoken[0].voice, english);
  h.guide.setRecordedNarration(null);
  assert.equal(h.guide.speak('Restored device cue', context), true);
  assert.equal(r.requests.length, 1);
  assert.equal(h.spoken[1].text, 'Restored device cue');
  assert.equal(h.providerCalls(), 0);
});

test('synchronous recorded verification and playback errors truthfully queue English fallback', t => {
  const h = fixture(t);
  const r = recorder();
  h.guide.setRecordedNarration(r.player);
  r.player.hasCue = () => { throw new Error('Synthetic unreadable asset'); };
  assert.equal(h.guide.speak('Verification fallback', context), true);
  assert.equal(h.spoken[0].text, 'Verification fallback');
  r.player.hasCue = () => true;
  r.player.speak = () => { throw new Error('Synthetic playback failure'); };
  assert.equal(h.guide.speak('Playback fallback', context), true);
  assert.equal(h.spoken[1].text, 'Playback fallback');
  assert.equal(h.providerCalls(), 0);
});

test('a recorded request that already ended cannot later fall back and revive the cue', async t => {
  const h = fixture(t);
  const r = recorder();
  h.guide.setRecordedNarration(r.player);
  h.guide.speak('Completed cue', context);
  r.requests[0].start();
  r.requests[0].end();
  r.requests[0].result.resolve(false);
  await settled();
  assert.equal(h.spoken.length, 0);
  assert.equal(h.providerCalls(), 0);
});
