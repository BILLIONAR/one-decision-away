import type { FocusSoundTrack } from '../types/models';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { timerFadeSeconds } from './soundRoom';
import { purchases } from './purchases';
import { canPlaySoundRoom, resolveSoundRoomAccess, type SoundRoomOrigin, type SoundRoomPlayOptions } from './soundRoomAccess';
export type { SoundRoomPlayOptions } from './soundRoomAccess';

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
/** A successful synchronous engine start emits, including same-track restarts. */
let synthEmissions = 0;
/** Only selections started here can be revoked here; Focus owns its own graphs. */
let ownedSelection: {
  track: FocusSoundTrack;
  origin: SoundRoomOrigin | null;
  restricted: boolean;
  identityRevision: number;
} | null = null;

function set(next: Partial<SoundRoomState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function drive(action: () => void) {
  const previous = driving;
  driving = true;
  try {
    action();
  } finally {
    driving = previous;
  }
}

function clearOwnedSelection() {
  const selected = ownedSelection;
  ownedSelection = null;
  // An external replacement must keep running, even if its track is paid here.
  if (selected && soundSynthesizer.getCurrentTrack() === selected.track) {
    drive(() => soundSynthesizer.stopAmbient());
  }
  set({ track: null, playing: false, sleep: false, endsAt: null, pausedRemainingMs: null });
}

/** Reads live state, including when no Sound Room page is mounted. */
function reconcileOwnedSelection() {
  const selected = ownedSelection;
  if (!selected?.restricted) return;
  const access = purchases.getState();
  if (access.available && (!canPlaySoundRoom(true, access) || selected.identityRevision !== access.identityRevision)) {
    clearOwnedSelection();
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
    synthEmissions++;
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
    ownedSelection = null;
    set({ track: current, playing: true, sleep: false, timerMinutes: null, endsAt: null, pausedRemainingMs: null });
  });
  const current = soundSynthesizer.getCurrentTrack();
  if (current !== 'silence' && !soundSynthesizer.hasFadeOutScheduled()) {
    state = { ...state, track: current, playing: true };
  }
}
followSynth();
// Process-lived, like the player itself; navigation or zero UI listeners does not
// leave a previously admitted native premium graph running after access changes.
purchases.subscribe(reconcileOwnedSelection);

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
  play(track: FocusSoundTrack, options: SoundRoomPlayOptions = {}): boolean {
    followSynth();
    reconcileOwnedSelection();
    const selection = resolveSoundRoomAccess(track, options);
    const access = purchases.getState();
    if (!selection || !canPlaySoundRoom(selection.restricted, access)) return false;
    const sleep = options.sleep ?? false;
    const resuming = !state.playing && state.track === track && state.pausedRemainingMs !== null;
    const remainingMs = resuming
      ? state.pausedRemainingMs
      : state.timerMinutes !== null ? state.timerMinutes * 60000 : null;
    const previousSelection = ownedSelection;
    const previousTrack = soundSynthesizer.getCurrentTrack();
    const previousEmission = synthEmissions;
    const owned = { track, ...selection, identityRevision: access.identityRevision };
    ownedSelection = owned;
    try {
      drive(() => soundSynthesizer.playAmbient(track, { fadeInSeconds: FADE_IN_SECONDS }));
    } catch {
      if (ownedSelection === owned) {
        if (soundSynthesizer.getCurrentTrack() === previousTrack) ownedSelection = previousSelection;
        else clearOwnedSelection();
      }
      return false;
    }
    // Purchase listeners can revoke synchronously during the engine's start event.
    // An unavailable audio context (or silence) must not claim a playing graph.
    reconcileOwnedSelection();
    if (ownedSelection !== owned || synthEmissions === previousEmission || track === 'silence' || soundSynthesizer.getCurrentTrack() !== track) {
      if (ownedSelection === owned) {
        ownedSelection = soundSynthesizer.getCurrentTrack() === previousTrack ? previousSelection : null;
        if (soundSynthesizer.getCurrentTrack() === 'silence') {
          set({ playing: false, endsAt: null, pausedRemainingMs: null });
        }
      }
      return false;
    }
    set({
      track,
      playing: true,
      sleep,
      endsAt: remainingMs !== null ? Date.now() + remainingMs : null,
      pausedRemainingMs: null,
    });
    // A state subscriber may revoke access or hand playback to Focus. Its graph
    // must not inherit this selection's timer after that synchronous handoff.
    if (ownedSelection !== owned || !state.playing || soundSynthesizer.getCurrentTrack() !== track) return false;
    if (remainingMs !== null) scheduleTimer(remainingMs, sleep);
    return true;
  },

  /** Resume the last sound (keeps what is left of the timer). */
  resume(): boolean {
    reconcileOwnedSelection();
    if (!state.track || state.playing) return false;
    return this.play(state.track, { ...ownedSelection?.origin, sleep: state.sleep });
  },

  pause() {
    reconcileOwnedSelection();
    if (!state.playing) return;
    const selected = ownedSelection;
    const emission = synthEmissions;
    const remaining = state.endsAt !== null ? Math.max(0, state.endsAt - Date.now()) : null;
    set({ playing: false, endsAt: null, pausedRemainingMs: remaining !== null && remaining > 1000 ? remaining : null });
    if (state.playing || ownedSelection !== selected || synthEmissions !== emission) return;
    drive(() => soundSynthesizer.fadeOutAndStop(PAUSE_FADE_SECONDS));
  },

  toggle(track: FocusSoundTrack, options: SoundRoomPlayOptions = {}): boolean {
    reconcileOwnedSelection();
    const selection = resolveSoundRoomAccess(track, options);
    if (!selection || !canPlaySoundRoom(selection.restricted, purchases.getState())) return false;
    if (state.playing && state.track === track) {
      this.pause();
      return true;
    }
    return this.play(track, options);
  },

  /** Choose a timer length (null = no timer). Restarts the countdown if a sound is playing. */
  setTimer(minutes: number | null) {
    reconcileOwnedSelection();
    const selected = ownedSelection;
    const emission = synthEmissions;
    const endsAt = state.playing && minutes !== null ? Date.now() + minutes * 60000 : null;
    set({ timerMinutes: minutes, endsAt, pausedRemainingMs: null });
    if (!state.playing || ownedSelection !== selected || synthEmissions !== emission ||
      state.timerMinutes !== minutes || state.endsAt !== endsAt) return;
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
