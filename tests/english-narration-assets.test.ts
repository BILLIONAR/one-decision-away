import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GUIDED_MEDITATIONS } from '../src/data/guidedMeditations';
import { ENGLISH_NARRATION_ASSETS } from '../src/data/englishNarrationAssets';

const root = 'public/assets/oda/narration/en-US/v1/';
const sha = (data: string | Uint8Array) => createHash('sha256').update(data).digest('hex');
const manifest = JSON.parse(readFileSync(`${root}manifest.json`, 'utf8'));

test('all 160 shipped English cue identities/text hashes match the 11 runtime sessions', () => {
  assert.equal(sha(readFileSync('src/data/guidedMeditations.ts')), manifest.source.sha256);
  assert.equal(GUIDED_MEDITATIONS.length, 11);
  assert.equal(ENGLISH_NARRATION_ASSETS.length, 160);
  const ids = new Set<string>();
  for (const session of GUIDED_MEDITATIONS) {
    const assets = ENGLISH_NARRATION_ASSETS.filter(asset => asset.sessionId === session.id);
    assert.equal(assets.length, session.cues.length);
    for (const [cueIndex, cue] of session.cues.entries()) {
      const asset = assets[cueIndex], key = `${session.id}:${cueIndex}`;
      assert.equal(ids.has(key), false); ids.add(key);
      assert.equal(asset.cueIndex, cueIndex);
      assert.equal(asset.language, 'en-US');
      assert.equal(asset.version, 'v1');
      assert.equal(asset.text, cue.text);
      assert.equal(asset.sourceTextHash, sha(cue.text));
      assert.equal(asset.scheduledStartSeconds, cue.atSeconds);
      assert.equal(asset.slotSeconds, (session.cues[cueIndex + 1]?.atSeconds ?? session.durationMinutes * 60) - cue.atSeconds);
    }
  }
  assert.equal(ids.size, 160);
});

test('every public MP3 byte count/checksum matches delivered metadata and no model/runtime is shipped', () => {
  assert.equal(readdirSync(`${root}clips`).length, 160);
  let bytes = 0;
  for (const asset of ENGLISH_NARRATION_ASSETS) {
    const data = readFileSync(`public/${asset.file}`);
    assert.equal(data.byteLength, asset.bytes, asset.file);
    assert.equal(sha(data), asset.checksum, asset.file);
    bytes += data.byteLength;
  }
  assert.equal(bytes, 19_843_328);
  assert.ok(readFileSync(`${root}LICENSE-APACHE-2.0.txt`, 'utf8').includes('Apache License'));
  assert.ok(readFileSync(`${root}NOTICE.txt`, 'utf8').includes('Model weights and runtime are not distributed'));
  assert.deepEqual(readdirSync(root).sort(), ['LICENSE-APACHE-2.0.txt', 'NOTICE.txt', 'README.md', 'clips', 'manifest.json', 'validation-summary.json'].sort());
});

test('all shipped decoded/container durations fit the original cue windows with at least250ms margin', () => {
  for (const asset of ENGLISH_NARRATION_ASSETS) {
    const cue = manifest.sessions.find((s: any) => s.id === asset.sessionId).cues[asset.cueIndex];
    assert.equal(asset.decodedDurationSeconds, cue.decodedMetrics.decodedDurationSeconds);
    assert.equal(asset.containerDurationSeconds, cue.containerDurationSeconds);
    assert.ok(Math.max(asset.decodedDurationSeconds, asset.containerDurationSeconds) + 0.25 <= asset.slotSeconds);
    assert.equal(cue.spokenTextIndependentlyTranscribed, false);
    assert.equal(cue.listeningVerified, false);
  }
});

test('service worker leaves narration to the verified on-demand cache and does not precache MP3s', () => {
  const source = readFileSync('public/sw.js', 'utf8');
  assert.match(source, /assets\/oda\/narration\//);
  assert.match(source, /&& !narrationAsset/);
  assert.equal(source.slice(source.indexOf('const SHELL ='), source.indexOf('const inScope')).includes('.mp3'), false);
});
