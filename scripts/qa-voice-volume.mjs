/** Provider-free volume smoke of production voice code and real browser Web Audio nodes. */
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium, webkit } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const out = 'artifacts/verification/voice-volume-followup';
mkdirSync(out, { recursive: true });
const sha = data => createHash('sha256').update(data).digest('hex');
const bundled = await build({
  stdin: { contents: "export { GeminiVoice, geminiVoice } from './src/utils/geminiVoice'; export { VoiceGuide } from './src/utils/voiceGuide';", resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, write: false, format: 'iife', globalName: 'ODAVoiceQA', platform: 'browser', logLevel: 'silent',
  define: { 'import.meta.env': '{}' },
});
const report = { at: new Date().toISOString(), sourceHashes: Object.fromEntries(['src/utils/geminiVoice.ts', 'src/utils/voiceGuide.ts'].map(path => [path, sha(readFileSync(path))])), checks: [], errors: [], failures: [], providerCalls: 0, limits: ['Synthesis is replaced by deferred synthetic PCM; no provider, key, fetch or paid call.', 'Real browser OfflineAudioContext nodes render synthetic audio; context suspend/resume timing is controlled by an adapter.', 'Device speech uses a spec-conforming mock, not installed voices or a claim of live device-utterance gain control.'] };
for (const engineName of ['chromium', 'webkit']) {
  const engine = engineName === 'chromium' ? chromium : webkit;
  const browser = await engine.launch({ executablePath: engineName === 'chromium' ? '/usr/bin/chromium' : engine.executablePath() });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.route('**/*', route => route.request().url() === 'http://127.0.0.1:4182/voice-volume-qa' ? route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local voice QA</title>' }) : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ engineName, error: error.message }));
    await page.goto('http://127.0.0.1:4182/voice-volume-qa');
    await page.addScriptTag({ content: bundled.outputFiles[0].text });
    const result = await page.evaluate(async () => {
      const { GeminiVoice, geminiVoice, VoiceGuide } = window.ODAVoiceQA;
      const NativeOfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const contexts = [], sources = [], checks = [];
      let providerCalls = 0, nextResume = null;
      window.fetch = () => { providerCalls++; throw new Error('Provider calls forbidden.'); };
      const defer = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
      const pcm = () => ({ sampleRate: 24000, samples: new Float32Array(2400).fill(0.25) });
      const verify = (condition, label, evidence = {}) => { if (!condition) throw new Error(`${label}: ${JSON.stringify(evidence)}`); checks.push({ label, ...evidence }); };
      class AudioDevice {
        constructor() {
          this.native = new NativeOfflineContext(1, 2400, 24000);
          this.destination = this.native.destination;
          this.resumeWait = nextResume; nextResume = null;
          this.state = this.resumeWait ? 'suspended' : 'running';
          contexts.push(this);
        }
        createGain() { this.gain = this.native.createGain(); return this.gain; }
        createBuffer(...args) { return this.native.createBuffer(...args); }
        createBufferSource() {
          const source = this.native.createBufferSource(), nativeStart = source.start.bind(source);
          source.start = (...args) => { sources.push({ source, gainAtStart: this.gain.gain.value }); nativeStart(...args); };
          return source;
        }
        async resume() { if (this.resumeWait) await this.resumeWait.promise; this.state = 'running'; }
        async suspend() { this.state = 'suspended'; }
      }
      window.AudioContext = AudioDevice;
      for (const volume of [0, 0.35]) {
        for (const waitAt of ['synthesis', 'resume']) {
          const voice = new GeminiVoice(), pending = defer();
          if (waitAt === 'resume') nextResume = pending;
          voice.synthesize = () => waitAt === 'synthesis' ? pending.promise : Promise.resolve(pcm());
          const before = sources.length;
          const playing = voice.speak(`${waitAt}-${volume}`, 'synthetic-only-no-key', 'Kore', 1);
          if (waitAt === 'resume') { for (let i = 0; i < 5; i++) await Promise.resolve(); }
          voice.setVolume(volume);
          pending.resolve(waitAt === 'synthesis' ? pcm() : undefined);
          const started = await playing, actual = sources[before]?.gainAtStart;
          const rendered = await contexts.at(-1).native.startRendering();
          const channel = rendered.getChannelData(0), rms = Math.sqrt(channel.reduce((sum, sample) => sum + sample * sample, 0) / channel.length);
          verify(started && Math.abs(actual - volume) < 1e-6 && Math.abs(rms - 0.25 * volume) < 1e-6, `${waitAt}: 1→${volume}`, { requestedVolume: volume, gainAtStart: actual, renderedRMS: rms });
          voice.stop();
        }
      }
      for (const action of ['stop', 'pause-resume', 'new-session']) {
        const voice = new GeminiVoice(), pending = defer(), before = sources.length;
        voice.synthesize = text => text === 'Old' ? pending.promise : Promise.resolve(pcm());
        const old = voice.speak('Old', 'synthetic-only-no-key', 'Kore', 1);
        voice.setVolume(0);
        if (action === 'pause-resume') { voice.pause(); voice.resume(); } else voice.stop();
        voice.setVolume(0.4);
        if (action === 'new-session') await voice.speak('New', 'synthetic-only-no-key', 'Kore', 0.4);
        pending.resolve(pcm());
        const superseded = await old, created = sources.length - before;
        verify(!superseded && created === (action === 'new-session' ? 1 : 0) && (created === 0 || Math.abs(sources[before].gainAtStart - 0.4) < 1e-6), action, { sourcesStarted: created });
        voice.stop();
      }
      // Exercise the real VoiceGuide → Gemini singleton boundary and saved volume.
      localStorage.setItem('oda_voice_prefs', JSON.stringify({ engine: 'gemini', geminiApiKey: 'synthetic-only-no-key', volume: 1 }));
      const guide = new VoiceGuide(), pendingGuide = defer(), beforeGuide = sources.length;
      geminiVoice.synthesize = () => pendingGuide.promise;
      guide.speak('Integrated uncached cue'); guide.setVolume(0); pendingGuide.resolve(pcm());
      for (let i = 0; i < 10; i++) await Promise.resolve();
      verify(sources.length === beforeGuide + 1 && sources[beforeGuide].gainAtStart === 0, 'VoiceGuide deferred mute', { gainAtStart: sources[beforeGuide]?.gainAtStart });
      guide.stop();
      const previewWait = defer(); geminiVoice.synthesize = () => previewWait.promise;
      const preview = guide.testNaturalVoice(); guide.setVolume(0.35); previewWait.resolve(pcm());
      verify(await preview && Math.abs(sources.at(-1).gainAtStart - 0.35) < 1e-6, 'Settings preview latest volume', { gainAtStart: sources.at(-1).gainAtStart });
      guide.stop();
      // Post-speak attribute changes are undefined; do not emulate live gain changes.
      const utterances = [], deviceVoice = { lang: 'en-US', name: 'Synthetic English', voiceURI: 'fixture-en', default: true };
      const synthesis = { speaking: false, paused: false, getVoices: () => [deviceVoice], addEventListener() {}, cancel() { this.speaking = false; }, pause() { this.paused = true; }, resume() { this.paused = false; }, speak(utterance) { utterances.push(utterance); this.speaking = !this.paused; } };
      class Utterance { constructor(text) { this.text = text; } }
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
      window.SpeechSynthesisUtterance = Utterance;
      localStorage.removeItem('oda_voice_prefs');
      const deviceGuide = new VoiceGuide(); deviceGuide.speak('First'); deviceGuide.setVolume(0.35);
      verify(utterances[0].volume === 1 && deviceGuide.getVolume() === 0.35, 'Device nonzero next cue');
      deviceGuide.pause(); deviceGuide.setVolume(0); deviceGuide.setVolume(0.4);
      verify(!deviceGuide.speak('Blocked while paused') && !synthesis.speaking && synthesis.paused, 'Device mute preserves pause');
      deviceGuide.resume(); verify(!deviceGuide.isSpeaking() && utterances.length === 1, 'Device resume cannot revive muted cue');
      deviceGuide.speak('Second'); deviceGuide.pause(); deviceGuide.stop(); deviceGuide.speak('New session');
      verify(!synthesis.paused && utterances.at(-1).volume === 0.4 && synthesis.speaking, 'Device new session resumes queue');
      deviceGuide.stop();
      return { checks, providerCalls };
    });
    report.checks.push(...result.checks.map(check => ({ engineName, ...check }))); report.providerCalls += result.providerCalls;
    await context.close();
  } catch (error) { report.failures.push({ engineName, error: String(error.stack || error) }); }
  finally { await browser.close(); }
}
writeFileSync(`${out}/browser-volume-report.json`, JSON.stringify(report, null, 2) + '\n');
assert.equal(report.errors.length, 0); assert.equal(report.failures.length, 0); assert.equal(report.providerCalls, 0);
console.log(`PASS ${report.checks.length} Chromium/WebKit voice checks; provider calls ${report.providerCalls}`);
