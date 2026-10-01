// Actual Chromium OfflineAudioContext verifies production gain graph behavior.
// It renders locally without opening app data, recording a microphone or a provider.
import { chromium } from 'playwright';
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const out = path.resolve(root, process.env.ODA_AMBIENT_QA_OUT || 'artifacts/verification/premium-ambient-audio');
fs.mkdirSync(out, { recursive: true });
const bundle = await build({ entryPoints: [path.join(root, 'src/utils/soundSynthesizer.ts')], bundle: true, format: 'iife', globalName: 'ODA_AMBIENT', platform: 'browser', write: false });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage();
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
await page.addScriptTag({ content: bundle.outputFiles[0].text });
const report = { generatedAt: new Date().toISOString(), browser: await browser.version(), checks: [], runtimeErrors, limits: ['Offline browser rendering verifies the actual production graph, not a listening assessment or physical-device performance.', 'The adapter supplies OfflineAudioContext to the production engine; production continues to use AudioContext.'] };
try {
  for (const [phase, muteAt] of [['beginning', 4], ['middle', 5], ['end', 5.95]]) {
    const result = await page.evaluate(async ({ muteAt }) => {
      const rate = 24_000, offline = new OfflineAudioContext(2, 7 * rate, rate);
      // The engine must not call real-time resume before offline rendering starts.
      Object.defineProperty(offline, 'state', { get: () => 'running' });
      const original = window.AudioContext;
      window.AudioContext = class { constructor() { return offline; } };
      const engine = new window.ODA_AMBIENT.SoundSynthesizer();
      const suspension = offline.suspend(muteAt);
      engine.playAmbient('rain', { fadeInSeconds: 3 });
      engine.fadeOutAndStop(2, 4);
      const rendering = offline.startRendering();
      await suspension;
      const actualMuteAt = offline.currentTime;
      engine.setMuted(true);
      const scheduledAfterMute = engine.hasFadeOutScheduled();
      await offline.resume();
      const buffer = await rendering;
      engine.stopAmbient(); window.AudioContext = original;
      const samples = buffer.getChannelData(0);
      const rms = (start, end) => {
        let sum = 0, count = 0;
        for (let i = Math.round(start * rate); i < Math.round(end * rate); i++) { sum += samples[i] ** 2; count++; }
        return Math.sqrt(sum / count);
      };
      let peak = 0, finite = true;
      for (const value of samples) { peak = Math.max(peak, Math.abs(value)); finite &&= Number.isFinite(value); }
      return { actualMuteAt, scheduledAfterMute, earlyRms: rms(0.02, 0.2), settledRms: rms(3.1, 3.6), mutedRms: rms(actualMuteAt + 0.02, 6.9), peak, finite, sampleRate: buffer.sampleRate, channels: buffer.numberOfChannels };
    }, { muteAt });
    assert.equal(result.channels, 2); assert.equal(result.sampleRate, 24_000);
    assert.ok(result.finite && result.peak < 0.2, `${phase}: bounded real rendered output`);
    assert.ok(result.settledRms > result.earlyRms * 8, `${phase}: timer did not erase the three-second attack`);
    assert.equal(result.mutedRms, 0, `${phase}: muted samples are exactly zero`);
    assert.equal(result.scheduledAfterMute, true, `${phase}: mute retained timer plan`);
    report.checks.push({ name: `actual browser attack/timer/mute at ${phase}`, passed: true, ...result });
  }
  assert.deepEqual(runtimeErrors, []);
  fs.writeFileSync(path.join(out, 'browser-audio-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
