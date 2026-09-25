import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BREATH_CYCLE_MS, BREATH_EXHALE_MS, BREATH_INHALE_MS, BREATH_MIN_SCALE,
  breathPhase, breathsPerMinute, formatRemaining, timerFadeSeconds, TIMER_CHOICES,
} from '../src/services/soundRoom';

test('breath pacer runs at about 5.5 breaths a minute', () => {
  assert.equal(BREATH_INHALE_MS, 5500);
  assert.equal(BREATH_EXHALE_MS, 5500);
  assert.ok(Math.abs(breathsPerMinute() - 5.45) < 0.01);
});

test('breathPhase: inhale first, then exhale, then repeats', () => {
  const start = breathPhase(0);
  assert.equal(start.phase, 'inhale');
  assert.equal(start.scale, BREATH_MIN_SCALE);
  assert.equal(start.secondsLeft, 6); // ceil(5.5)

  const top = breathPhase(BREATH_INHALE_MS);
  assert.equal(top.phase, 'exhale');
  assert.ok(Math.abs(top.scale - 1) < 1e-9);

  const mid = breathPhase(BREATH_INHALE_MS / 2);
  assert.ok(mid.scale > BREATH_MIN_SCALE && mid.scale < 1);

  assert.deepEqual(breathPhase(BREATH_CYCLE_MS * 3 + 1000), breathPhase(1000));
  assert.equal(breathPhase(BREATH_CYCLE_MS - 100).secondsLeft, 1);
});

test('breathPhase is safe with odd input', () => {
  assert.equal(breathPhase(-1000).phase, 'exhale');
  assert.equal(breathPhase(Number.NaN).phase, 'inhale');
});

test('formatRemaining', () => {
  assert.equal(formatRemaining(0), '0:00');
  assert.equal(formatRemaining(-5), '0:00');
  assert.equal(formatRemaining(1), '0:01');
  assert.equal(formatRemaining(65_000), '1:05');
  assert.equal(formatRemaining(20 * 60_000), '20:00');
  assert.equal(formatRemaining(60 * 60_000), '1:00:00');
});

test('timer fades: a minute for sleep, short otherwise, never over half the timer', () => {
  assert.deepEqual([...TIMER_CHOICES], [10, 20, 30, 60]);
  assert.equal(timerFadeSeconds(10 * 60_000, true), 60);
  assert.equal(timerFadeSeconds(10 * 60_000, false), 10);
  assert.equal(timerFadeSeconds(30_000, true), 15);
  assert.equal(timerFadeSeconds(0, true), 0);
});
