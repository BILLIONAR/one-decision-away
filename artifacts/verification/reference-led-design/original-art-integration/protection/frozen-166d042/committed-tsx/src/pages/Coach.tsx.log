import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Cloud, Download, MessageCircle, Mic, MicOff, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useLocale, useT, getSpeechLang } from '../i18n';
import { CoachTools } from '../components/coach/CoachTools';
import { companionCopy } from '../i18n/companion';
import { createAICoach, getCoachAvailability, setCoachFocus, MAX_COACH_MESSAGE_LENGTH, type CoachMessage } from '../services/aiCoach';
import { INTENTS } from '../data/starterDecisions';
import { OriginalSceneImage } from '../components/OriginalSceneImage';
import { useApp } from '../store/useApp';
import { useCloudState } from '../services/useCloudState';
import { cloudSync } from '../services/cloudSync';
import {
  CloudCoachError, buildCoachContext, getCloudCoachStatus, readContextConsent, sendToCloudCoach, writeContextConsent,
  type CloudTier,
} from '../services/cloudCoach';
import '../styles/coach.css';

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
  const t = useT();
  const [engine] = useState(() => createAICoach());
  const { data, setActiveRoute } = useApp();
  const intent = data?.profile.intent;
  const cloud = useCloudState();
  const cloudReady = cloud.configured && !!cloud.session;
  const cloudUserId = cloud.session?.user.id;
  const [cloudStatus, setCloudStatus] = useState<{ remaining: number; limit: number; tier: CloudTier } | null>(null);
  const [cloudChecked, setCloudChecked] = useState(false);
  const [useDevice, setUseDevice] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [shareContext, setShareContext] = useState(readContextConsent);
  const cloudChecking = cloudReady && !cloudChecked;
  const cloudActive = cloudReady && !!cloudStatus && !useDevice;
  const outOfMessages = cloudActive && cloudStatus.remaining <= 0;
  useEffect(() => { setCoachFocus(INTENTS.find(item => item.key === intent)?.label ?? null); }, [intent]);
  const [availability, setAvailability] = useState<{ supported: boolean; reason?: string } | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'replying'>('idle');
  const inputReady = cloudActive ? !cloudBusy && !outOfMessages : phase === 'ready';
  const replying = cloudActive ? cloudBusy : phase === 'replying';
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
    // A shared browser must not send or display a previous member's conversation.
    controller.current?.abort();
    recognition.current?.abort();
    if (speechSupported) window.speechSynthesis.cancel();
    busy.current = false;
    setCloudBusy(false);
    setPhase(engine.isReady ? 'ready' : 'idle');
    setProgress(0);
    setListening(false);
    setMessages([]);
    setDraft('');
    setError('');
    setShareContext(readContextConsent());
    setCloudStatus(null);
    setCloudChecked(false);
    if (!cloudReady) return;
    const abort = new AbortController();
    getCloudCoachStatus('en', abort.signal)
      .then(result => { if (!abort.signal.aborted) { setCloudStatus({ remaining: result.remaining, limit: result.limit, tier: result.tier }); setCloudChecked(true); } })
      .catch(err => { if ((err as Error).name !== 'AbortError') setCloudChecked(true); }); // not deployed or offline: the on-device coach stays
    return () => abort.abort();
  }, [cloudReady, cloudUserId, cloud.scopeRevision, speechSupported, engine]);

  useEffect(() => {
    if (followOutput.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);

  async function prepare() {
    if (busy.current) return;
    busy.current = true;
    setError(''); setPhase('loading'); setProgress(0);
    const abort = new AbortController(); controller.current = abort;
    try {
      await engine.initialize(p => { if (mounted.current && controller.current === abort && !abort.signal.aborted) setProgress(Math.min(100, Math.round(p.progress * 100))); }, abort.signal);
      if (mounted.current && controller.current === abort && !abort.signal.aborted) setPhase('ready');
    } catch (err) {
      if (mounted.current && controller.current === abort) {
        setPhase('idle');
        if ((err as Error).name !== 'AbortError') setError((err as Error).message);
      }
    } finally { if (controller.current === abort) busy.current = false; }
  }

  function speak(answer: string) {
    if (!readAloudRef.current || !speechSupported || !answer.trim()) return;
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = getSpeechLang(locale); utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(locale));
    utterance.voice = voices.find(v => v.localService) || voices[0] || null;
    window.speechSynthesis.speak(utterance);
  }

  async function sendCloud(content: string) {
    const current = cloudSync.currentAccountGuard();
    busy.current = true; setCloudBusy(true);
    const before = messages.filter(m => m.content.trim());
    const history: CoachMessage[] = [...before, { role: 'user', content }];
    setDraft(''); setError(''); followOutput.current = true;
    setMessages([...history, { role: 'assistant', content: '' }]);
    const abort = new AbortController(); controller.current = abort;
    try {
      const context = shareContext && readContextConsent() && cloudStatus?.tier === 'coach' ? buildCoachContext(data, t) : null;
      const result = await sendToCloudCoach(history, locale, context, abort.signal);
      if (!mounted.current || !current() || abort.signal.aborted) return;
      setCloudStatus({ remaining: result.remaining, limit: result.limit, tier: result.tier });
      const answer = result.reply?.trim() ?? '';
      if (!answer) { setMessages(before); setDraft(content); setError(c.emptyReply); return; }
      setMessages([...history, { role: 'assistant', content: answer }]);
      speak(answer);
    } catch (err) {
      if (!mounted.current || !current() || (err as Error).name === 'AbortError') return;
      setMessages(before); setDraft(content);
      if (err instanceof CloudCoachError) {
        if (err.kind === 'quota' && err.info) setCloudStatus({ remaining: 0, limit: err.info.limit, tier: err.info.tier });
        else setError(err.message);
      } else setError(t('The cloud coach could not answer just now. This message was not counted. Please try again in a moment.'));
    } finally {
      // A cancelled previous-account request must not release a newer request's lock.
      if (controller.current === abort) {
        busy.current = false;
        if (mounted.current) { setCloudBusy(false); textarea.current?.focus(); }
      }
    }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content.length > MAX_COACH_MESSAGE_LENGTH || busy.current || !inputReady) return;
    recognition.current?.stop();
    if (speechSupported) window.speechSynthesis.cancel();
    if (cloudActive) { await sendCloud(content); return; }
    busy.current = true;
    const history: CoachMessage[] = [...messages.filter(m => m.content.trim()), { role: 'user', content }];
    setDraft(''); setError(''); setPhase('replying'); followOutput.current = true;
    setMessages([...history, { role: 'assistant', content: '' }]);
    const abort = new AbortController(); controller.current = abort;
    try {
      const answer = await engine.stream(history, fullText => {
        if (mounted.current && controller.current === abort && !abort.signal.aborted) setMessages([...history, { role: 'assistant', content: fullText }]);
      }, abort.signal);
      if (mounted.current && controller.current === abort && !abort.signal.aborted) {
        if (!answer.trim()) setError(c.emptyReply);
        speak(answer);
      }
    } catch (err) {
      if (mounted.current && controller.current === abort && (err as Error).name !== 'AbortError') setError((err as Error).message);
    } finally {
      if (controller.current === abort) {
        busy.current = false;
        if (mounted.current) {
          setMessages(current => current.filter(message => message.content.trim()));
          setPhase(engine.isReady ? 'ready' : 'idle'); textarea.current?.focus();
        }
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

  function chooseEngine(device: boolean) {
    if (busy.current) return;
    recognition.current?.abort();
    if (speechSupported) window.speechSynthesis.cancel();
    setMessages([]); setDraft(''); setError(''); setUseDevice(device);
  }

  function toggleShareContext(on: boolean) { setShareContext(on); writeContextConsent(on); }

  async function resetConversation() {
    if (busy.current) return;
    busy.current = true;
    recognition.current?.abort();
    if (speechSupported) window.speechSynthesis.cancel();
    setMessages([]); setDraft(''); setError('');
    if (cloudActive) { busy.current = false; return; }
    try { await engine.reset(); textarea.current?.focus(); }
    catch (err) { setError((err as Error).message); setPhase('idle'); }
    finally { busy.current = false; }
  }

  return (
    <div className="coach-page pb-2">
      <header className="coach-hero">
        <div className="coach-hero-copy space-y-3">
          <div className="coach-eyebrow flex items-center gap-2 text-[12px] font-medium"><MessageCircle size={16} /> ODA / {c.coach}</div>
          <h1 className="text-[30px] sm:text-[36px] oda-display leading-[1.12]">{c.coachHeading}</h1>
          <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed max-w-xl">{c.coachIntro}</p>
        </div>
        <div className="coach-orbit" aria-hidden="true" data-state={replying ? 'replying' : listening ? 'listening' : phase === 'loading' ? 'loading' : 'idle'}>
          <div className="coach-orb"><OriginalSceneImage asset="coach-orb" sizes="(min-width: 768px) 194px, 159px" eager fallback="assets/oda/reference-fidelity/coach-liquid-form.svg" /></div>
          <div className="coach-orbit-ring" />
        </div>
      </header>

      <div className="coach-tools"><CoachTools /></div>

      <div className={`coach-conversation space-y-5${messages.length === 0 ? ' coach-with-starters' : ''}`}>

      {!cloudReady && cloud.configured && (
        <section aria-labelledby="cloud-coach-heading" className="coach-provider oda-card rounded-[22px] p-5 space-y-3">
          <div className="flex items-center gap-2"><span className="oda-tile-icon oda-tint-blue" aria-hidden="true"><Cloud size={18} strokeWidth={1.8} /></span><h2 id="cloud-coach-heading" className="oda-kicker text-[var(--fg)]">{t('Use the cloud coach')}</h2></div>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{t('The cloud coach answers with a more capable AI and needs a free account, so we can count your monthly messages. The offline tools above and the on-device coach below stay available without one.')}</p>
          <button type="button" onClick={() => setActiveRoute('/app/account')} className="oda-btn-primary min-h-12 px-5 rounded-full inline-flex items-center text-sm font-semibold">{t('Open account')}</button>
        </section>
      )}

      {cloudReady && cloudStatus && useDevice && (
        <section className="coach-provider oda-card rounded-[22px] p-5 space-y-3">
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{t('You are using the on-device coach.')}</p>
          <button type="button" onClick={() => chooseEngine(false)} className="min-h-11 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium border border-[var(--border)] hover:border-[var(--accent)] transition-colors"><Cloud size={16} strokeWidth={1.8} />{t('Use the cloud coach')}</button>
        </section>
      )}

      {cloudChecking ? (
        <p role="status" className="text-sm text-[var(--fg-muted)]">{t('Checking the cloud coach')}</p>
      ) : cloudActive ? (
        <section aria-label={t('Cloud coach')} className="coach-provider space-y-3">
          <div className="coach-status flex justify-between items-center gap-3 text-xs">
            <span role="status" className="inline-flex gap-2 items-center text-[var(--fg-muted)]"><Cloud size={15} strokeWidth={1.8} />{replying ? c.thinking : t('{n} of {total} messages left this month', { n: cloudStatus.remaining, total: cloudStatus.limit })}</span>
            <button onClick={resetConversation} disabled={replying || messages.length === 0} className="inline-flex gap-2 items-center min-h-11 text-[var(--fg-muted)] disabled:opacity-40"><RotateCcw size={14} />{c.reset}</button>
          </div>
          {cloudStatus.tier === 'coach' && (
            <label className="flex items-start gap-3 min-h-11 text-[13px] leading-snug">
              <input type="checkbox" checked={shareContext} onChange={event => toggleShareContext(event.target.checked)} className="accent-[var(--accent)] mt-0.5 w-5 h-5 shrink-0" />
              <span>{t('Let the coach read today’s decision and recent notebook lines')}</span>
            </label>
          )}
        </section>
      ) : phase === 'idle' || phase === 'loading' ? (
        <section className="coach-setup p-5 sm:p-6 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border border-[var(--border)] space-y-4">
          <p className="text-[13px] font-semibold text-[var(--accent)]">{c.local}</p>
          <p className="text-sm leading-relaxed">{c.download}</p>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{c.privacy}</p>
          {!availability ? <p role="status" className="text-sm">{c.checking}</p> : !availability.supported ? <p role="status" className="text-sm leading-relaxed">{availability.reason}</p> : phase === 'loading' ? (
            <div className="space-y-2" role="status">
              <div className="flex justify-between text-sm"><span>{c.preparing}</span><span>{progress}%</span></div>
              <progress value={progress} max={100} aria-label={c.preparing} className="w-full h-2 accent-[var(--accent)]" />
              <button type="button" onClick={() => controller.current?.abort()} className="text-sm underline underline-offset-4 min-h-10">{c.stop}</button>
            </div>
          ) : <button type="button" onClick={prepare} className="coach-prepare min-h-12 px-5 rounded-full bg-[var(--accent)] text-white inline-flex gap-2 items-center text-sm font-semibold"><Download size={17} />{c.start}</button>}
        </section>
      ) : (
        <div className="coach-status flex justify-between items-center gap-3 text-xs">
          <span className="inline-flex gap-2 items-center text-[var(--accent)]"><Check size={15} />{phase === 'replying' ? c.thinking : c.ready}</span>
          <button onClick={resetConversation} disabled={phase === 'replying' || messages.length === 0} className="inline-flex gap-2 items-center min-h-10 text-[var(--fg-muted)] disabled:opacity-40"><RotateCcw size={14} />{c.reset}</button>
        </div>
      )}

      {messages.length === 0 ? (
        <section aria-labelledby="coach-starters-heading" className="coach-starters space-y-3">
          <h2 id="coach-starters-heading" className="oda-kicker text-[var(--fg-muted)]">{t('Conversation starters')}</h2>
          {[
            { label: t('Fear'), prompts: [c.fearPrompt, t('I keep putting this off because it has to be perfect.')] },
            { label: t('Overwhelm'), prompts: [c.overwhelmedPrompt, t('I have too many things on my plate and cannot tell which one matters.')] },
            { label: t('Hope and motivation'), prompts: [c.faithPrompt, t('I lost my momentum. Help me restart gently.')] },
          ].map(group => <div key={group.label} role="group" aria-label={group.label} className="coach-starter-group space-y-2">
            <p className="text-[12px] font-medium text-[var(--fg-muted)]">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.prompts.map(prompt => <button key={prompt} type="button" onClick={() => { setDraft(prompt); textarea.current?.focus(); }} className="coach-starter min-h-11 px-4 py-2 text-left text-[13px] leading-snug border border-[var(--border)] rounded-[18px] hover:border-[var(--accent)] transition-colors max-w-full">{prompt}</button>)}
            </div>
          </div>)}
        </section>
      ) : <div ref={log} role="log" aria-label={c.live} aria-live="off" tabIndex={0} onScroll={() => { const el = log.current; if (el) followOutput.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }} className="coach-log max-h-[52vh] min-h-40 overflow-y-auto space-y-5 pr-2 overscroll-contain">
        {messages.map((message, index) => <article key={index} className={message.role === 'user' ? 'coach-message coach-message-user ml-8 p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)]' : 'coach-message coach-message-assistant mr-4 pl-4 border-l-2 border-[var(--accent)]'}>
          <p className="text-[12px] font-semibold text-[var(--fg-muted)] mb-2">{message.role === 'user' ? c.you : c.name}</p>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content || c.thinking}</p>
        </article>)}
      </div>}

      {error && <div role="alert" className="coach-error p-3 bg-[var(--danger-soft)] text-[var(--danger)] rounded-[var(--radius-sm)] text-sm leading-relaxed">{error}</div>}

      {outOfMessages && (
        <section aria-labelledby="cloud-out-heading" className="coach-provider oda-card rounded-[22px] p-5 space-y-3">
          <h2 id="cloud-out-heading" className="oda-kicker text-[var(--fg)]">{t('That is all for this month')}</h2>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{cloudStatus.tier === 'coach'
            ? t('You have used this month’s cloud coach messages. They start again next month. The offline tools and the on-device coach are still here.')
            : t('You have used this month’s cloud coach messages. They start again next month, or a higher level gives you more. The offline tools and the on-device coach are still here.')}</p>
          <div className="flex flex-wrap gap-2">
            {cloudStatus.tier !== 'coach' && <button type="button" onClick={() => setActiveRoute('/app/upgrade')} className="oda-btn-primary min-h-12 px-5 rounded-full inline-flex items-center text-sm font-semibold">{t('See the levels')}</button>}
            <button type="button" onClick={() => chooseEngine(true)} className="min-h-12 px-5 rounded-full inline-flex items-center text-sm font-medium border border-[var(--border)] hover:border-[var(--accent)] transition-colors">{t('Use the on-device coach')}</button>
          </div>
        </section>
      )}

      <form onSubmit={send} className={outOfMessages ? 'hidden' : 'coach-form space-y-3'}>
        <div className="coach-composer border border-[var(--border-strong)] focus-within:border-[var(--accent)] rounded-[var(--radius-md)] p-3 bg-[var(--bg-elevated)]">
          <label htmlFor="coach-message" className="sr-only">{c.placeholder}</label>
          <textarea ref={textarea} id="coach-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={MAX_COACH_MESSAGE_LENGTH} rows={3} placeholder={c.placeholder} className="w-full resize-y min-h-20 max-h-60 bg-transparent text-[15px] leading-relaxed outline-none" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (inputReady) event.currentTarget.form?.requestSubmit(); } }} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><button type="button" onClick={toggleMicrophone} disabled={!SpeechInput || replying} aria-pressed={listening} aria-label={listening ? c.stopListening : c.listen} className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--bg-muted)] disabled:opacity-35">{listening ? <MicOff size={19} className="text-[var(--danger)]" /> : <Mic size={19} />}</button><span className="text-[11px] text-[var(--fg-subtle)]">{draft.length}/{MAX_COACH_MESSAGE_LENGTH}</span></div>
            {replying ? <button type="button" onClick={() => { controller.current?.abort(); if (cloudActive) { busy.current = false; setCloudBusy(false); setMessages(current => current.filter(m => m.content.trim())); } else engine.cancel(); }} aria-label={c.stop} className="w-11 h-11 bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center rounded-full"><Square size={17} /></button> : <button type="submit" disabled={!inputReady || !draft.trim()} aria-label={c.send} className="coach-send w-11 h-11 bg-[var(--accent)] text-white disabled:opacity-35 flex items-center justify-center rounded-full"><ArrowUp size={20} /></button>}
          </div>
        </div>
        {!cloudActive && phase === 'idle' && <p className="text-xs text-[var(--fg-muted)]">{c.notLoaded}</p>}
        {speechSupported && <label className="inline-flex items-center gap-2 text-xs min-h-9"><input type="checkbox" checked={readAloud} onChange={event => { setReadAloud(event.target.checked); if (!event.target.checked) window.speechSynthesis.cancel(); }} className="accent-[var(--accent)]" /><Volume2 size={14} />{c.speak}</label>}
        <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{SpeechInput ? c.voiceNote : c.noVoice}</p>
        {cloudActive ? (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{t('Cloud coach messages are sent to our server and to OpenAI to write the reply. They are not stored by ODA. The coach is an AI, not a therapist. If you are in danger, call your local emergency number (112 in Türkiye, 911 in the US).')}</p>
            <button type="button" onClick={() => chooseEngine(true)} className="text-[12px] underline underline-offset-4 min-h-11 text-[var(--fg-muted)]">{t('Use the on-device coach')}</button>
          </div>
        ) : <p className="text-[11px] text-[var(--fg-muted)]"><strong>{c.local}</strong> · {c.limit}</p>}
      </form>
      </div>
    </div>
  );
};
