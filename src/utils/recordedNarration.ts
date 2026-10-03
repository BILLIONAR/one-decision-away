import type { EnglishRecordedCueAsset, EnglishRecordedNarration, GuidedCueContext } from './voiceGuide';
import { getAppBase } from './routing';

export interface RecordedCueAsset extends EnglishRecordedCueAsset {
  text: string;
  file: string;
  bytes: number;
  scheduledStartSeconds: number;
  slotSeconds: number;
  containerDurationSeconds: number;
}

export interface RecordedNarrationOptions {
  fetch?: typeof fetch;
  cacheStorage?: CacheStorage | null;
  createContext?: () => AudioContext;
  sha256?: (bytes: ArrayBuffer) => Promise<string>;
  now?: () => number;
  basePath?: string;
}

type Playback = {
  buffer: AudioBuffer;
  offset: number;
  startedAt: number;
  deadline: number;
  pausedAt: number;
  onEnd: () => void;
};
type Pending = { controller: AbortController; promise: Promise<AudioBuffer> };
type CueRequest = { text: string; context: GuidedCueContext; deadline: number; pausedAt: number; onStart: () => void; onEnd: () => void };
const keyOf = (asset: Pick<RecordedCueAsset, 'sessionId' | 'cueIndex'>) => `${asset.sessionId}:${asset.cueIndex}`;
const hash = async (bytes: ArrayBuffer) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
  .map(byte => byte.toString(16).padStart(2, '0')).join('');

/** Static English clips only. Construction never fetches or creates an audio context. */
export class RecordedNarration implements EnglishRecordedNarration {
  readonly assets: readonly RecordedCueAsset[];
  private readonly options: RecordedNarrationOptions;
  private readonly now: () => number;
  private readonly sha256: (bytes: ArrayBuffer) => Promise<string>;
  private readonly basePath: string;
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private volume = 1;
  private generation = 0;
  private paused = false;
  private sessionId: string | null = null;
  private source: AudioBufferSourceNode | null = null;
  private playback: Playback | null = null;
  private decoded = new Map<string, AudioBuffer>();
  private pending = new Map<string, Pending>();
  private currentLoadKey: string | null = null;
  private currentRequest: CueRequest | null = null;
  private failedRequest: CueRequest | null = null;

  constructor(assets: readonly RecordedCueAsset[], options: RecordedNarrationOptions = {}) {
    this.assets = assets;
    this.options = options;
    this.now = options.now ?? (() => performance.now());
    this.sha256 = options.sha256 ?? hash;
    this.basePath = options.basePath ?? getAppBase();
  }

  isAvailable(): boolean {
    return this.assets.length > 0 && (Boolean(this.options.createContext) || (typeof window !== 'undefined'
      && Boolean(window.AudioContext || (window as any).webkitAudioContext)))
      && (Boolean(this.options.sha256) || typeof crypto !== 'undefined' && Boolean(crypto.subtle));
  }

  hasCue(text: string, context?: GuidedCueContext): boolean {
    const asset = this.find(context);
    return Boolean(asset && asset.text === text && asset.language === 'en-US' && asset.version
      && /^[a-f0-9]{64}$/i.test(asset.sourceTextHash) && /^[a-f0-9]{64}$/i.test(asset.checksum)
      && asset.bytes > 0 && asset.decodedDurationSeconds > 0
      && Math.max(asset.decodedDurationSeconds, asset.containerDurationSeconds) + 0.25 <= asset.slotSeconds);
  }

  private find(context?: GuidedCueContext) {
    return context && this.assets.find(asset => asset.sessionId === context.sessionId && asset.cueIndex === context.cueIndex);
  }

  private getContext() {
    if (!this.context) {
      const Ctor = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
      this.context = this.options.createContext ? this.options.createContext() : new Ctor();
      this.gain = this.context.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.context.destination);
    }
    return this.context;
  }

  /** Call synchronously from the trusted Start/Preview/Replay gesture. */
  async unlockAudio(): Promise<boolean> {
    try {
      const context = this.getContext();
      await context.resume();
      return context.state === 'running';
    } catch { return false; }
  }

  private async ensureRunning(audio: AudioContext): Promise<boolean> {
    if (audio.state === 'running') return true;
    if (audio.state !== 'suspended') return false;
    let timer: ReturnType<typeof setTimeout>;
    try {
      await Promise.race([audio.resume(), new Promise<void>(resolve => { timer = setTimeout(resolve, 1500); })]);
      return (audio as { state: AudioContextState }).state === 'running';
    } finally { clearTimeout(timer!); }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gain) this.gain.gain.value = this.volume;
  }

  private selectSession(sessionId: string) {
    if (this.sessionId === sessionId) return;
    this.stop();
    this.decoded.clear();
    this.sessionId = sessionId;
  }

  prefetch(texts: string[], contexts?: GuidedCueContext[]) {
    if (!this.isAvailable() || this.paused || !contexts?.length) return;
    this.selectSession(contexts[0].sessionId);
    // Only the current/upcoming three cues can enter the decoded memory cache.
    for (let i = 0; i < Math.min(3, texts.length); i++) {
      const context = contexts[i];
      if (context?.sessionId !== this.sessionId || !this.hasCue(texts[i], context)) continue;
      void this.load(this.find(context)!).catch(() => {});
    }
  }

  private async cache() {
    try {
      const storage = this.options.cacheStorage === undefined
        ? (typeof caches === 'undefined' ? null : caches) : this.options.cacheStorage;
      return storage ? await storage.open(`oda-narration:${encodeURIComponent(this.basePath)}:en-US:v1`) : null;
    } catch { return null; } // Storage denial must not prevent online playback.
  }

  private load(asset: RecordedCueAsset): Promise<AudioBuffer> {
    const key = keyOf(asset);
    const hit = this.decoded.get(key);
    if (hit) { this.decoded.delete(key); this.decoded.set(key, hit); return Promise.resolve(hit); }
    const pending = this.pending.get(key);
    if (pending) return pending.promise;
    const controller = new AbortController();
    const promise = (async () => {
      const url = `${this.basePath}${asset.file}`;
      const cache = await this.cache();
      const validate = async (response: Response) => {
        if (!response.ok) throw new Error('Missing English recording');
        const bytes = await response.arrayBuffer();
        if (controller.signal.aborted || bytes.byteLength !== asset.bytes || await this.sha256(bytes) !== asset.checksum
          || await this.sha256(new TextEncoder().encode(asset.text).buffer as ArrayBuffer) !== asset.sourceTextHash) {
          throw new Error('English recording integrity check failed');
        }
        const buffer = await this.getContext().decodeAudioData(bytes.slice(0));
        // MP3 decoders can retain a short encoder-padding interval.
        if (controller.signal.aborted || buffer.numberOfChannels !== 1 || !Number.isFinite(buffer.duration)
          || Math.abs(buffer.duration - asset.decodedDurationSeconds) > 0.15
          || buffer.duration + 0.25 > asset.slotSeconds) throw new Error('English recording duration check failed');
        return { buffer, bytes };
      };
      let result: { buffer: AudioBuffer; bytes: ArrayBuffer } | null = null;
      try {
        const stored = await cache?.match(url);
        if (stored) result = await validate(stored);
      } catch { try { await cache?.delete(url); } catch { /* Storage can be denied. */ } }
      if (!result) {
        if (controller.signal.aborted) throw new Error('Cancelled English recording');
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try { result = await validate(await (this.options.fetch ?? fetch)(url, { signal: controller.signal })); }
        finally { clearTimeout(timeout); }
        // Cache verified bytes only; first load never requests the whole pack.
        if (cache && !controller.signal.aborted) {
          try {
            await cache.delete(url);
            await cache.put(url, new Response(result.bytes.slice(0), { headers: { 'Content-Type': 'audio/mpeg' } }));
            const keys = await cache.keys();
            for (const entry of keys.slice(0, Math.max(0, keys.length - 32))) await cache.delete(entry);
          } catch { /* Online playback still works when cache writes fail. */ }
        }
      }
      if (controller.signal.aborted) throw new Error('Cancelled English recording');
      this.decoded.set(key, result.buffer);
      while (this.decoded.size > 3) this.decoded.delete(this.decoded.keys().next().value!);
      return result.buffer;
    })();
    this.pending.set(key, { controller, promise });
    void promise.finally(() => { if (this.pending.get(key)?.promise === promise) this.pending.delete(key); }).catch(() => {});
    return promise;
  }

  async speak(text: string, volume: number, onStart: () => void, onEnd: () => void, context?: GuidedCueContext): Promise<boolean> {
    if (!this.isAvailable() || this.paused || !this.hasCue(text, context) || !context
      || !Number.isFinite(context.maxDurationSeconds) || context.maxDurationSeconds <= 0) return false;
    this.selectSession(context.sessionId);
    this.interrupt();
    const generation = this.generation;
    this.setVolume(volume);
    this.currentLoadKey = keyOf(this.find(context)!);
    const deadline = this.now() + context.maxDurationSeconds * 1000;
    this.currentRequest = { text, context, deadline, pausedAt: 0, onStart, onEnd };
    try {
      const buffer = await this.load(this.find(context)!);
      if (generation !== this.generation || this.paused) return false;
      const audio = this.getContext();
      if (!await this.ensureRunning(audio)) return this.failCurrent(generation);
      if (generation !== this.generation || this.paused) return false;
      if (buffer.duration > (deadline - this.now()) / 1000) return this.failCurrent(generation);
      this.playback = { buffer, offset: 0, startedAt: 0, deadline, pausedAt: 0, onEnd };
      this.startSource();
      onStart();
      return true;
    } catch {
      return this.failCurrent(generation);
    }
  }

  private startSource() {
    const playback = this.playback!, audio = this.getContext();
    const source = audio.createBufferSource();
    source.buffer = playback.buffer;
    source.connect(this.gain!);
    source.onended = () => {
      if (this.source !== source || this.playback !== playback) return;
      this.source = null; this.playback = null;
      this.currentRequest = null;
      this.failedRequest = null;
      try { source.disconnect(); } catch { /* Context already closed. */ }
      playback.onEnd();
    };
    this.gain!.gain.value = this.volume;
    this.source = source;
    playback.startedAt = audio.currentTime;
    source.start(0, playback.offset);
  }

  isPlaying() { return !this.paused && this.source !== null; }

  getResumeFallback(): { text: string; context: GuidedCueContext } | null {
    const request = this.failedRequest;
    if (!request) return null;
    return { text: request.text, context: { ...request.context, maxDurationSeconds: Math.max(0, (request.deadline - this.now()) / 1000) } };
  }

  private failCurrent(generation: number): false {
    if (generation === this.generation && !this.paused) {
      this.failedRequest = this.currentRequest;
      this.currentRequest = null;
      this.stopSource(); this.playback = null;
    }
    return false;
  }

  /** Replace the cue while keeping unrelated, bounded upcoming preloads useful. */
  interrupt() {
    this.generation++;
    this.stopSource();
    this.playback = null;
    this.currentRequest = null;
    this.failedRequest = null;
    if (this.currentLoadKey) {
      this.pending.get(this.currentLoadKey)?.controller.abort();
      this.pending.delete(this.currentLoadKey);
    }
    this.currentLoadKey = null;
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.generation++;
    this.abortLoads();
    if (this.currentRequest) this.currentRequest.pausedAt = this.now();
    if (this.playback && this.source) {
      this.playback.offset = Math.min(this.playback.buffer.duration, this.playback.offset + Math.max(0, this.getContext().currentTime - this.playback.startedAt));
      this.playback.pausedAt = this.now();
    }
    this.stopSource();
  }

  async resume(): Promise<boolean | void> {
    if (!this.paused) return;
    this.paused = false;
    const playback = this.playback, generation = this.generation;
    if (!playback) {
      const request = this.currentRequest;
      if (!request) return;
      return this.speak(request.text, this.volume, request.onStart, request.onEnd, {
        ...request.context, maxDurationSeconds: Math.max(0, (request.deadline - request.pausedAt) / 1000),
      });
    }
    if (playback.offset >= playback.buffer.duration) { this.playback = null; return; }
    playback.deadline += this.now() - playback.pausedAt;
    if (this.currentRequest) this.currentRequest.deadline = playback.deadline;
    try {
      const audio = this.getContext();
      if (!await this.ensureRunning(audio)) return this.failCurrent(generation);
      if (this.paused || generation !== this.generation || this.playback !== playback) return;
      if (playback.buffer.duration - playback.offset > (playback.deadline - this.now()) / 1000) return this.failCurrent(generation);
      this.startSource();
      return true;
    } catch { return this.failCurrent(generation); }
  }

  private stopSource() {
    const source = this.source;
    this.source = null;
    if (!source) return;
    source.onended = null;
    try { source.stop(); } catch { /* Already stopped. */ }
    try { source.disconnect(); } catch { /* Context already closed. */ }
  }

  private abortLoads() {
    for (const load of this.pending.values()) load.controller.abort();
    this.pending.clear();
  }

  stop() {
    this.generation++;
    this.paused = false;
    this.stopSource();
    this.playback = null;
    this.abortLoads();
    this.currentLoadKey = null;
    this.currentRequest = null;
    this.failedRequest = null;
  }
}
