/**
 * VoiceGuide — spoken guidance for guided meditations.
 * Guided narration uses English source text and English device voices.
 * Browser voice quality and offline availability depend on the installed voice.
 */

import { geminiVoice } from './geminiVoice';
import { getSpeechLang } from '../i18n';

export type VoiceEngine = 'browser' | 'gemini';

export interface GuidedCueContext {
  sessionId: string;
  cueIndex: number;
  maxDurationSeconds: number;
}

export interface EnglishRecordedCueAsset {
  sessionId: string;
  cueIndex: number;
  language: 'en-US';
  version: string;
  sourceTextHash: string;
  decodedDurationSeconds: number;
  checksum: string;
}

/** Optional approved English clips; implementations must cancel pending playback on stop/pause. */
export interface EnglishRecordedNarration {
  readonly assets: readonly EnglishRecordedCueAsset[];
  isAvailable(): boolean;
  // The implementation must verify source-text/asset hashes and the cue's remaining slot.
  hasCue(text: string, context?: GuidedCueContext): boolean;
  speak(text: string, volume: number, onStart: () => void, onEnd: () => void, context?: GuidedCueContext): Promise<boolean>;
  prefetch?(texts: string[], contexts?: GuidedCueContext[]): void;
  isPlaying(): boolean;
  pause(): void;
  resume(): void;
  stop(): void;
}

const PREFERRED_VOICE_NAMES = [
  // Apple
  'Samantha', 'Ava', 'Allison', 'Karen', 'Moira', 'Daniel', 'Tom',
  // Google / Chrome
  'Google US English', 'Google UK English Female', 'Google UK English Male',
  // Microsoft Edge natural voices
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Microsoft Sonia Online (Natural) - English (United Kingdom)',
  'Microsoft Zira', 'Microsoft David',
];
const isEnglishVoice = (voice: SpeechSynthesisVoice) => /^en(?:[-_]|$)/i.test(voice.lang || '');

export class VoiceGuide {
  private voices: SpeechSynthesisVoice[] = [];
  private voiceInventoryKey: string | null = null;
  private enabled = true;
  private volume = 1;
  private rate = 0.88;
  private pitch = 0.95;
  private preferredVoiceURI: string | null = null;
  private engine: VoiceEngine = 'browser';
  private geminiApiKey = '';
  private geminiVoiceName = 'Kore';
  private speakSeq = 0;
  private activePlaybackSeq: number | null = null;
  private paused = false;
  private recordedNarration: EnglishRecordedNarration | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners = new Set<(speaking: boolean) => void>();
  private availabilityListeners = new Set<(available: boolean) => void>();

  constructor() {
    if (this.isSupported()) {
      this.loadVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => this.loadVoices());
      try {
        const saved = localStorage.getItem('oda_voice_prefs');
        if (saved) {
          const p = JSON.parse(saved);
          if (typeof p.enabled === 'boolean') this.enabled = p.enabled;
          if (typeof p.volume === 'number') this.volume = p.volume;
          if (typeof p.rate === 'number') this.rate = p.rate;
          if (typeof p.voiceURI === 'string') this.preferredVoiceURI = p.voiceURI;
          if (p.engine === 'gemini' || p.engine === 'browser') this.engine = p.engine;
          if (typeof p.geminiApiKey === 'string') this.geminiApiKey = p.geminiApiKey;
          if (typeof p.geminiVoiceName === 'string') this.geminiVoiceName = p.geminiVoiceName;
        }
      } catch {
        /* ignore */
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  /** Guided English voice availability; browser API support alone is insufficient. */
  public isAvailable(): boolean {
    return this.recordedNarration?.isAvailable() === true || this.isNaturalVoiceActive()
      || (this.isSupported() && this.getEnglishVoices().length > 0);
  }

  private loadVoices() {
    try {
      this.voices = window.speechSynthesis.getVoices();
    } catch {
      this.voices = [];
    }
    const inventoryKey = this.voices.map(voice => `${voice.voiceURI}:${voice.lang}:${voice.name}`).join('|');
    if (inventoryKey !== this.voiceInventoryKey) {
      this.voiceInventoryKey = inventoryKey;
      this.emitAvailability();
    }
  }

  private emitAvailability() {
    const available = this.recordedNarration?.isAvailable() === true || this.isNaturalVoiceActive()
      || (this.isSupported() && this.voices.some(isEnglishVoice));
    this.availabilityListeners.forEach(listener => listener(available));
  }

  public onAvailabilityChange(listener: (available: boolean) => void): () => void {
    // Load before registering so empty inventories cannot recursively notify this listener.
    const available = this.isAvailable();
    this.availabilityListeners.add(listener);
    listener(available);
    return () => this.availabilityListeners.delete(listener);
  }

  /** Explicit future asset registration only; no recorded narration is enabled by default. */
  public setRecordedNarration(player: EnglishRecordedNarration | null) {
    this.stop();
    this.recordedNarration = player;
    this.emitAvailability();
  }

  private persist() {
    try {
      localStorage.setItem(
        'oda_voice_prefs',
        JSON.stringify({
          enabled: this.enabled,
          volume: this.volume,
          rate: this.rate,
          voiceURI: this.preferredVoiceURI,
          engine: this.engine,
          geminiApiKey: this.geminiApiKey,
          geminiVoiceName: this.geminiVoiceName,
        })
      );
    } catch {
      /* ignore */
    }
  }

  /** Guided narration stays English independently of the display language. */
  public getEnglishVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) this.loadVoices();
    return this.voices.filter(isEnglishVoice);
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    const english = this.getEnglishVoices();
    if (english.length === 0) return null;
    if (this.preferredVoiceURI) {
      const found = english.find((v) => v.voiceURI === this.preferredVoiceURI);
      if (found) return found;
    }
    for (const name of PREFERRED_VOICE_NAMES) {
      const found = english.find((v) => v.name === name || v.name.startsWith(name));
      if (found) return found;
    }
    return english.find(voice => voice.default) || english[0];
  }

  /* ---------- Natural voice (Gemini TTS) ---------- */
  public getEngine(): VoiceEngine {
    return this.engine;
  }
  public setEngine(engine: VoiceEngine) {
    this.engine = engine;
    this.persist();
    this.emitAvailability();
  }
  public getGeminiApiKey(): string {
    return this.geminiApiKey;
  }
  public setGeminiApiKey(key: string) {
    this.geminiApiKey = key.trim();
    this.persist();
    this.emitAvailability();
  }
  public getGeminiVoiceName(): string {
    return this.geminiVoiceName;
  }
  public setGeminiVoiceName(name: string) {
    this.geminiVoiceName = name;
    this.persist();
  }
  /** True when natural voice is selected and configured. */
  public isNaturalVoiceActive(): boolean {
    return this.engine === 'gemini' && this.geminiApiKey.length > 10;
  }
  /** Warm the cache for upcoming cues so playback starts on time. */
  public prefetch(texts: string[], contexts?: GuidedCueContext[]) {
    if (!this.enabled) return;
    if (this.recordedNarration) { this.recordedNarration.prefetch?.(texts, contexts); return; }
    if (!this.isNaturalVoiceActive()) return;
    geminiVoice.prefetch(texts, this.geminiApiKey, this.geminiVoiceName);
  }
  public async testNaturalVoice(): Promise<boolean> {
    if (!this.geminiApiKey) return false;
    geminiVoice.setVolume(this.volume);
    return geminiVoice.test(this.geminiApiKey, this.geminiVoiceName);
  }

  public setVoice(voiceURI: string | null) {
    this.preferredVoiceURI = voiceURI;
    this.persist();
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    this.persist();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    geminiVoice.setVolume(this.volume);
    // Device engines do not reliably apply live utterance-volume changes.
    // Zero cancels our current utterance; nonzero applies to the next cue/replay.
    if (this.volume === 0 && this.currentUtterance) {
      this.stopBrowser();
      this.emit(false);
    }
    this.persist();
  }

  public getVolume(): number {
    return this.volume;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(1.3, rate));
    this.persist();
  }

  public getRate(): number {
    return this.rate;
  }

  public onSpeakingChange(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(speaking: boolean) {
    this.listeners.forEach((l) => l(speaking));
  }

  /** Speak a cue. Any cue still playing is interrupted so guidance stays in sync with the timer. */
  public speakBrowserOnly(text: string): boolean {
    if (!this.isSupported() || !text.trim()) return false;
    // Explicit Notebook playback uses the free device voice without changing
    // the user's saved meditation engine or automatic-guidance preference.
    this.stop();
    return this.speakBrowser(text, false);
  }

  /** Speak a meditation cue with the user's configured engine. */
  public speak(text: string, context?: GuidedCueContext): boolean {
    if (!this.enabled || this.paused || !text.trim()) return false;
    const seq = ++this.speakSeq;
    this.activePlaybackSeq = seq;
    const onStart = () => { if (this.activePlaybackSeq === seq && this.speakSeq === seq && !this.paused) this.emit(true); };
    const onEnd = () => {
      if (this.activePlaybackSeq !== seq) return;
      this.activePlaybackSeq = null;
      this.emit(false);
    };
    const fallback = (ok: boolean) => {
      if (!ok && seq === this.speakSeq && this.activePlaybackSeq === seq && !this.paused) {
        this.activePlaybackSeq = null;
        return this.speakBrowser(text, true);
      }
      return ok;
    };
    if (this.recordedNarration) {
      geminiVoice.stop();
      this.recordedNarration.stop();
      if (this.isSupported() && !this.stopBrowser()) { this.activePlaybackSeq = null; this.emit(false); return false; }
      const asset = context && this.recordedNarration.assets.find(asset => asset.sessionId === context.sessionId && asset.cueIndex === context.cueIndex);
      const fitsSlot = asset && context.sessionId.length > 0 && Number.isInteger(context.cueIndex) && context.cueIndex >= 0
        && Number.isFinite(context.maxDurationSeconds) && asset.language === 'en-US' && Number.isFinite(asset.decodedDurationSeconds)
        && asset.decodedDurationSeconds > 0 && asset.decodedDurationSeconds <= context.maxDurationSeconds
        && Boolean(asset.version) && /^[a-f0-9]{64}$/i.test(asset.sourceTextHash) && /^[a-f0-9]{64}$/i.test(asset.checksum);
      let verified = false;
      try { verified = Boolean(fitsSlot) && this.recordedNarration.hasCue(text, context); } catch { /* Unreadable assets use the English device fallback. */ }
      if (!verified) {
        this.activePlaybackSeq = null;
        return this.speakBrowser(text, true);
      }
      try {
        this.recordedNarration.speak(text, this.volume, onStart, onEnd, context).then(fallback, () => fallback(false));
      } catch { return fallback(false); }
      return true;
    }
    if (this.isNaturalVoiceActive()) {
      if (this.isSupported() && !this.stopBrowser()) { this.activePlaybackSeq = null; this.emit(false); return false; }
      geminiVoice
        .speak(
          text,
          this.geminiApiKey,
          this.geminiVoiceName,
          this.volume,
          onStart,
          onEnd
        )
        .then(fallback, () => fallback(false));
      return true;
    }
    this.activePlaybackSeq = null;
    geminiVoice.stop();
    return this.speakBrowser(text, true);
  }

  private stopBrowser(): boolean {
    const utterance = this.currentUtterance;
    this.currentUtterance = null;
    if (utterance) utterance.onstart = utterance.onend = utterance.onerror = null;
    if (!this.isSupported()) return false;
    try {
      window.speechSynthesis.cancel();
      return true;
    } catch {
      return false;
    }
  }

  private speakBrowser(text: string, guidedEnglish: boolean): boolean {
    if (!this.isSupported()) return false;
    const voice = guidedEnglish ? this.getSelectedVoice() : this.getNotebookVoice();
    // Never let the browser silently choose a non-English voice for guided cues.
    if (guidedEnglish && !voice) { this.stopBrowser(); this.emit(false); return false; }
    if (!this.stopBrowser()) { this.emit(false); return false; }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = getSpeechLang();
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;
      utterance.onstart = () => { if (this.currentUtterance === utterance && !this.paused) this.emit(true); };
      utterance.onend = () => {
        if (this.currentUtterance !== utterance) return;
        this.currentUtterance = null;
        this.emit(false);
      };
      utterance.onerror = () => {
        if (this.currentUtterance !== utterance) return;
        this.currentUtterance = null;
        this.emit(false);
      };
      this.currentUtterance = utterance;
      if (!this.paused && window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      this.stopBrowser();
      this.emit(false);
      return false;
    }
  }

  /** Notebook words remain verbatim and use the display language's device voice. */
  private getNotebookVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) this.loadVoices();
    const language = getSpeechLang().slice(0, 2).toLowerCase();
    const matching = this.voices.filter(voice => (voice.lang || '').toLowerCase().split(/[-_]/)[0] === language);
    const candidates = matching.length ? matching : this.voices;
    return candidates.find(voice => voice.voiceURI === this.preferredVoiceURI)
      || candidates.find(voice => voice.default) || candidates[0] || null;
  }

  public isSpeaking(): boolean {
    return !this.paused && (this.recordedNarration?.isPlaying() === true || geminiVoice.isPlaying()
      || (this.currentUtterance !== null && this.isSupported() && window.speechSynthesis.speaking));
  }

  public pause() {
    this.paused = true;
    this.speakSeq++;
    this.recordedNarration?.pause();
    geminiVoice.pause();
    this.emit(false);
    if (!this.isSupported()) return;
    try {
      if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
    } catch {
      /* ignore */
    }
  }

  public resume() {
    this.paused = false;
    this.recordedNarration?.resume();
    geminiVoice.resume();
    if (!this.isSupported()) { if (this.isSpeaking()) this.emit(true); return; }
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      if (this.isSpeaking()) this.emit(true);
    } catch {
      /* ignore */
    }
  }

  public stop() {
    this.speakSeq++;
    this.activePlaybackSeq = null;
    this.paused = false;
    this.recordedNarration?.stop();
    geminiVoice.stop();
    this.stopBrowser();
    this.emit(false);
  }
}

export const voiceGuide = new VoiceGuide();
