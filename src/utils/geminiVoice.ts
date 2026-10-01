/**
 * GeminiVoice — optional natural-sounding narration via Gemini TTS.
 * Used by VoiceGuide when the user has added a Gemini API key in Settings;
 * otherwise VoiceGuide falls back to the browser's built-in voice.
 */

import { N_ } from '../i18n';

export const GEMINI_TTS_VOICES = [
  { id: 'Kore', label: N_('Kore — warm, steady (recommended)') },
  { id: 'Aoede', label: N_('Aoede — soft, breathy') },
  { id: 'Zephyr', label: N_('Zephyr — bright, gentle') },
  { id: 'Leda', label: N_('Leda — youthful, clear') },
  { id: 'Puck', label: N_('Puck — upbeat') },
  { id: 'Charon', label: N_('Charon — deep, calm') },
  { id: 'Fenrir', label: N_('Fenrir — grounded, firm') },
  { id: 'Orus', label: N_('Orus — smooth, low') },
];

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const STYLE_PREFIX =
  'Speak in English (en-US). Speak very slowly and softly, with calm, warm pauses, like a gentle meditation guide leading a quiet session: ';

type PcmClip = { sampleRate: number; samples: Float32Array };

export class GeminiVoice {
  private cache = new Map<string, Promise<PcmClip | null>>();
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private requestedVolume = 1;
  private playbackGeneration = 0;
  private paused = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      this.ctx = new Ctor();
      this.gain = this.ctx.createGain();
      this.gain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private cacheKey(text: string, voice: string) {
    return `en-US::${voice}::${text}`;
  }

  /** Warm the cache for upcoming cues (fire and forget). */
  public prefetch(texts: string[], apiKey: string, voice: string) {
    for (const t of texts) {
      const key = this.cacheKey(t, voice);
      if (!this.cache.has(key)) this.cache.set(key, this.synthesize(t, apiKey, voice));
    }
  }

  private async synthesize(text: string, apiKey: string, voice: string): Promise<PcmClip | null> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ role: 'user', parts: [{ text: STYLE_PREFIX + text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      } as any);
      const part = (res as any)?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data);
      const b64: string | undefined = part?.inlineData?.data;
      const mime: string = part?.inlineData?.mimeType || 'audio/L16;codec=pcm;rate=24000';
      if (!b64) return null;
      const rateMatch = /rate=(\d+)/.exec(mime);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      // 16-bit little-endian signed PCM → float
      const view = new DataView(bytes.buffer);
      const n = Math.floor(bytes.length / 2);
      const samples = new Float32Array(n);
      for (let i = 0; i < n; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
      return { sampleRate, samples };
    } catch (err) {
      console.warn('[GeminiVoice] synthesis failed, falling back to built-in voice', err);
      return null;
    }
  }

  /**
   * Play an English cue. Resolves true only when playback starts, false for a
   * failed or superseded request. VoiceGuide separately guards browser fallback.
   */
  public async speak(
    text: string,
    apiKey: string,
    voice: string,
    volume: number,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    const generation = ++this.playbackGeneration;
    this.stopCurrentSource();
    if (this.paused) return false;
    this.setVolume(volume);
    const key = this.cacheKey(text, voice);
    if (!this.cache.has(key)) this.cache.set(key, this.synthesize(text, apiKey, voice));
    const clip = await this.cache.get(key)!;
    if (!clip || generation !== this.playbackGeneration || this.paused) return false;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') await ctx.resume();
      if (generation !== this.playbackGeneration || this.paused) return false;
      const buffer = ctx.createBuffer(1, clip.samples.length, clip.sampleRate);
      buffer.copyToChannel(clip.samples, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      this.gain!.gain.value = this.requestedVolume;
      src.connect(this.gain!);
      src.onended = () => {
        if (this.currentSource !== src) return;
        this.currentSource = null;
        try { src.disconnect(); } catch { /* The context may already be closed. */ }
        onEnd?.();
      };
      this.currentSource = src;
      src.start();
      if (this.currentSource === src && generation === this.playbackGeneration && !this.paused) onStart?.();
      return true;
    } catch {
      if (generation === this.playbackGeneration) this.stopCurrentSource();
      return false;
    }
  }

  public setVolume(volume: number) {
    this.requestedVolume = Math.max(0, Math.min(1, volume));
    if (this.gain) this.gain.gain.value = this.requestedVolume;
  }

  public isPlaying(): boolean {
    return this.currentSource !== null;
  }

  public pause() {
    this.paused = true;
    this.playbackGeneration++;
    this.ctx?.suspend().catch(() => {});
  }

  public resume() {
    this.paused = false;
    const ctx = this.ctx;
    ctx?.resume().then(() => {
      // A later pause wins even when an earlier resume settles afterward.
      if (this.paused) ctx.suspend().catch(() => {});
    }).catch(() => {});
  }

  public stop() {
    this.playbackGeneration++;
    this.paused = false;
    this.stopCurrentSource();
  }

  private stopCurrentSource() {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        /* ignore */
      }
      this.currentSource = null;
    }
  }

  /** Quick connectivity/key check used by Settings. */
  public async test(apiKey: string, voice: string): Promise<boolean> {
    const generation = ++this.playbackGeneration;
    this.stopCurrentSource();
    if (this.paused) return false;
    const phrase = 'Welcome. Take a slow breath, and let the day soften.';
    const clip = await this.synthesize(phrase, apiKey, voice);
    if (!clip || generation !== this.playbackGeneration || this.paused) return false;
    this.cache.set(this.cacheKey(phrase, voice), Promise.resolve(clip));
    return this.speak(phrase, apiKey, voice, this.requestedVolume);
  }
}

export const geminiVoice = new GeminiVoice();
