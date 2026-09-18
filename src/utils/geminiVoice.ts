/**
 * GeminiVoice — optional natural-sounding narration via Gemini TTS.
 * Used by VoiceGuide when the user has added a Gemini API key in Settings;
 * otherwise VoiceGuide falls back to the browser's built-in voice.
 */

export const GEMINI_TTS_VOICES = [
  { id: 'Kore', label: 'Kore — warm, steady (recommended)' },
  { id: 'Aoede', label: 'Aoede — soft, breathy' },
  { id: 'Zephyr', label: 'Zephyr — bright, gentle' },
  { id: 'Leda', label: 'Leda — youthful, clear' },
  { id: 'Puck', label: 'Puck — upbeat' },
  { id: 'Charon', label: 'Charon — deep, calm' },
  { id: 'Fenrir', label: 'Fenrir — grounded, firm' },
  { id: 'Orus', label: 'Orus — smooth, low' },
];

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const STYLE_PREFIX =
  'Speak very slowly and softly, with calm, warm pauses, like a gentle meditation guide leading a quiet session: ';

type PcmClip = { sampleRate: number; samples: Float32Array };

class GeminiVoice {
  private cache = new Map<string, Promise<PcmClip | null>>();
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;

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
    return `${voice}::${text}`;
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
   * Play a cue. Resolves true if Gemini audio played (or started), false if unavailable
   * so the caller can fall back to the browser voice.
   */
  public async speak(
    text: string,
    apiKey: string,
    voice: string,
    volume: number,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    const key = this.cacheKey(text, voice);
    if (!this.cache.has(key)) this.cache.set(key, this.synthesize(text, apiKey, voice));
    const clip = await this.cache.get(key)!;
    if (!clip) return false;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') await ctx.resume();
      this.stop();
      const buffer = ctx.createBuffer(1, clip.samples.length, clip.sampleRate);
      buffer.copyToChannel(clip.samples, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      this.gain!.gain.value = Math.max(0, Math.min(1, volume));
      src.connect(this.gain!);
      src.onended = () => {
        if (this.currentSource === src) this.currentSource = null;
        onEnd?.();
      };
      this.currentSource = src;
      onStart?.();
      src.start();
      return true;
    } catch {
      return false;
    }
  }

  public setVolume(volume: number) {
    if (this.gain) this.gain.gain.value = Math.max(0, Math.min(1, volume));
  }

  public isPlaying(): boolean {
    return this.currentSource !== null;
  }

  public pause() {
    this.ctx?.suspend().catch(() => {});
  }

  public resume() {
    this.ctx?.resume().catch(() => {});
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch {
        /* ignore */
      }
      this.currentSource = null;
    }
  }

  /** Quick connectivity/key check used by Settings. */
  public async test(apiKey: string, voice: string): Promise<boolean> {
    const clip = await this.synthesize('Welcome. Take a slow breath, and let the day soften.', apiKey, voice);
    if (!clip) return false;
    this.cache.set(this.cacheKey('Welcome. Take a slow breath, and let the day soften.', voice), Promise.resolve(clip));
    return this.speak('Welcome. Take a slow breath, and let the day soften.', apiKey, voice, 1);
  }
}

export const geminiVoice = new GeminiVoice();
