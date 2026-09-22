import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Download, MessageCircle, Mic, MicOff, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useLocale, getSpeechLang } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { createAICoach, getCoachAvailability, MAX_COACH_MESSAGE_LENGTH, type CoachMessage } from '../services/aiCoach';

interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
}
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export const Coach: React.FC = () => {
  const [locale] = useLocale();
  const c = companionCopy(locale);
  const [engine] = useState(() => createAICoach());
  const [availability, setAvailability] = useState<{ supported: boolean; reason?: string } | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'replying'>('idle');
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [readAloud, setReadAloud] = useState(false);
  const readAloudRef = useRef(false);
  readAloudRef.current = readAloud;
  const [listening, setListening] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const followOutput = useRef(true);
  const SpeechInput = typeof window !== 'undefined' ? ((window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition) : undefined;
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    mounted.current = true;
    getCoachAvailability().then(result => { if (mounted.current) setAvailability(result); });
    return () => {
      mounted.current = false;
      controller.current?.abort();
      recognition.current?.abort();
      if (speechSupported) window.speechSynthesis.cancel();
      void engine.unload();
    };
  }, [engine, speechSupported]);

  useEffect(() => {
    if (followOutput.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);

  async function prepare() {
    if (busy.current) return;
    busy.current = true;
    setError(''); setPhase('loading'); setProgress(0);
    const abort = new AbortController(); controller.current = abort;
    try {
      await engine.initialize(p => { if (mounted.current) setProgress(Math.min(100, Math.round(p.progress * 100))); }, abort.signal);
      if (mounted.current) setPhase('ready');
    } catch (err) {
      if (mounted.current) {
        setPhase('idle');
        if ((err as Error).name !== 'AbortError') setError((err as Error).message);
      }
    } finally { busy.current = false; }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content.length > MAX_COACH_MESSAGE_LENGTH || busy.current || phase !== 'ready') return;
    busy.current = true;
    recognition.current?.stop();
    if (speechSupported) window.speechSynthesis.cancel();
    const history: CoachMessage[] = [...messages.filter(m => m.content.trim()), { role: 'user', content }];
    setDraft(''); setError(''); setPhase('replying'); followOutput.current = true;
    setMessages([...history, { role: 'assistant', content: '' }]);
    const abort = new AbortController(); controller.current = abort;
    try {
      const answer = await engine.stream(history, fullText => {
        if (mounted.current) setMessages([...history, { role: 'assistant', content: fullText }]);
      }, abort.signal);
      if (mounted.current && !abort.signal.aborted) {
        if (!answer.trim()) setError(c.emptyReply);
        if (readAloudRef.current && speechSupported && answer.trim()) {
          const utterance = new SpeechSynthesisUtterance(answer);
          utterance.lang = getSpeechLang(locale); utterance.rate = 0.95;
          const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(locale));
          utterance.voice = voices.find(v => v.localService) || voices[0] || null;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      if (mounted.current && (err as Error).name !== 'AbortError') setError((err as Error).message);
    } finally {
      busy.current = false;
      if (mounted.current) {
        setMessages(current => current.filter(message => message.content.trim()));
        setPhase(engine.isReady ? 'ready' : 'idle'); textarea.current?.focus();
      }
    }
  }

  function toggleMicrophone() {
    if (listening) { recognition.current?.stop(); return; }
    if (!SpeechInput) return;
    if (speechSupported) window.speechSynthesis.cancel();
    const input = new SpeechInput(); recognition.current = input;
    input.lang = getSpeechLang(locale); input.continuous = false; input.interimResults = false;
    input.onresult = event => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
      if (mounted.current) setDraft(value => `${value.trim()} ${transcript}`.trim().slice(0, MAX_COACH_MESSAGE_LENGTH));
    };
    input.onerror = () => { if (mounted.current) { setListening(false); setError(c.microphoneError); } };
    input.onend = () => { if (mounted.current) setListening(false); };
    try { input.start(); setListening(true); setError(''); } catch { setError(c.microphoneError); }
  }

  async function resetConversation() {
    if (busy.current) return;
    busy.current = true;
    recognition.current?.abort();
    if (speechSupported) window.speechSynthesis.cancel();
    setMessages([]); setDraft(''); setError('');
    try { await engine.reset(); textarea.current?.focus(); }
    catch (err) { setError((err as Error).message); setPhase('idle'); }
    finally { busy.current = false; }
  }

  return (
    <div className="space-y-6 pb-2">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--accent)]"><MessageCircle size={16} /> ODA / {c.coach}</div>
        <h1 className="text-[30px] sm:text-[36px] font-semibold tracking-tight leading-[1.12]">{c.coachHeading}</h1>
        <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed max-w-xl">{c.coachIntro}</p>
      </header>

      {phase === 'idle' || phase === 'loading' ? (
        <section className="p-5 sm:p-6 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border border-[var(--border)] space-y-4">
          <p className="text-[13px] font-semibold text-[var(--accent)]">{c.local}</p>
          <p className="text-sm leading-relaxed">{c.download}</p>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{c.privacy}</p>
          {!availability ? <p role="status" className="text-sm">{c.checking}</p> : !availability.supported ? <p role="status" className="text-sm leading-relaxed">{availability.reason}</p> : phase === 'loading' ? (
            <div className="space-y-2" role="status">
              <div className="flex justify-between text-sm"><span>{c.preparing}</span><span>{progress}%</span></div>
              <progress value={progress} max={100} aria-label={c.preparing} className="w-full h-2 accent-[var(--accent)]" />
              <button type="button" onClick={() => controller.current?.abort()} className="text-sm underline underline-offset-4 min-h-10">{c.stop}</button>
            </div>
          ) : <button type="button" onClick={prepare} className="min-h-12 px-5 rounded-full bg-[var(--accent)] text-white inline-flex gap-2 items-center text-sm font-semibold"><Download size={17} />{c.start}</button>}
        </section>
      ) : (
        <div className="flex justify-between items-center gap-3 text-xs">
          <span className="inline-flex gap-2 items-center text-[var(--accent)]"><Check size={15} />{phase === 'replying' ? c.thinking : c.ready}</span>
          <button onClick={resetConversation} disabled={phase === 'replying' || messages.length === 0} className="inline-flex gap-2 items-center min-h-10 text-[var(--fg-muted)] disabled:opacity-40"><RotateCcw size={14} />{c.reset}</button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="space-y-2">
          {[c.fearPrompt, c.overwhelmedPrompt, c.faithPrompt].map(prompt => <button key={prompt} type="button" onClick={() => { setDraft(prompt); textarea.current?.focus(); }} className="block w-full text-left px-4 py-3 text-sm leading-relaxed border border-[var(--border)] rounded-[var(--radius-sm)] hover:border-[var(--accent)] transition-colors">{prompt}</button>)}
        </div>
      ) : <div ref={log} role="log" aria-label={c.live} aria-live="off" tabIndex={0} onScroll={() => { const el = log.current; if (el) followOutput.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }} className="max-h-[52vh] min-h-40 overflow-y-auto space-y-5 pr-2 overscroll-contain">
        {messages.map((message, index) => <article key={index} className={message.role === 'user' ? 'ml-8 p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)]' : 'mr-4 pl-4 border-l-2 border-[var(--accent)]'}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)] mb-2">{message.role === 'user' ? c.you : c.name}</p>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content || c.thinking}</p>
        </article>)}
      </div>}

      {error && <div role="alert" className="p-3 bg-[var(--danger-soft)] text-[var(--danger)] rounded-[var(--radius-sm)] text-sm leading-relaxed">{error}</div>}

      <form onSubmit={send} className="space-y-3">
        <div className="border border-[var(--border-strong)] focus-within:border-[var(--accent)] rounded-[var(--radius-md)] p-3 bg-[var(--bg-elevated)]">
          <label htmlFor="coach-message" className="sr-only">{c.placeholder}</label>
          <textarea ref={textarea} id="coach-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={MAX_COACH_MESSAGE_LENGTH} rows={3} placeholder={c.placeholder} className="w-full resize-y min-h-20 max-h-60 bg-transparent text-[15px] leading-relaxed outline-none" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (phase === 'ready') event.currentTarget.form?.requestSubmit(); } }} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><button type="button" onClick={toggleMicrophone} disabled={!SpeechInput || phase === 'replying'} aria-pressed={listening} aria-label={listening ? c.stopListening : c.listen} className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--bg-muted)] disabled:opacity-35">{listening ? <MicOff size={19} className="text-[var(--danger)]" /> : <Mic size={19} />}</button><span className="text-[11px] text-[var(--fg-subtle)]">{draft.length}/{MAX_COACH_MESSAGE_LENGTH}</span></div>
            {phase === 'replying' ? <button type="button" onClick={() => { controller.current?.abort(); engine.cancel(); }} aria-label={c.stop} className="w-11 h-11 bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center rounded-full"><Square size={17} /></button> : <button type="submit" disabled={phase !== 'ready' || !draft.trim()} aria-label={c.send} className="w-11 h-11 bg-[var(--accent)] text-white disabled:opacity-35 flex items-center justify-center rounded-full"><ArrowUp size={20} /></button>}
          </div>
        </div>
        {phase === 'idle' && <p className="text-xs text-[var(--fg-muted)]">{c.notLoaded}</p>}
        {speechSupported && <label className="inline-flex items-center gap-2 text-xs min-h-9"><input type="checkbox" checked={readAloud} onChange={event => { setReadAloud(event.target.checked); if (!event.target.checked) window.speechSynthesis.cancel(); }} className="accent-[var(--accent)]" /><Volume2 size={14} />{c.speak}</label>}
        <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{SpeechInput ? c.voiceNote : c.noVoice}</p>
        <p className="text-[11px] text-[var(--fg-muted)]"><strong>{c.local}</strong> · {c.limit}</p>
      </form>
    </div>
  );
};
