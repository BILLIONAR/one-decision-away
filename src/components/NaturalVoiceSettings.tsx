import React, { useState } from 'react';
import { Card, Button, Field, Input, Badge } from './ui';
import { Mic, Sparkles, CheckCircle2, AlertTriangle, Volume2 } from 'lucide-react';
import { voiceGuide, VoiceEngine } from '../utils/voiceGuide';
import { GEMINI_TTS_VOICES } from '../utils/geminiVoice';

/**
 * Settings card: choose between the free built-in browser voice and
 * a more natural Gemini voice (needs the user's own Gemini API key, stored only on this device).
 */
export const NaturalVoiceSettings: React.FC = () => {
  const [engine, setEngine] = useState<VoiceEngine>(voiceGuide.getEngine());
  const [apiKey, setApiKey] = useState(voiceGuide.getGeminiApiKey());
  const [voiceName, setVoiceName] = useState(voiceGuide.getGeminiVoiceName());
  const [rate, setRate] = useState(voiceGuide.getRate());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const [showKey, setShowKey] = useState(false);

  const browserVoices = voiceGuide.getEnglishVoices();
  const selectedBrowserVoice = voiceGuide.getSelectedVoice();
  const [browserVoiceURI, setBrowserVoiceURI] = useState(selectedBrowserVoice?.voiceURI || '');

  const chooseEngine = (e: VoiceEngine) => {
    setEngine(e);
    voiceGuide.setEngine(e);
    setTestResult(null);
  };

  const saveKey = (v: string) => {
    setApiKey(v);
    voiceGuide.setGeminiApiKey(v);
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (engine === 'gemini') {
        const ok = await voiceGuide.testNaturalVoice();
        setTestResult(ok ? 'ok' : 'fail');
      } else {
        voiceGuide.speak('Welcome. Take a slow breath, and let the day soften.');
        setTestResult('ok');
      }
    } finally {
      setTesting(false);
    }
  };

  const naturalReady = engine === 'gemini' && apiKey.trim().length > 10;

  return (
    <Card padding="lg" className="space-y-5 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[var(--color-sage)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">Meditation Voice</h3>
        </div>
        <Badge variant={naturalReady ? 'sage' : 'subtle'}>
          {naturalReady ? 'Natural voice active' : 'Built-in voice'}
        </Badge>
      </div>

      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
        Guided meditations are narrated by a voice. The built-in voice is free and works offline. For a warmer,
        more human narration you can use a Gemini voice with your own API key — the key stays on this device only.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(
          [
            { id: 'browser', title: 'Built-in voice', sub: 'Free · offline · instant', icon: Volume2 },
            { id: 'gemini', title: 'Natural voice (Gemini)', sub: 'Warm, human-like · needs API key', icon: Sparkles },
          ] as const
        ).map((opt) => {
          const Icon = opt.icon;
          const active = engine === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => chooseEngine(opt.id)}
              className={`text-left p-3 rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                active
                  ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Icon className="w-3.5 h-3.5" /> {opt.title}
              </div>
              <div className={`text-[11px] mt-0.5 ${active ? 'opacity-80' : 'text-[var(--fg-subtle)]'}`}>{opt.sub}</div>
            </button>
          );
        })}
      </div>

      {engine === 'browser' && browserVoices.length > 0 && (
        <Field id="browser-voice" label="Built-in voice" helper="Voices come from your operating system; quality varies by device.">
          <select
            id="browser-voice"
            value={browserVoiceURI}
            onChange={(e) => {
              setBrowserVoiceURI(e.target.value);
              voiceGuide.setVoice(e.target.value || null);
              setTestResult(null);
            }}
            className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)]"
          >
            {browserVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </Field>
      )}

      {engine === 'gemini' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <Field
            id="gemini-key"
            label="Gemini API key"
            helper="Create a free key at aistudio.google.com → Get API key. Stored in this browser only, never sent anywhere except Google."
          >
            <div className="flex gap-2">
              <Input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder="AIza…"
                autoComplete="off"
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? 'Hide' : 'Show'}
              </Button>
            </div>
          </Field>

          <Field id="gemini-voice" label="Voice">
            <select
              id="gemini-voice"
              value={voiceName}
              onChange={(e) => {
                setVoiceName(e.target.value);
                voiceGuide.setGeminiVoiceName(e.target.value);
                setTestResult(null);
              }}
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)]"
            >
              {GEMINI_TTS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {engine === 'browser' && (
        <Field id="voice-rate" label={`Speaking pace · ${rate.toFixed(2)}×`} helper="Slower is calmer. 0.85–0.9 suits most meditations.">
          <input
            id="voice-rate"
            type="range"
            min={0.6}
            max={1.1}
            step={0.05}
            value={rate}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setRate(v);
              voiceGuide.setRate(v);
            }}
            className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-sage)]"
          />
        </Field>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="text-[11px]">
          {testResult === 'ok' && (
            <span className="flex items-center gap-1 text-[var(--color-sage)] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Voice is working.
            </span>
          )}
          {testResult === 'fail' && (
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> Could not reach Gemini — check the key. Meditations will use the built-in voice meanwhile.
            </span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={Volume2}
          onClick={handleTest}
          disabled={testing || (engine === 'gemini' && !naturalReady)}
        >
          {testing ? 'Testing…' : 'Test voice'}
        </Button>
      </div>
    </Card>
  );
};
