import assert from 'node:assert/strict';

const spoken: string[] = [];
let cancelled = 0;
const stored = new Map<string, string>([['oda_voice_prefs', JSON.stringify({ enabled: false, engine: 'gemini', geminiApiKey: 'test-only-never-sent' })]]);
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => stored.set(key, value),
}});
Object.defineProperty(globalThis, 'window', { configurable: true, value: {
  speechSynthesis: {
    getVoices: () => [], addEventListener: () => {},
    cancel: () => { cancelled++; },
    speak: (utterance: { text: string }) => spoken.push(utterance.text),
  },
}});
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { configurable: true, value: class {
  constructor(public text: string) {}
}});
Object.assign(window, { SpeechSynthesisUtterance });
Object.defineProperty(globalThis, 'fetch', { configurable: true, value: () => { throw new Error('Notebook voice must never use a paid/network API.'); } });
const { voiceGuide } = await import('../src/utils/voiceGuide');
const preferencesBefore = stored.get('oda_voice_prefs');
assert.equal(voiceGuide.speakBrowserOnly('I am learning every day.'), true);
assert.deepEqual(spoken, ['I am learning every day.']);
assert.ok(cancelled > 0);
assert.equal(stored.get('oda_voice_prefs'), preferencesBefore);
assert.equal(voiceGuide.speakBrowserOnly('  '), false);
Reflect.deleteProperty(globalThis, 'SpeechSynthesisUtterance');
Reflect.deleteProperty(window, 'SpeechSynthesisUtterance');
assert.equal(voiceGuide.speakBrowserOnly('No voice available.'), false);
console.log('Notebook voice uses device speech only, preserves preferences and handles unavailable speech.');
