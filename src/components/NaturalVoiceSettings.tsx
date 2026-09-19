import React, { useState } from 'react';
import { Card, Button, Field, Input } from './ui';
import { Sparkles, Volume2 } from 'lucide-react';
import { voiceGuide, VoiceEngine } from '../utils/voiceGuide';
import { GEMINI_TTS_VOICES } from '../utils/geminiVoice';
import { useT } from '../i18n';

/**
 * Settings card: choose between the free built-in browser voice and
 * a more natural Gemini voice (needs the user's own Gemini API key, stored only on this device).
 */
export const NaturalVoiceSettings: React.FC = () => {
  const t = useT();
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
        voiceGuide.speak(t('Welcome. Take a slow breath, and let the day soften.'));
        setTestResult('ok');
      }
    } finally {
      setTesting(false);
    }
  };

  const naturalReady = engine === 'gemini' && apiKey.trim().length > 10;

  return (
    <Card padding="md" className="space-y-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Meditation voice')}</h3>
        <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">{naturalReady ? t('Natural voice active') : t('Built-in voice')}</p>
      </div>

      <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
        {t('Guided meditations are narrated by a voice. The built-in voice is free and works offline. For a warmer, more human narration you can use a Gemini voice with your own API key — the key stays on this device only.')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(
          [
            { id: 'browser', title: t('Built-in voice'), sub: t('Free · offline · instant'), icon: Volume2 },
            { id: 'gemini', title: t('Natural voice (Gemini)'), sub: t('Warm, human-like · needs API key'), icon: Sparkles },
          ] as const
        ).map((opt) => {
          const Icon = opt.icon;
          const active = engine === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => chooseEngine(opt.id)}
              className={`text-left p-4 rounded-[var(--radius-sm)] transition-colors cursor-pointer min-h-[44px] ${
                active
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--bg-inset)]'
              }`}
            >
              <div className="flex items-center gap-2 text-[15px] font-medium">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} /> {opt.title}
              </div>
              <div className={`text-[13px] mt-0.5 ${active ? 'opacity-70' : 'text-[var(--fg-muted)]'}`}>{opt.sub}</div>
            </button>
          );
        })}
      </div>

      {engine === 'browser' && browserVoices.length > 0 && (
        <Field id="browser-voice" label={t('Built-in voice')} helper={t('Voices come from your operating system; quality varies by device.')}>
          <select
            id="browser-voice"
            value={browserVoiceURI}
            onChange={(e) => {
              setBrowserVoiceURI(e.target.value);
              voiceGuide.setVoice(e.target.value || null);
              setTestResult(null);
            }}
            className="w-full h-11 px-3.5 text-[15px] bg-[var(--bg)] rounded-[var(--radius-sm)] text-[var(--fg)] focus:outline-none"
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
            label={t('Gemini API key')}
            helper={t('Create a free key at aistudio.google.com → Get API key. Stored in this browser only, never sent anywhere except Google.')}
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
              <Button variant="secondary" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? t('Hide') : t('Show')}
              </Button>
            </div>
          </Field>

          <Field id="gemini-voice" label={t('Voice')}>
            <select
              id="gemini-voice"
              value={voiceName}
              onChange={(e) => {
                setVoiceName(e.target.value);
                voiceGuide.setGeminiVoiceName(e.target.value);
                setTestResult(null);
              }}
              className="w-full h-11 px-3.5 text-[15px] bg-[var(--bg)] rounded-[var(--radius-sm)] text-[var(--fg)] focus:outline-none"
            >
              {GEMINI_TTS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {t(v.label)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {engine === 'browser' && (
        <Field id="voice-rate" label={t('Speaking pace · {rate}×', { rate: rate.toFixed(2) })} helper={t('Slower is calmer. 0.85–0.9 suits most meditations.')}>
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
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent)' }}
          />
        </Field>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] min-w-0">
          {testResult === 'ok' && <span className="text-[var(--accent)] font-medium">{t('Voice is working.')}</span>}
          {testResult === 'fail' && (
            <span className="text-[var(--danger)]">{t('Could not reach Gemini — check the key. Meditations will use the built-in voice meanwhile.')}</span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={Volume2}
          onClick={handleTest}
          disabled={testing || (engine === 'gemini' && !naturalReady)}
        >
          {testing ? t('Testing…') : t('Test voice')}
        </Button>
      </div>
    </Card>
  );
};
