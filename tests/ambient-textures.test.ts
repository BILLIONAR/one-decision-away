import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { renderAmbientTexture, crossfadeAmbientLoop, AMBIENT_LOOP_SECONDS, type AmbientTexture } from '../src/utils/ambientTextures';
import { SOUND_ROOM_SECTIONS } from '../src/data/soundRoom';

const tracks: AmbientTexture[] = ['brown_noise', 'pink_noise', 'rain', 'waves', 'fireplace'];
const rendered = new Map(tracks.map(track => [track, renderAmbientTexture(track, 48_000, { seed: 12345 })]));
function stats(samples: Float32Array) {
  let sum = 0, difference = 0, peak = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] ** 2; peak = Math.max(peak, Math.abs(samples[i]));
    if (i) difference += (samples[i] - samples[i - 1]) ** 2;
  }
  return { rms: Math.sqrt(sum / samples.length), derivative: Math.sqrt(difference / samples.length), peak };
}
function correlation(left: Float32Array, right: Float32Array) {
  let product = 0, leftPower = 0, rightPower = 0;
  for (let i = 0; i < left.length; i++) { product += left[i] * right[i]; leftPower += left[i] ** 2; rightPower += right[i] ** 2; }
  return product / Math.sqrt(leftPower * rightPower);
}

test('ambient renders are long independent stereo textures with finite bounded levels', () => {
  for (const [track, channels] of rendered) {
    assert.equal(channels.length, 2);
    for (const channel of channels) {
      assert.equal(channel.length, 48_000 * AMBIENT_LOOP_SECONDS);
      const measured = stats(channel);
      assert.ok(measured.rms > 0.065 && measured.rms < 0.19, `${track}: useful quiet level ${measured.rms}`);
      assert.ok(measured.peak <= 0.720001, `${track}: no clipping`);
      assert.ok(channel.every(Number.isFinite));
    }
    assert.ok(Math.abs(correlation(...channels)) < 0.1, `${track}: channels are independent`);
  }
});

test('scene identities differ in spectrum and amplitude dynamics', () => {
  const brown = stats(rendered.get('brown_noise')![0]);
  const rain = stats(rendered.get('rain')![0]);
  const fire = stats(rendered.get('fireplace')![0]);
  assert.ok(rain.derivative > brown.derivative * 4, 'rain has a broad texture rather than the brown bed');
  assert.ok(fire.peak / fire.rms > 4, 'fire retains irregular transients');
  const waves = rendered.get('waves')![0];
  const windows = [];
  for (let i = 0; i < waves.length; i += 24_000) windows.push(stats(waves.subarray(i, i + 24_000)).rms);
  assert.ok(Math.max(...windows) > Math.min(...windows) * 6, 'surf swells in amplitude');
  const hashes = tracks.map(track => createHash('sha256').update(new Uint8Array(rendered.get(track)![0].buffer)).digest('hex'));
  assert.equal(new Set(hashes).size, tracks.length, 'different scene names do not duplicate samples');
});

test('loop overlaps join continuous adjacent noise without a boundary spike', () => {
  for (const [track, channels] of rendered) for (const channel of channels) {
    const boundary = Math.abs(channel[0] - channel[channel.length - 1]);
    assert.ok(boundary < stats(channel).derivative * 4, `${track}: boundary resembles normal adjacent texture`);
  }
  const raw = new Float32Array(1000).map((_, index) => Math.sin(index / 30));
  const loop = crossfadeAmbientLoop(raw, 100);
  assert.equal(loop.length, 900);
  assert.equal(loop[0], raw[100]);
  assert.equal(loop[loop.length - 1], raw[99]);
  assert.ok(Math.abs(loop[0] - loop.at(-1)!) < 0.04, 'overlap rejoins consecutive smooth samples');
});

test('seeds reproduce review samples and produce a new texture when changed', () => {
  const first = renderAmbientTexture('rain', 8000, { seed: 42 });
  assert.deepEqual(first, renderAmbientTexture('rain', 8000, { seed: 42 }));
  assert.notDeepEqual(first[0], renderAmbientTexture('rain', 8000, { seed: 43 })[0]);
  assert.throws(() => renderAmbientTexture('rain', Number.NaN), /sample rate/);
});

test('one Sound Room track keeps one title across categories, including intentional noise reuse', () => {
  const names = new Map<string, string>();
  for (const section of SOUND_ROOM_SECTIONS) for (const sound of section.sounds) {
    if (names.has(sound.track)) assert.equal(sound.name, names.get(sound.track), `${sound.track}: shared identity`);
    else names.set(sound.track, sound.name);
  }
  assert.equal(SOUND_ROOM_SECTIONS.filter(section => section.sounds.some(sound => sound.track === 'rain')).length, 2);
  assert.equal(SOUND_ROOM_SECTIONS.filter(section => section.sounds.some(sound => sound.track === 'meditation_432hz')).length, 2);
});
