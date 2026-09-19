/**
 * VoiceGuide — spoken guidance for guided meditations.
 * Uses the browser's built-in Web Speech API (no API key, works offline).
 */

import { geminiVoice } from './geminiVoice';
import { getSpeechLang } from '../i18n';

export type VoiceEngine = 'browser' | 'gemini';

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

class VoiceGuide {
  private voices: SpeechSynthesisVoice[] = [];
  private enabled = true;
  private volume = 1;
  private rate = 0.88;
  private pitch = 0.95;
  private preferredVoiceURI: string | null = null;
  private engine: VoiceEngine = 'browser';
  private geminiApiKey = '';
  private geminiVoiceName = 'Kore';
  private speakSeq = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners = new Set<(speaking: boolean) => void>();

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

  /** Any voice available at all (browser TTS or configured natural voice). */
  public isAvailable(): boolean {
    return this.isSupported() || this.isNaturalVoiceActive();
  }

  private loadVoices() {
    try {
      this.voices = window.speechSynthesis.getVoices();
    } catch {
      this.voices = [];
    }
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

  /** Voices matching the active locale (2-letter code), falling back to any available voice. */
  public getEnglishVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) this.loadVoices();
    const code = getSpeechLang().slice(0, 2).toLowerCase();
    const matching = this.voices.filter((v) => (v.lang || '').toLowerCase().startsWith(code));
    return matching.length > 0 ? matching : this.voices;
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
    // Prefer non-"compact"/robotic voices
    const natural = english.find((v) => !/compact|espeak|eloquence/i.test(v.name));
    return natural || english[0];
  }

  /* ---------- Natural voice (Gemini TTS) ---------- */
  public getEngine(): VoiceEngine {
    return this.engine;
  }
  public setEngine(engine: VoiceEngine) {
    this.engine = engine;
    this.persist();
  }
  public getGeminiApiKey(): string {
    return this.geminiApiKey;
  }
  public setGeminiApiKey(key: string) {
    this.geminiApiKey = key.trim();
    this.persist();
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
  public prefetch(texts: string[]) {
    if (!this.enabled || !this.isNaturalVoiceActive()) return;
    geminiVoice.prefetch(texts, this.geminiApiKey, this.geminiVoiceName);
  }
  public async testNaturalVoice(): Promise<boolean> {
    if (!this.geminiApiKey) return false;
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
  public speak(text: string) {
    if (!this.enabled || !text.trim()) return;
    const seq = ++this.speakSeq;
    if (this.isNaturalVoiceActive()) {
      this.stopBrowser();
      geminiVoice
        .speak(
          text,
          this.geminiApiKey,
          this.geminiVoiceName,
          this.volume,
          () => this.emit(true),
          () => this.emit(false)
        )
        .then((ok) => {
          // If Gemini failed and no newer cue has started, fall back to the browser voice
          if (!ok && seq === this.speakSeq) this.speakBrowser(text);
        });
      return;
    }
    this.speakBrowser(text);
  }

  private stopBrowser() {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    this.currentUtterance = null;
  }

  private speakBrowser(text: string) {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getSelectedVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = getSpeechLang();
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;
      utterance.onstart = () => this.emit(true);
      utterance.onend = () => {
        if (this.currentUtterance === utterance) this.currentUtterance = null;
        this.emit(false);
      };
      utterance.onerror = () => {
        if (this.currentUtterance === utterance) this.currentUtterance = null;
        this.emit(false);
      };
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore */
    }
  }

  public isSpeaking(): boolean {
    return geminiVoice.isPlaying() || (this.isSupported() && window.speechSynthesis.speaking);
  }

  public pause() {
    geminiVoice.pause();
    if (!this.isSupported()) return;
    try {
      if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
    } catch {
      /* ignore */
    }
  }

  public resume() {
    geminiVoice.resume();
    if (!this.isSupported()) return;
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }

  public stop() {
    this.speakSeq++;
    geminiVoice.stop();
    geminiVoice.resume();
    this.stopBrowser();
    this.emit(false);
  }
}

export const voiceGuide = new VoiceGuide();
