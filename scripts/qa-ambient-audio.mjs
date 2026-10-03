// Objective procedural-audio review. Original rendered signals; no recordings or provider.
// node --import tsx scripts/qa-ambient-audio.mjs (installed ffmpeg encodes optional audition files).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { renderAmbientTexture, AMBIENT_LOOP_SECONDS, AMBIENT_SEAM_SECONDS } from '../src/utils/ambientTextures.ts';

const root = new URL('../', import.meta.url).pathname;
const out = path.resolve(root, process.env.ODA_AMBIENT_QA_OUT || 'artifacts/verification/premium-ambient-audio');
fs.mkdirSync(out, { recursive: true });
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oda-ambient-audio-'));
const sampleRate = 48_000;
const report = {
  generatedAt: new Date().toISOString(), sampleRate, seconds: AMBIENT_LOOP_SECONDS,
  seamSeconds: AMBIENT_SEAM_SECONDS, seed: 12345, channels: 2, tracks: [],
  checks: 'See tests/ambient-textures.test.ts and tests/sound-synthesizer.test.ts for assertions.',
  limits: ['Objective samples and fake Web Audio automation checks; no listening assessment is claimed.',
    'Render times describe this saved Linux executor, not a physical phone.',
    'Audition files are original procedural audio, encoded to Ogg; production synthesizes locally and downloads none of them.'],
};
function measured(samples) {
  let sum = 0, derivative = 0, peak = 0;
  for (let i = 0; i < samples.length; i++) { sum += samples[i] ** 2; peak = Math.max(peak, Math.abs(samples[i])); if (i) derivative += (samples[i] - samples[i-1]) ** 2; }
  return { rms: Math.sqrt(sum / samples.length), peak, adjacentDifferenceRms: Math.sqrt(derivative / samples.length), seamDifference: Math.abs(samples[0] - samples.at(-1)) };
}
function wav(channels) {
  // A full loop plus two seconds of the next one exposes the actual seam for review.
  const frames = channels[0].length + sampleRate * 2;
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 4, 28); buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(frames * 4, 40);
  for (let frame = 0; frame < frames; frame++) {
    const attack = Math.min(1, frame / (sampleRate * 3));
    const release = Math.min(1, (frames - frame) / (sampleRate * 0.18));
    for (let channel = 0; channel < 2; channel++) {
      const value = channels[channel][frame % channels[channel].length] * 0.2 * attack * release;
      buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + frame * 4 + channel * 2);
    }
  }
  return buffer;
}
try {
  for (const track of ['brown_noise', 'pink_noise', 'rain', 'waves', 'fireplace']) {
    const start = performance.now();
    const channels = renderAmbientTexture(track, sampleRate, { seed: report.seed });
    const renderMs = performance.now() - start;
    let product = 0, leftPower = 0, rightPower = 0;
    for (let i = 0; i < channels[0].length; i++) { product += channels[0][i] * channels[1][i]; leftPower += channels[0][i] ** 2; rightPower += channels[1][i] ** 2; }
    const record = { track, renderMs, bufferBytes: channels[0].byteLength + channels[1].byteLength, measured: channels.map(measured), stereoCorrelation: product / Math.sqrt(leftPower * rightPower), rawFloat32Sha256: channels.map(channel => createHash('sha256').update(new Uint8Array(channel.buffer)).digest('hex')) };
    if (['rain', 'waves', 'fireplace'].includes(track)) {
      const source = path.join(temporary, `${track}.wav`), output = path.join(out, `${track}-review.ogg`);
      fs.writeFileSync(source, wav(channels));
      execFileSync('ffmpeg', ['-nostdin', '-y', '-loglevel', 'error', '-i', source, '-c:a', 'libvorbis', '-q:a', '4', output]);
      record.audition = { path: path.basename(output), seconds: 26, userGain: 0.2, attackSeconds: 3, releaseSeconds: 0.18, encodedBytes: fs.statSync(output).size };
    }
    report.tracks.push(record);
  }
  fs.writeFileSync(path.join(out, 'ambient-render-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, tracks: report.tracks.map(record => ({ track: record.track, renderMs: Math.round(record.renderMs), stereoCorrelation: record.stereoCorrelation })), listeningAssessment: 'not performed' }, null, 2));
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
