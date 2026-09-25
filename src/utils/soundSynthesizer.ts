import { FocusSoundTrack } from '../types/models';

/**
 * One Decision Away — Web Audio Focus Sound Synthesizer
 * Zero external audio files required — synthesizes pristine ambient focus audio
 * (Binaural Beats, Deep Brown Noise, Rainfall, Ocean Waves, Cozy Fireplace,
 * plus sacred meditation frequencies: 432Hz, 528Hz, Theta 6Hz, Tibetan Singing Bowls, 396Hz, 639Hz)
 * and interactive meditation bells directly in the browser.
 */

/** Seconds of the swell (inhale) and fall (exhale) of the `breath_pacer` track: ≈5.5 breaths a minute. */
export const BREATH_PACER_INHALE_SECONDS = 5.5;
export const BREATH_PACER_EXHALE_SECONDS = 5.5;

/** Master gain is never ramped to exactly 0 (exponential/linear ramps misbehave there). */
const SILENT_GAIN = 0.0001;

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentTrack: FocusSoundTrack = 'silence';
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private listeners = new Set<() => void>();
  /** Wall-clock ms when the current track's first cycle begins (used to sync visuals, e.g. the breath circle). */
  private trackStartedAt: number | null = null;
  /** A pending or running fade-out, in AudioContext time. */
  private fadePlan: { startAt: number; duration: number } | null = null;
  private fadeStopTimer: number | null = null;

  public getCurrentTrack(): FocusSoundTrack {
    return this.currentTrack;
  }

  /**
   * Subscribe to track changes (start, stop, end of a fade-out). Shaped for
   * React's useSyncExternalStore: `useSyncExternalStore(soundSynthesizer.subscribe, soundSynthesizer.getCurrentTrack)`.
   */
  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Stable bound getter for useSyncExternalStore. */
  public getTrackSnapshot = (): FocusSoundTrack => this.currentTrack;

  private emit() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // A broken listener must never stop the audio engine.
      }
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  /** Wall-clock time (ms) the current track started its first cycle, or null when silent. */
  public getTrackStartedAt(): number | null {
    return this.currentTrack === 'silence' ? null : this.trackStartedAt;
  }

  /** True once a fade-out has actually begun (not merely been scheduled). */
  public isFadingOut(): boolean {
    if (!this.fadePlan || !this.ctx) return false;
    return this.ctx.currentTime >= this.fadePlan.startAt;
  }

  /** True while a fade-out is scheduled or running. */
  public hasFadeOutScheduled(): boolean {
    return this.fadePlan !== null;
  }

  public isPlaying(): boolean {
    return this.currentTrack !== 'silence';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.applyGainPlan();
    }
  }

  /**
   * Re-applies the master gain automation: the current volume, then (if one is
   * planned) the fade-out. Keeps a scheduled sleep fade intact when the volume
   * changes, and never undoes a fade that is already running.
   */
  private applyGainPlan() {
    if (!this.gainNode || !this.ctx) return;
    const gain = this.gainNode.gain;
    const now = this.ctx.currentTime;
    const target = Math.max(SILENT_GAIN, this.volume * 0.4);
    const plan = this.fadePlan;
    if (plan && now >= plan.startAt) return; // already fading: let it finish
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(SILENT_GAIN, gain.value), now);
    gain.setTargetAtTime(target, now, 0.05);
    if (plan) {
      gain.setValueAtTime(target, plan.startAt);
      gain.linearRampToValueAtTime(SILENT_GAIN, plan.startAt + plan.duration);
    }
  }

  private clearFadePlan() {
    this.fadePlan = null;
    if (this.fadeStopTimer !== null) {
      clearTimeout(this.fadeStopTimer);
      this.fadeStopTimer = null;
    }
  }

  /**
   * Fades the ambient track out over `seconds` and then stops it. `delaySeconds`
   * lets a timer schedule the fade on the audio clock ahead of time, so it still
   * happens if the page's timers are throttled in the background.
   */
  public fadeOutAndStop(seconds: number = 1, delaySeconds: number = 0) {
    if (this.currentTrack === 'silence' || !this.gainNode || !this.ctx) {
      this.stopAmbient();
      return;
    }
    const duration = Math.max(0.05, seconds);
    const delay = Math.max(0, delaySeconds);
    const now = this.ctx.currentTime;
    if (this.fadePlan && now >= this.fadePlan.startAt) {
      // Already fading: only ever shorten the fade, never extend it.
      const currentEnd = this.fadePlan.startAt + this.fadePlan.duration;
      if (now + delay + duration >= currentEnd) return;
      const gain = this.gainNode.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(Math.max(SILENT_GAIN, gain.value), now);
    }
    this.clearFadePlan();
    this.fadePlan = { startAt: now + delay, duration };
    this.applyGainPlanForFade();
    const track = this.currentTrack;
    this.fadeStopTimer = window.setTimeout(() => {
      this.fadeStopTimer = null;
      if (this.currentTrack === track) this.stopAmbient();
    }, (delay + duration) * 1000 + 60);
  }

  /** Like applyGainPlan, but also (re)starts a fade that begins now. */
  private applyGainPlanForFade() {
    if (!this.gainNode || !this.ctx || !this.fadePlan) return;
    const gain = this.gainNode.gain;
    const now = this.ctx.currentTime;
    const { startAt, duration } = this.fadePlan;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(SILENT_GAIN, gain.value), now);
    if (startAt > now) {
      gain.setTargetAtTime(Math.max(SILENT_GAIN, this.volume * 0.4), now, 0.05);
      gain.setValueAtTime(Math.max(SILENT_GAIN, this.volume * 0.4), startAt);
    }
    gain.linearRampToValueAtTime(SILENT_GAIN, startAt + duration);
  }

  /** Cancels a scheduled or running fade-out and brings the volume back (e.g. the timer was changed). */
  public cancelFadeOut() {
    if (!this.fadePlan) return;
    this.clearFadePlan();
    this.applyGainPlan();
  }

  public stopAmbient() {
    this.stopAmbientSilently();
    this.emit();
  }

  private stopAmbientSilently() {
    this.clearFadePlan();
    this.trackStartedAt = null;
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach((node) => {
        if (typeof node === 'number') {
          clearInterval(node);
        } else {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // Ignored
          }
        }
      });
      this.activeNodes = [];
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Ignored
      }
      this.gainNode = null;
    }
    this.currentTrack = 'silence';
  }

  /**
   * Starts an ambient track. Call only from a user gesture (browsers block
   * audio that starts on its own). `fadeInSeconds` eases the sound in; the
   * default 0 keeps the original instant start used by the Focus page.
   */
  public playAmbient(track: FocusSoundTrack, options: { fadeInSeconds?: number } = {}) {
    this.stopAmbientSilently();
    if (track === 'silence') {
      this.emit();
      return;
    }

    this.initContext();
    if (!this.ctx) {
      this.emit();
      return;
    }

    const ctx = this.ctx;
    this.currentTrack = track;
    this.trackStartedAt = Date.now();

    // Master track gain
    const masterGain = ctx.createGain();
    const fadeIn = Math.max(0, options.fadeInSeconds ?? 0);
    if (fadeIn > 0) {
      masterGain.gain.setValueAtTime(SILENT_GAIN, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(Math.max(SILENT_GAIN, this.volume * 0.4), ctx.currentTime + fadeIn);
    } else {
      masterGain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    }
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;
    this.buildTrack(track, ctx, masterGain);
    this.emit();
  }

  /** Brown-noise buffer (mono), the same recipe the original tracks use. */
  private createBrownNoiseBuffer(ctx: AudioContext, seconds: number, gainCompensation: number): AudioBuffer {
    const bufferSize = Math.floor(seconds * ctx.sampleRate);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= gainCompensation;
    }
    return buffer;
  }

  /** Stereo pink noise (Paul Kellet's filter), each channel independent for a wide, soft image. */
  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const bufferSize = Math.floor(seconds * ctx.sampleRate);
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private buildTrack(track: FocusSoundTrack, ctx: AudioContext, masterGain: GainNode) {

    if (track === 'binaural') {
      // 10Hz Alpha wave difference for calm focused state (Left 216Hz, Right 226Hz)
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(216, ctx.currentTime);

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(226, ctx.currentTime);

      // Lowpass to make it warm and soothing
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      const gainLeft = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.3, ctx.currentTime);
      const gainRight = ctx.createGain();
      gainRight.gain.setValueAtTime(0.3, ctx.currentTime);

      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      merger.connect(filter);
      filter.connect(masterGain);

      oscLeft.start();
      oscRight.start();

      this.activeNodes.push(oscLeft, oscRight, filter, gainLeft, gainRight, merger);
    } else if (track === 'brown_noise' || track === 'rain' || track === 'waves' || track === 'fireplace') {
      // Generate noise buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise integration
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      if (track === 'brown_noise') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        this.activeNodes.push(whiteNoise, filter);
      } else if (track === 'rain') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        const highFilter = ctx.createBiquadFilter();
        highFilter.type = 'highpass';
        highFilter.frequency.setValueAtTime(400, ctx.currentTime);

        whiteNoise.connect(highFilter);
        highFilter.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        this.activeNodes.push(whiteNoise, filter, highFilter);
      } else if (track === 'waves') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);

        // LFO for wave swells
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10 second swell cycle

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(180, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        whiteNoise.connect(filter);
        filter.connect(masterGain);

        whiteNoise.start();
        lfo.start();
        this.activeNodes.push(whiteNoise, filter, lfo, lfoGain);
      } else if (track === 'fireplace') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        this.activeNodes.push(whiteNoise, filter);

        // Random crackle pops
        const crackleInterval = window.setInterval(() => {
          if (!this.ctx || this.currentTrack !== 'fireplace') return;
          try {
            const popOsc = this.ctx.createOscillator();
            const popGain = this.ctx.createGain();
            popOsc.type = 'triangle';
            popOsc.frequency.setValueAtTime(150 + Math.random() * 800, this.ctx.currentTime);
            popGain.gain.setValueAtTime(0.08 * Math.random(), this.ctx.currentTime);
            popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
            popOsc.connect(popGain);
            popGain.connect(masterGain);
            popOsc.start();
            popOsc.stop(this.ctx.currentTime + 0.05);
          } catch {
            // Ignored
          }
        }, 180);

        this.activeNodes.push(crackleInterval);
      }
    } else if (track === 'meditation_432hz') {
      /**
       * 432 Hz Universal Healing Harmony
       * Verdi tuning, deep somatic relaxation, peaceful heart rate synchrony.
       * Stereo: 431.5 Hz (L) & 432.5 Hz (R) for 1.0Hz ultra-calm meditative drift.
       */
      const merger = ctx.createChannelMerger(2);

      // Left channels (fundamental + sub + fifth)
      const oscL1 = ctx.createOscillator();
      oscL1.type = 'sine';
      oscL1.frequency.setValueAtTime(431.5, ctx.currentTime);

      const oscLSub = ctx.createOscillator();
      oscLSub.type = 'sine';
      oscLSub.frequency.setValueAtTime(215.75, ctx.currentTime);

      const oscLFifth = ctx.createOscillator();
      oscLFifth.type = 'sine';
      oscLFifth.frequency.setValueAtTime(647.25, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.25, ctx.currentTime);

      oscL1.connect(gainL);
      oscLSub.connect(gainL);
      oscLFifth.connect(gainL);
      gainL.connect(merger, 0, 0);

      // Right channels (fundamental + sub + octave)
      const oscR1 = ctx.createOscillator();
      oscR1.type = 'sine';
      oscR1.frequency.setValueAtTime(432.5, ctx.currentTime);

      const oscRSub = ctx.createOscillator();
      oscRSub.type = 'sine';
      oscRSub.frequency.setValueAtTime(216.25, ctx.currentTime);

      const oscROctave = ctx.createOscillator();
      oscROctave.type = 'sine';
      oscROctave.frequency.setValueAtTime(864.0, ctx.currentTime);

      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.25, ctx.currentTime);

      oscR1.connect(gainR);
      oscRSub.connect(gainR);
      oscROctave.connect(gainR);
      gainR.connect(merger, 0, 1);

      // Lowpass breath filter (sweeping like gentle meditative breath)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.07, ctx.currentTime); // ~14 second breathing swell

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      merger.connect(filter);
      filter.connect(masterGain);

      oscL1.start();
      oscLSub.start();
      oscLFifth.start();
      oscR1.start();
      oscRSub.start();
      oscROctave.start();
      lfo.start();

      this.activeNodes.push(
        oscL1,
        oscLSub,
        oscLFifth,
        gainL,
        oscR1,
        oscRSub,
        oscROctave,
        gainR,
        merger,
        filter,
        lfo,
        lfoGain
      );

      // Gentle recurring 432Hz singing bowl strike every 24 seconds
      const bowlInterval = window.setInterval(() => {
        if (!this.ctx || this.currentTrack !== 'meditation_432hz') return;
        try {
          this.triggerSingingBowlTone(432, 6.0, masterGain);
        } catch {
          // Ignored
        }
      }, 24000);

      // Trigger initial soft bowl
      setTimeout(() => {
        if (this.ctx && this.currentTrack === 'meditation_432hz') {
          this.triggerSingingBowlTone(432, 7.0, masterGain);
        }
      }, 250);

      this.activeNodes.push(bowlInterval);
    } else if (track === 'solfeggio_528hz') {
      /**
       * 528 Hz Solfeggio — Transformation & Love
       * Frequency of miracles, cellular repair, and deep emotional clarity.
       * Stereo detune: 525.5 Hz (L) & 530.5 Hz (R) creating 5.0 Hz Theta wave state.
       */
      const merger = ctx.createChannelMerger(2);

      // Left Channel
      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(525.5, ctx.currentTime);

      const oscLSub = ctx.createOscillator();
      oscLSub.type = 'sine';
      oscLSub.frequency.setValueAtTime(262.75, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.24, ctx.currentTime);

      oscL.connect(gainL);
      oscLSub.connect(gainL);
      gainL.connect(merger, 0, 0);

      // Right Channel
      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(530.5, ctx.currentTime);

      const oscRSub = ctx.createOscillator();
      oscRSub.type = 'sine';
      oscRSub.frequency.setValueAtTime(265.25, ctx.currentTime);

      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.24, ctx.currentTime);

      oscR.connect(gainR);
      oscRSub.connect(gainR);
      gainR.connect(merger, 0, 1);

      // Shimmer Angelic Fifth (792 Hz) and Octave (1056 Hz)
      const oscShimmer = ctx.createOscillator();
      oscShimmer.type = 'sine';
      oscShimmer.frequency.setValueAtTime(792, ctx.currentTime);
      const gainShimmer = ctx.createGain();
      gainShimmer.gain.setValueAtTime(0.06, ctx.currentTime);

      const oscOctave = ctx.createOscillator();
      oscOctave.type = 'sine';
      oscOctave.frequency.setValueAtTime(1056, ctx.currentTime);
      const gainOctave = ctx.createGain();
      gainOctave.gain.setValueAtTime(0.03, ctx.currentTime);

      oscShimmer.connect(gainShimmer);
      oscOctave.connect(gainOctave);
      gainShimmer.connect(merger, 0, 0);
      gainOctave.connect(merger, 0, 1);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      merger.connect(filter);
      filter.connect(masterGain);

      oscL.start();
      oscLSub.start();
      oscR.start();
      oscRSub.start();
      oscShimmer.start();
      oscOctave.start();
      lfo.start();

      this.activeNodes.push(
        oscL,
        oscLSub,
        gainL,
        oscR,
        oscRSub,
        gainR,
        oscShimmer,
        gainShimmer,
        oscOctave,
        gainOctave,
        merger,
        filter,
        lfo,
        lfoGain
      );

      // Periodic resonant 528Hz singing bowl bell every 26 seconds
      const bowlInterval = window.setInterval(() => {
        if (!this.ctx || this.currentTrack !== 'solfeggio_528hz') return;
        try {
          this.triggerSingingBowlTone(528, 6.5, masterGain);
        } catch {
          // Ignored
        }
      }, 26000);

      setTimeout(() => {
        if (this.ctx && this.currentTrack === 'solfeggio_528hz') {
          this.triggerSingingBowlTone(528, 7.0, masterGain);
        }
      }, 250);

      this.activeNodes.push(bowlInterval);
    } else if (track === 'theta_meditation') {
      /**
       * Theta 6 Hz — Deep Transcendence & Subconscious Flow
       * Carrier: 216 Hz (L) & 222 Hz (R) -> 6.0 Hz pure Theta wave.
       * Sub-carrier: 108 Hz (L) & 114 Hz (R).
       * Plus cosmic ambient warmth layer.
       */
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(216, ctx.currentTime);

      const oscLSub = ctx.createOscillator();
      oscLSub.type = 'sine';
      oscLSub.frequency.setValueAtTime(108, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.3, ctx.currentTime);

      oscL.connect(gainL);
      oscLSub.connect(gainL);
      gainL.connect(merger, 0, 0);

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(222, ctx.currentTime);

      const oscRSub = ctx.createOscillator();
      oscRSub.type = 'sine';
      oscRSub.frequency.setValueAtTime(114, ctx.currentTime);

      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.3, ctx.currentTime);

      oscR.connect(gainR);
      oscRSub.connect(gainR);
      gainR.connect(merger, 0, 1);

      // Deep celestial warm ambient cushion
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 1.8;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(190, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      merger.connect(masterGain);

      oscL.start();
      oscLSub.start();
      oscR.start();
      oscRSub.start();
      noiseSource.start();

      this.activeNodes.push(
        oscL,
        oscLSub,
        gainL,
        oscR,
        oscRSub,
        gainR,
        merger,
        noiseSource,
        noiseFilter,
        noiseGain
      );
    } else if (track === 'tibetan_bowls') {
      /**
       * Tibetan Monastery Bowls & Temple Drone
       * Warm resonant drone + recurring monastery singing bowl strikes.
       */
      const droneL = ctx.createOscillator();
      droneL.type = 'sine';
      droneL.frequency.setValueAtTime(108, ctx.currentTime);

      const droneR = ctx.createOscillator();
      droneR.type = 'sine';
      droneR.frequency.setValueAtTime(216, ctx.currentTime);

      const droneFifth = ctx.createOscillator();
      droneFifth.type = 'sine';
      droneFifth.frequency.setValueAtTime(324, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(300, ctx.currentTime);

      droneL.connect(droneGain);
      droneR.connect(droneGain);
      droneFifth.connect(droneGain);
      droneGain.connect(droneFilter);
      droneFilter.connect(masterGain);

      droneL.start();
      droneR.start();
      droneFifth.start();

      this.activeNodes.push(droneL, droneR, droneFifth, droneGain, droneFilter);

      let step = 0;
      const bowlInterval = window.setInterval(() => {
        if (!this.ctx || this.currentTrack !== 'tibetan_bowls') return;
        try {
          const freqs = [216, 432, 324];
          const chosenFreq = freqs[step % freqs.length];
          step++;
          this.triggerSingingBowlTone(chosenFreq, 8.0, masterGain);
        } catch {
          // Ignored
        }
      }, 18000);

      // Strike immediate starting bowl
      setTimeout(() => {
        if (this.ctx && this.currentTrack === 'tibetan_bowls') {
          this.triggerSingingBowlTone(216, 9.0, masterGain);
        }
      }, 300);

      this.activeNodes.push(bowlInterval);
    } else if (track === 'solfeggio_396hz') {
      /**
       * 396 Hz Solfeggio — Liberation from Fear & Grounding
       * Grounding root chakra tone, releases emotional baggage and mental clutter.
       */
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(394.5, ctx.currentTime);

      const oscLSub = ctx.createOscillator();
      oscLSub.type = 'sine';
      oscLSub.frequency.setValueAtTime(197.25, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.26, ctx.currentTime);

      oscL.connect(gainL);
      oscLSub.connect(gainL);
      gainL.connect(merger, 0, 0);

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(397.5, ctx.currentTime);

      const oscRSub = ctx.createOscillator();
      oscRSub.type = 'sine';
      oscRSub.frequency.setValueAtTime(198.75, ctx.currentTime);

      const oscRFifth = ctx.createOscillator();
      oscRFifth.type = 'sine';
      oscRFifth.frequency.setValueAtTime(594, ctx.currentTime);

      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.26, ctx.currentTime);

      oscR.connect(gainR);
      oscRSub.connect(gainR);
      oscRFifth.connect(gainR);
      gainR.connect(merger, 0, 1);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.05, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(100, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      merger.connect(filter);
      filter.connect(masterGain);

      oscL.start();
      oscLSub.start();
      oscR.start();
      oscRSub.start();
      oscRFifth.start();
      lfo.start();

      this.activeNodes.push(
        oscL,
        oscLSub,
        gainL,
        oscR,
        oscRSub,
        oscRFifth,
        gainR,
        merger,
        filter,
        lfo,
        lfoGain
      );

      // Low grounding singing bowl every 25 seconds
      const bowlInterval = window.setInterval(() => {
        if (!this.ctx || this.currentTrack !== 'solfeggio_396hz') return;
        try {
          this.triggerSingingBowlTone(396, 6.5, masterGain);
        } catch {
          // Ignored
        }
      }, 25000);

      setTimeout(() => {
        if (this.ctx && this.currentTrack === 'solfeggio_396hz') {
          this.triggerSingingBowlTone(396, 7.0, masterGain);
        }
      }, 300);

      this.activeNodes.push(bowlInterval);
    } else if (track === 'solfeggio_639hz') {
      /**
       * 639 Hz Solfeggio — Heart Coherence & Relationship Harmony
       * Nurturing heart chakra resonance, emotional balance, empathy, and serene gratitude.
       */
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(637, ctx.currentTime);

      const oscLSub = ctx.createOscillator();
      oscLSub.type = 'sine';
      oscLSub.frequency.setValueAtTime(318.5, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.22, ctx.currentTime);

      oscL.connect(gainL);
      oscLSub.connect(gainL);
      gainL.connect(merger, 0, 0);

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(641, ctx.currentTime);

      const oscRSub = ctx.createOscillator();
      oscRSub.type = 'sine';
      oscRSub.frequency.setValueAtTime(320.5, ctx.currentTime);

      const oscRFifth = ctx.createOscillator();
      oscRFifth.type = 'sine';
      oscRFifth.frequency.setValueAtTime(958.5, ctx.currentTime);

      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.22, ctx.currentTime);

      oscR.connect(gainR);
      oscRSub.connect(gainR);
      oscRFifth.connect(gainR);
      gainR.connect(merger, 0, 1);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      merger.connect(filter);
      filter.connect(masterGain);

      oscL.start();
      oscLSub.start();
      oscR.start();
      oscRSub.start();
      oscRFifth.start();
      lfo.start();

      this.activeNodes.push(
        oscL,
        oscLSub,
        gainL,
        oscR,
        oscRSub,
        oscRFifth,
        gainR,
        merger,
        filter,
        lfo,
        lfoGain
      );

      // Sweet heart chime strike every 24 seconds
      const bowlInterval = window.setInterval(() => {
        if (!this.ctx || this.currentTrack !== 'solfeggio_639hz') return;
        try {
          this.triggerSingingBowlTone(639, 6.0, masterGain);
        } catch {
          // Ignored
        }
      }, 24000);

      setTimeout(() => {
        if (this.ctx && this.currentTrack === 'solfeggio_639hz') {
          this.triggerSingingBowlTone(639, 6.5, masterGain);
        }
      }, 300);

      this.activeNodes.push(bowlInterval);
    } else if (track === 'pink_noise') {
      /**
       * Pink noise — equal energy per octave, softer and less hissy than white noise.
       * Gently low-passed so it sits comfortably for long listening.
       */
      const source = ctx.createBufferSource();
      source.buffer = this.createPinkNoiseBuffer(ctx, 8);
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      source.start();
      this.activeNodes.push(source, filter, gain);
    } else if (track === 'delta_sleep') {
      /**
       * Delta binaural — 100 Hz (L) & 102 Hz (R): a 2 Hz difference on a low carrier,
       * very soft, over a warm brown-noise bed. Needs headphones for the beat.
       */
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(100, ctx.currentTime);
      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(102, ctx.currentTime);

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.2, ctx.currentTime);
      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.2, ctx.currentTime);

      oscL.connect(gainL);
      gainL.connect(merger, 0, 0);
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1);

      const toneFilter = ctx.createBiquadFilter();
      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(260, ctx.currentTime);
      merger.connect(toneFilter);
      toneFilter.connect(masterGain);

      const bed = ctx.createBufferSource();
      bed.buffer = this.createBrownNoiseBuffer(ctx, 6, 3.0);
      bed.loop = true;
      const bedFilter = ctx.createBiquadFilter();
      bedFilter.type = 'lowpass';
      bedFilter.frequency.setValueAtTime(180, ctx.currentTime);
      const bedGain = ctx.createGain();
      bedGain.gain.setValueAtTime(0.32, ctx.currentTime);
      bed.connect(bedFilter);
      bedFilter.connect(bedGain);
      bedGain.connect(masterGain);

      oscL.start();
      oscR.start();
      bed.start();
      this.activeNodes.push(oscL, oscR, gainL, gainR, merger, toneFilter, bed, bedFilter, bedGain);
    } else if (track === 'breath_pacer') {
      /**
       * Breath pacer — a soft tone (G3 + fifth) and a breath-like air layer that
       * swell for 5.5 s (inhale) and fall for 5.5 s (exhale): ≈5.5 breaths/min,
       * the pace used in resonance-breathing practice. Cycles are scheduled on
       * the audio clock a little ahead so they stay steady; the page reads
       * getTrackStartedAt() to keep its circle in step.
       */
      const inhale = BREATH_PACER_INHALE_SECONDS;
      const exhale = BREATH_PACER_EXHALE_SECONDS;
      const cycle = inhale + exhale;
      const lead = 0.08;
      const t0 = ctx.currentTime + lead;
      this.trackStartedAt = Date.now() + lead * 1000;

      const swell = ctx.createGain();
      swell.gain.setValueAtTime(0.03, ctx.currentTime);

      const tone = ctx.createOscillator();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(196, ctx.currentTime);
      const fifth = ctx.createOscillator();
      fifth.type = 'sine';
      fifth.frequency.setValueAtTime(294, ctx.currentTime);
      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.5, ctx.currentTime);
      const fifthGain = ctx.createGain();
      fifthGain.gain.setValueAtTime(0.14, ctx.currentTime);
      tone.connect(toneGain);
      fifth.connect(fifthGain);
      toneGain.connect(swell);
      fifthGain.connect(swell);

      const air = ctx.createBufferSource();
      air.buffer = this.createPinkNoiseBuffer(ctx, 4);
      air.loop = true;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(700, ctx.currentTime);
      airFilter.Q.setValueAtTime(0.7, ctx.currentTime);
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.35, ctx.currentTime);
      air.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(swell);

      const warmth = ctx.createBiquadFilter();
      warmth.type = 'lowpass';
      warmth.frequency.setValueAtTime(900, ctx.currentTime);
      swell.connect(warmth);
      warmth.connect(masterGain);

      tone.start();
      fifth.start();
      air.start();
      this.activeNodes.push(tone, fifth, toneGain, fifthGain, air, airFilter, airGain, swell, warmth);

      const low = 0.03;
      const high = 0.3;
      let scheduledCycles = 0;
      const scheduleAhead = () => {
        if (!this.ctx || this.currentTrack !== 'breath_pacer') return;
        // Keep ~two cycles queued on the audio clock.
        while (t0 + scheduledCycles * cycle < this.ctx.currentTime + cycle * 2) {
          const start = t0 + scheduledCycles * cycle;
          swell.gain.setValueAtTime(low, start);
          swell.gain.linearRampToValueAtTime(high, start + inhale);
          swell.gain.linearRampToValueAtTime(low, start + cycle);
          tone.frequency.setValueAtTime(196, start);
          tone.frequency.linearRampToValueAtTime(207.65, start + inhale);
          tone.frequency.linearRampToValueAtTime(196, start + cycle);
          airFilter.frequency.setValueAtTime(600, start);
          airFilter.frequency.linearRampToValueAtTime(1100, start + inhale);
          airFilter.frequency.linearRampToValueAtTime(600, start + cycle);
          scheduledCycles++;
        }
      };
      scheduleAhead();
      const breathInterval = window.setInterval(scheduleAhead, 2000);
      this.activeNodes.push(breathInterval);
    }
  }

  /**
   * Synthesizes a resonant singing bowl tone with realistic harmonic decay
   */
  public triggerSingingBowlTone(baseFreq: number, duration: number = 6.0, targetNode?: AudioNode) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const partials = [
      { ratio: 1.0, gain: 0.28 },
      { ratio: 1.5, gain: 0.16 },
      { ratio: 2.01, gain: 0.1 },
      { ratio: 2.76, gain: 0.05 },
      { ratio: 3.82, gain: 0.02 },
    ];

    const dest = targetNode || ctx.destination;

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
  }

  /**
   * Public helper to trigger an interactive singing bowl tone directly
   */
  public playTibetanSingingBowl(baseFreq: number = 432, duration: number = 6.5) {
    if (this.isMuted) return;
    this.triggerSingingBowlTone(baseFreq, duration);
  }

  /**
   * Resonant Zen meditation singing bowl sound
   */
  public playFocusStartGong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const baseFreq = 432; // Harmonic 432Hz
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2.01, baseFreq * 2.76];
    const gains = [0.35, 0.18, 0.12, 0.05];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const dur = 3.5;
      gain.gain.setValueAtTime(gains[idx], ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    });
  }

  /**
   * Crystalline victory completion chime
   */
  public playFocusCompleteChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Ascending chord: C5 -> E5 -> G5 -> C6
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.8);
    });
  }

  /**
   * Harmonious success chord
   */
  public playSuccessChord() {
    if (this.isMuted) return;
    this.playFocusCompleteChime();
  }

  /**
   * Subtle tactile tap chime
   */
  public playTapChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Safe browser haptic feedback trigger
   */
  public triggerHaptic(pattern: number | number[]) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate(pattern);
      }
    } catch {
      // Ignored if browser does not support or grant vibration
    }
  }

  /**
   * HEALTH Micro-Habit Cue
   * Acoustic Metaphor: Warm, organic vitality bloom and cellular restoration.
   * Frequencies: Solfeggio 528 Hz (Vitality/Healing tone) + Major Third 660 Hz + Octave 1056 Hz.
   * Haptic: Gentle rhythmic heartbeat pulse [35ms, 50ms pause, 40ms].
   */
  public playHealthHabitCue() {
    this.triggerHaptic([35, 50, 40]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const baseFreq = 528; // Harmonic Solfeggio 528Hz
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 2];
    const gains = [0.28, 0.15, 0.08];

    // Lowpass filter to ensure organic, warm acoustic resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.connect(ctx.destination);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle warm pitch vibrato
      osc.frequency.setTargetAtTime(freq * 1.004, ctx.currentTime + 0.1, 0.2);

      const dur = 1.1;
      // Gentle soft attack (30ms) to feel organic rather than harsh
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gains[idx], ctx.currentTime + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(filter);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    });
  }

  /**
   * LEARNING Micro-Habit Cue
   * Acoustic Metaphor: "Eureka!", intellectual illumination, neuron synaptic firing.
   * Frequencies: Ascending 4-note crystalline glissando [E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz) -> E6 (1318Hz)].
   * Haptic: Crisp micro-double-tap [15ms, 35ms pause, 25ms].
   */
  public playLearningHabitCue() {
    this.triggerHaptic([15, 35, 25]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Ascending inquisitive chord
    const notes = [659.25, 830.61, 987.77, 1318.51];
    const noteInterval = 0.065; // Staggered arpeggio

    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * noteInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine with bright high clarity
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const noteDuration = 0.85;
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  /**
   * DISCIPLINE Micro-Habit Cue
   * Acoustic Metaphor: Resolute bedrock anchor, unwavering resolve, grounding stoic strike.
   * Frequencies: Solid 330 Hz (E4) chord with 165 Hz sub-weight and 495 Hz (B4) perfect fifth.
   * Haptic: Firm assertive singular anchor pulse [65ms].
   */
  public playDisciplineHabitCue() {
    this.triggerHaptic([65]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const baseFreq = 329.63; // E4
    const partials = [
      { freq: 164.81, gain: 0.22, dur: 0.25, type: 'sine' as OscillatorType }, // Grounding sub-transient
      { freq: baseFreq, gain: 0.32, dur: 0.95, type: 'triangle' as OscillatorType }, // Solid body
      { freq: 493.88, gain: 0.18, dur: 0.75, type: 'sine' as OscillatorType }, // Perfect fifth resolve
      { freq: 659.25, gain: 0.12, dur: 0.6, type: 'sine' as OscillatorType }, // Upper bell clarity
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, ctx.currentTime);

      // Fast punchy attack (8ms) followed by confident steady decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + p.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + p.dur);
    });
  }

  /**
   * MINDSET Micro-Habit Cue
   * Acoustic Metaphor: Zen bell / Tibetan singing bowl serenity.
   * Frequencies: 432 Hz fundamental with 864 Hz octave overtone.
   * Haptic: Smooth meditative wave [25ms, 50ms pause, 20ms].
   */
  public playMindsetHabitCue() {
    this.triggerHaptic([25, 50, 20]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const freqs = [432, 864];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const dur = 1.4;
      gain.gain.setValueAtTime(idx === 0 ? 0.26 : 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    });
  }

  /**
   * Generic / Fallback Micro-Habit Cue
   * Harmonious dual chime [C6 (1046Hz) -> G6 (1568Hz)]
   * Haptic: Standard clean confirmation [30ms].
   */
  public playGenericHabitCue() {
    this.triggerHaptic([30]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const notes = [1046.5, 1567.98];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const dur = 0.7;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  /**
   * Undo / Untoggle Micro-Habit Cue
   * Acoustic Metaphor: Subtle soft de-escalation tone.
   * Frequencies: Soft descending slide from 580 Hz to 360 Hz.
   * Haptic: Subtle micro-tick [12ms].
   */
  public playMicroHabitUndoCue() {
    this.triggerHaptic([12]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  /**
   * Custom Category Micro-Habit Cue
   * Synthesizes a bespoke harmonic chord chime dynamically keyed to the category's unique color/name.
   */
  public playCustomCategoryCue(categoryName: string, colorHex?: string) {
    this.triggerHaptic([30, 35, 25]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Derive base frequency from color or name hash
    let hash = 0;
    const seedStr = (colorHex || categoryName || 'Custom').toLowerCase();
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    // Map into a soothing harmonic pentatonic base frequency range (440Hz - 660Hz)
    const baseFrequencies = [440, 493.88, 528, 587.33, 659.25, 740];
    const root = baseFrequencies[positiveHash % baseFrequencies.length];
    const chordNotes = [root, root * 1.25, root * 1.5]; // Root, major third, perfect fifth

    chordNotes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const dur = 0.8;
      gain.gain.setValueAtTime(0.18 / (idx + 1), startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  /**
   * Dispatches category-specific acoustic cue & haptic pattern
   */
  public playMicroHabitCue(category: string, action: 'complete' | 'undo' = 'complete', customColor?: string) {
    if (action === 'undo') {
      this.playMicroHabitUndoCue();
      return;
    }

    const cat = (category || '').trim().toLowerCase();
    if (cat.includes('health')) {
      this.playHealthHabitCue();
    } else if (cat.includes('learn')) {
      this.playLearningHabitCue();
    } else if (cat.includes('discipline')) {
      this.playDisciplineHabitCue();
    } else if (cat.includes('mindset')) {
      this.playMindsetHabitCue();
    } else if (cat.includes('clarity')) {
      this.playGenericHabitCue();
    } else {
      // Dynamic custom category cue
      this.playCustomCategoryCue(category, customColor);
    }
  }
}

export const soundSynthesizer = new SoundSynthesizer();
