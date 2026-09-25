/**
 * Sound Room — pure helpers (no DOM, no audio) so they can be unit-tested.
 */

/** Inhale and exhale length of the breath pacer, in ms (≈5.5 breaths a minute). */
export const BREATH_INHALE_MS = 5500;
export const BREATH_EXHALE_MS = 5500;
export const BREATH_CYCLE_MS = BREATH_INHALE_MS + BREATH_EXHALE_MS;

/** Breaths per minute for a given cycle length. 11 s → ≈5.45. */
export function breathsPerMinute(cycleMs: number = BREATH_CYCLE_MS): number {
  return cycleMs > 0 ? 60000 / cycleMs : 0;
}

export type BreathPhase = {
  phase: 'inhale' | 'exhale';
  /** 0 → 1 through the current phase. */
  progress: number;
  /** Whole seconds left in the current phase (at least 1). */
  secondsLeft: number;
  /** Circle scale, 0.6 (empty lungs) → 1 (full), eased like a breath. */
  scale: number;
};

export const BREATH_MIN_SCALE = 0.6;

/** Where in the breath cycle we are, `elapsedMs` after the pacer started. */
export function breathPhase(
  elapsedMs: number,
  inhaleMs: number = BREATH_INHALE_MS,
  exhaleMs: number = BREATH_EXHALE_MS,
): BreathPhase {
  const cycle = inhaleMs + exhaleMs;
  const safe = Number.isFinite(elapsedMs) ? elapsedMs : 0;
  const t = ((safe % cycle) + cycle) % cycle;
  const inhaling = t < inhaleMs;
  const length = inhaling ? inhaleMs : exhaleMs;
  const within = inhaling ? t : t - inhaleMs;
  const progress = length > 0 ? within / length : 0;
  const eased = (1 - Math.cos(Math.PI * progress)) / 2; // ease-in-out
  const fullness = inhaling ? eased : 1 - eased;
  return {
    phase: inhaling ? 'inhale' : 'exhale',
    progress,
    secondsLeft: Math.max(1, Math.ceil((length - within) / 1000)),
    scale: BREATH_MIN_SCALE + (1 - BREATH_MIN_SCALE) * fullness,
  };
}

/** "4:05", "12:00", "1:00:00" — remaining time for the player bar. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil((Number.isFinite(ms) ? ms : 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export const TIMER_CHOICES = [10, 20, 30, 60] as const;

/**
 * How long the end-of-timer fade lasts, in seconds. Sleep fades over the last
 * minute; other sections end with a short, gentle fade. Never longer than half
 * the timer, so short timers still play at full volume first.
 */
export function timerFadeSeconds(totalMs: number, sleep: boolean): number {
  const wanted = sleep ? 60 : 10;
  return Math.max(0, Math.min(wanted, totalMs / 2000));
}
