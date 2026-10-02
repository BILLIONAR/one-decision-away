import type { FocusSoundTrack } from '../types/models';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { timerFadeSeconds } from './soundRoom';

/**
 * Sound Room player: the one place that starts, pauses and times Sound Room
 * audio. Lives outside React so a sound (and its timer) keeps going when the
 * member leaves the page, like music. It also follows the synthesizer: if the
 * Focus page starts or stops a sound, the Sound Room reflects it.
 */
export type SoundRoomState = {
  /** The sound shown in the player (playing, paused, or last played). */
  track: FocusSoundTrack | null;
  playing: boolean;
  /** Started from the Sleep section: the timer fades over the last minute. */
  sleep: boolean;
  /** Chosen timer length, or null for no timer. */
  timerMinutes: number | null;
  /** Wall-clock ms when the timer ends (only while playing with a timer). */
  endsAt: number | null;
  /** Timer time left when paused, so resuming continues the countdown. */
  pausedRemainingMs: number | null;
};

const FADE_IN_SECONDS = 3;
const PAUSE_FADE_SECONDS = 0.6;

let state: SoundRoomState = {
  track: null,
  playing: false,
  sleep: false,
  timerMinutes: null,
  endsAt: null,
  pausedRemainingMs: null,
};
const listeners = new Set<() => void>();
/** True while this module itself drives the synthesizer, so its own events are not mistaken for outside changes. */
let driving = false;
let followingSynth = false;

function set(next: Partial<SoundRoomState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function drive(action: () => void) {
  driving = true;
  try {
    action();
  } finally {
    driving = false;
  }
}

/** Schedules the end-of-timer fade on the audio clock. */
function scheduleTimer(remainingMs: number, sleep: boolean) {
  const fade = timerFadeSeconds(remainingMs, sleep);
  const delay = Math.max(0, remainingMs / 1000 - fade);
  drive(() => soundSynthesizer.fadeOutAndStop(Math.max(0.5, fade), delay));
}

function followSynth() {
  if (followingSynth) return;
  followingSynth = true;
  soundSynthesizer.subscribe(() => {
    if (driving) return;
    const current = soundSynthesizer.getCurrentTrack();
    if (current === 'silence') {
      // Timer ended, or something else (e.g. a Focus session) stopped the sound.
      if (state.playing) set({ playing: false, endsAt: null, pausedRemainingMs: null });
      return;
    }
    if (soundSynthesizer.isFadingOut()) return;
    // A non-silent external emission starts a new graph, even for the same track.
    // The external controller owns that session; do not retain a Sound Room
    // countdown or selected timer after the engine has replaced its envelope.
    set({ track: current, playing: true, sleep: false, timerMinutes: null, endsAt: null, pausedRemainingMs: null });
  });
  const current = soundSynthesizer.getCurrentTrack();
  if (current !== 'silence' && !soundSynthesizer.hasFadeOutScheduled()) {
    state = { ...state, track: current, playing: true };
  }
}
followSynth();

export const soundRoomPlayer = {
  subscribe(listener: () => void): () => void {
    followSynth();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): SoundRoomState {
    return state;
  },

  /** Start a sound. Must be called from a tap/click (browser autoplay rules). */
  play(track: FocusSoundTrack, options: { sleep?: boolean } = {}) {
    followSynth();
    const sleep = options.sleep ?? false;
    const resuming = !state.playing && state.track === track && state.pausedRemainingMs !== null;
    const remainingMs = resuming
      ? state.pausedRemainingMs
      : state.timerMinutes !== null ? state.timerMinutes * 60000 : null;
    drive(() => soundSynthesizer.playAmbient(track, { fadeInSeconds: FADE_IN_SECONDS }));
    set({
      track,
      playing: true,
      sleep,
      endsAt: remainingMs !== null ? Date.now() + remainingMs : null,
      pausedRemainingMs: null,
    });
    if (remainingMs !== null) scheduleTimer(remainingMs, sleep);
  },

  /** Resume the last sound (keeps what is left of the timer). */
  resume() {
    if (state.track && !state.playing) this.play(state.track, { sleep: state.sleep });
  },

  pause() {
    if (!state.playing) return;
    const remaining = state.endsAt !== null ? Math.max(0, state.endsAt - Date.now()) : null;
    set({ playing: false, endsAt: null, pausedRemainingMs: remaining !== null && remaining > 1000 ? remaining : null });
    drive(() => soundSynthesizer.fadeOutAndStop(PAUSE_FADE_SECONDS));
  },

  toggle(track: FocusSoundTrack, options: { sleep?: boolean } = {}) {
    if (state.playing && state.track === track) this.pause();
    else this.play(track, options);
  },

  /** Choose a timer length (null = no timer). Restarts the countdown if a sound is playing. */
  setTimer(minutes: number | null) {
    const endsAt = state.playing && minutes !== null ? Date.now() + minutes * 60000 : null;
    set({ timerMinutes: minutes, endsAt, pausedRemainingMs: null });
    if (!state.playing) return;
    drive(() => soundSynthesizer.cancelFadeOut());
    if (minutes !== null) scheduleTimer(minutes * 60000, state.sleep);
  },

  setVolume(volume: number) {
    soundSynthesizer.setVolume(volume);
  },

  getVolume(): number {
    return soundSynthesizer.getVolume();
  },
};
