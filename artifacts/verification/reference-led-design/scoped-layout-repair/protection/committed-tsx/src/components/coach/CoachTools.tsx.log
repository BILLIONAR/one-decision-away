import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, Footprints, Scale, Wind, X } from 'lucide-react';
import { useT } from '../../i18n';
import { useApp } from '../../store/useApp';

/* Offline guided exercises for the Coach tab. Nothing here needs the on-device AI model. */

type ToolId = 'breathing' | 'grounding' | 'reframe' | 'unstick';

const TOOL_META: { id: ToolId; icon: typeof Wind; tint: string }[] = [
  { id: 'breathing', icon: Wind, tint: 'oda-tint-blue' },
  { id: 'grounding', icon: Eye, tint: 'oda-tint-sage' },
  { id: 'reframe', icon: Scale, tint: 'oda-tint-rose' },
  { id: 'unstick', icon: Footprints, tint: 'oda-tint-sand' },
];

const FIELD_CLASS = 'w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-strong)] focus:border-[var(--accent)] bg-[var(--bg-elevated)] p-3 text-[15px] leading-relaxed outline-none';
const SECONDARY_BTN = 'min-h-11 px-4 rounded-full inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--fg-muted)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors disabled:opacity-40';
const PRIMARY_BTN = 'oda-btn-primary min-h-12 px-5 rounded-full inline-flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-40';

function prefersReducedMotion(): boolean {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return true; }
}

function localDayKeyUtc(): string {
  // Same key Today.tsx uses to decide whether today already has a decision.
  return new Date().toISOString().slice(0, 10);
}

/** Shared frame: title, step counter, progress dots, body, footer. */
const ToolCard: React.FC<{
  title: string; step: number; total: number; onClose: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>; children: React.ReactNode;
}> = ({ title, step, total, onClose, headingRef, children }) => {
  const t = useT();
  const finished = step >= total - 1;
  return (
    <div className="oda-card rounded-[22px] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 ref={headingRef} tabIndex={-1} className="oda-display text-[22px] leading-tight outline-none">{title}</h3>
          <p className="text-[12px] text-[var(--fg-muted)]" aria-live="polite">
            {finished ? t('All done') : t('Step {n} of {total}', { n: step + 1, total: total - 1 })}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label={t('Close exercise')} className="w-11 h-11 -mt-1 -mr-2 shrink-0 inline-flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]">
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 max-w-8 rounded-full ${i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`} />
        ))}
      </div>
      {children}
    </div>
  );
};

const Nav: React.FC<{
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean; backLabel?: string;
}> = ({ onBack, onNext, nextLabel, nextDisabled, backLabel }) => {
  const t = useT();
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {onBack ? <button type="button" onClick={onBack} className={SECONDARY_BTN}><ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />{backLabel ?? t('Back')}</button> : <span />}
      {onNext && <button type="button" onClick={onNext} disabled={nextDisabled} className={PRIMARY_BTN}>{nextLabel ?? t('Next')}<ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" /></button>}
    </div>
  );
};

/* 1. Box breathing ---------------------------------------------------------------- */

const PHASE_SECONDS = 4;
const ROUNDS = 4;
const TOTAL_SECONDS = PHASE_SECONDS * 4 * ROUNDS;
const CORNERS: [number, number][] = [[20, 180], [20, 20], [180, 20], [180, 180]];

const BoxBreathing: React.FC<{ onClose: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }> = ({ onClose, headingRef }) => {
  const t = useT();
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const reduced = useMemo(prefersReducedMotion, []);
  const started = useRef(0);

  useEffect(() => {
    if (step !== 1) return;
    started.current = Date.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      const seconds = (Date.now() - started.current) / 1000;
      if (seconds >= TOTAL_SECONDS) { window.clearInterval(id); setElapsed(TOTAL_SECONDS); setStep(2); }
      else setElapsed(seconds);
    }, reduced ? 250 : 80);
    return () => window.clearInterval(id);
  }, [step, reduced]);

  const phaseFloat = (elapsed % (PHASE_SECONDS * 4)) / PHASE_SECONDS;
  const side = Math.min(3, Math.floor(phaseFloat));
  const frac = phaseFloat - side;
  const [x0, y0] = CORNERS[side];
  const [x1, y1] = CORNERS[(side + 1) % 4];
  const dot = { x: x0 + (x1 - x0) * frac, y: y0 + (y1 - y0) * frac };
  const labels = [t('Breathe in'), t('Hold'), t('Breathe out'), t('Hold')];
  const secondsLeftInPhase = Math.max(1, Math.ceil(PHASE_SECONDS - frac * PHASE_SECONDS - 0.001));
  const round = Math.min(ROUNDS, Math.floor(elapsed / (PHASE_SECONDS * 4)) + 1);

  return (
    <ToolCard title={t('Box breathing')} step={step} total={3} onClose={onClose} headingRef={headingRef}>
      {step === 0 && (
        <>
          <p className="text-[15px] leading-relaxed">{t('Breathe in for 4, hold for 4, breathe out for 4, hold for 4. Four rounds take about a minute.')}</p>
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('Sit comfortably and let your shoulders drop. If holding your breath feels uncomfortable, simply pause for a moment instead, or stop whenever you like.')}</p>
          <Nav onNext={() => setStep(1)} nextLabel={t('Begin')} />
        </>
      )}
      {step === 1 && (
        <>
          <div className="relative mx-auto w-full max-w-[240px] aspect-square">
            <svg viewBox="0 0 200 200" role="img" aria-label={t('A square outline that guides your breathing')} className="absolute inset-0 w-full h-full">
              {CORNERS.map(([ax, ay], i) => {
                const [bx, by] = CORNERS[(i + 1) % 4];
                return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} strokeWidth={i === side ? 5 : 3} strokeLinecap="round" stroke={i === side ? 'var(--accent)' : 'var(--border-strong)'} />;
              })}
              {!reduced && <circle cx={dot.x} cy={dot.y} r={8} fill="var(--accent)" />}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="oda-numeral text-[44px] leading-none">{secondsLeftInPhase}</span>
              <span className="text-[13px] text-[var(--fg-muted)] mt-1">{labels[side]}</span>
            </div>
          </div>
          <p role="status" className="sr-only">{labels[side]}</p>
          <p className="text-center text-[12px] text-[var(--fg-muted)]">{t('Round {n} of {total}', { n: round, total: ROUNDS })}</p>
          <Nav onBack={() => setStep(0)} backLabel={t('Stop')} />
        </>
      )}
      {step === 2 && (
        <>
          <p className="text-[15px] leading-relaxed">{t('That was a minute for your body. Notice whether anything feels a little quieter, even if only slightly.')}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStep(0)} className={SECONDARY_BTN}>{t('Again')}</button>
            <button type="button" onClick={onClose} className={PRIMARY_BTN}><Check size={16} strokeWidth={1.8} aria-hidden="true" />{t('Done')}</button>
          </div>
        </>
      )}
    </ToolCard>
  );
};

/* 2. 5-4-3-2-1 grounding ---------------------------------------------------------- */

const Grounding: React.FC<{ onClose: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }> = ({ onClose, headingRef }) => {
  const t = useT();
  const [step, setStep] = useState(0);
  const steps = [
    { n: 5, title: t('Five things you can see'), hint: t('Look slowly around the room. Name each one, out loud or in your head.') },
    { n: 4, title: t('Four things you can touch'), hint: t('Feel your feet on the floor, the fabric of your clothes, the surface under your hands.') },
    { n: 3, title: t('Three things you can hear'), hint: t('Near sounds and far sounds. Include the quiet ones.') },
    { n: 2, title: t('Two things you can smell'), hint: t('If nothing stands out, remember a smell you like.') },
    { n: 1, title: t('One thing you can taste'), hint: t('A sip of water works, or simply notice the taste in your mouth.') },
  ];
  const current = steps[step];
  return (
    <ToolCard title={t('5-4-3-2-1 grounding')} step={step} total={6} onClose={onClose} headingRef={headingRef}>
      {current ? (
        <>
          <div className="flex items-center gap-4">
            <span className="oda-numeral text-[56px] leading-none text-[var(--accent)]" aria-hidden="true">{current.n}</span>
            <p className="text-[17px] leading-snug oda-display">{current.title}</p>
          </div>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">{current.hint}</p>
          <Nav onBack={step > 0 ? () => setStep(step - 1) : undefined} onNext={() => setStep(step + 1)} nextLabel={step === steps.length - 1 ? t('Finish') : t('Next')} />
        </>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed">{t('You have named what is here, right now. Take one slow breath and see how you feel compared to a few minutes ago.')}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStep(0)} className={SECONDARY_BTN}>{t('Again')}</button>
            <button type="button" onClick={onClose} className={PRIMARY_BTN}><Check size={16} strokeWidth={1.8} aria-hidden="true" />{t('Done')}</button>
          </div>
        </>
      )}
    </ToolCard>
  );
};

/* Make it today's decision ------------------------------------------------------- */

type DecisionState = 'idle' | 'saving' | 'done';

function useTodayDecision() {
  const { data } = useApp();
  const todayStr = localDayKeyUtc();
  return data?.missions.find((m) => m.isOneDecision && (m.scheduledFor === todayStr || m.status === 'active'));
}

const DecisionButton: React.FC<{ title: string; onCreated?: () => void }> = ({ title, onCreated }) => {
  const t = useT();
  const { setOneDecision } = useApp();
  const existing = useTodayDecision();
  const [state, setState] = useState<DecisionState>('idle');
  const clean = title.trim();
  if (state === 'done') return <p role="status" className="text-[13px] text-[var(--accent)] inline-flex items-center gap-2"><Check size={15} aria-hidden="true" />{t('This is now your one decision for today.')}</p>;
  if (existing) return <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">{t('You already have a decision for today, so this stays as a note.')}</p>;
  return (
    <button type="button" disabled={!clean || state === 'saving'} onClick={async () => {
      setState('saving');
      try { onCreated?.(); await setOneDecision(clean); setState('done'); } catch { setState('idle'); }
    }} className={PRIMARY_BTN}>{t("Make it today's decision")}</button>
  );
};

/* 3. Reframe a thought ------------------------------------------------------------ */

const Reframe: React.FC<{ onClose: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }> = ({ onClose, headingRef }) => {
  const t = useT();
  const { saveNotebookEntry } = useApp();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<string[]>(['', '', '', '', '', '']);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fields = [
    { label: t('Situation'), question: t('What happened?'), hint: t('Only the facts, as a camera would record them.'), placeholder: t('Example: My manager asked to talk tomorrow.'), required: true },
    { label: t('The thought'), question: t('What is the thought?'), hint: t('The exact words your mind is telling you.'), placeholder: t('Example: I am about to be let go.'), required: true },
    { label: t('Evidence for'), question: t('What supports this thought?'), hint: t('Facts only. A strong feeling is real, but it is not proof.'), placeholder: t('Example: The meeting was scheduled without a reason.'), required: false },
    { label: t('Evidence against'), question: t('What does not fit this thought?'), hint: t('Other explanations, times it went differently, what a friend would point out.'), placeholder: t('Example: My last review was good, and they often meet people one to one.'), required: false },
    { label: t('A more balanced thought'), question: t('Write a kinder, more balanced thought'), hint: t('Say it as you would to a friend. It should be believable, not forced positivity.'), placeholder: t('Example: I do not know yet. I can prepare and listen.'), required: true },
    { label: t('Next small step'), question: t('Choose one small next step'), hint: t('Small enough that you could start within a day.'), placeholder: t('Example: Write down two questions to ask tomorrow.'), required: true },
  ];
  const isSummary = step === fields.length;
  const field = fields[step];
  const set = (index: number, value: string) => setValues((current) => current.map((item, i) => (i === index ? value : item)));

  async function saveToNotebook() {
    if (saving || saved) return;
    setSaving(true);
    try {
      const content = fields.map((item, i) => `${item.label}\n${values[i].trim() || '-'}`).join('\n\n');
      await saveNotebookEntry({ kind: 'journal', title: t('Reframe a thought'), content });
      setSaved(true);
    } catch { /* the store already shows an error toast */ } finally { setSaving(false); }
  }

  return (
    <ToolCard title={t('Reframe a thought')} step={step} total={fields.length + 1} onClose={onClose} headingRef={headingRef}>
      {field ? (
        <>
          <div className="space-y-1.5">
            <label htmlFor={`reframe-${step}`} className="block text-[16px] font-medium leading-snug">{field.question}</label>
            <p id={`reframe-hint-${step}`} className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{field.hint}</p>
          </div>
          <textarea id={`reframe-${step}`} aria-describedby={`reframe-hint-${step}`} value={values[step]} onChange={(event) => set(step, event.target.value)} maxLength={400} rows={4} placeholder={field.placeholder} className={FIELD_CLASS} />
          <Nav onBack={step > 0 ? () => setStep(step - 1) : undefined} onNext={() => setStep(step + 1)}
            nextDisabled={field.required && !values[step].trim()}
            nextLabel={!field.required && !values[step].trim() ? t('Skip') : step === fields.length - 1 ? t('See my reframe') : t('Next')} />
        </>
      ) : (
        <>
          <dl className="space-y-3">
            {fields.map((item, i) => values[i].trim() && (
              <div key={item.label}>
                <dt className="oda-kicker text-[var(--fg-muted)]">{item.label}</dt>
                <dd className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap ${i === 4 ? 'font-medium' : ''}`}>{values[i].trim()}</dd>
              </div>
            ))}
          </dl>
          <div className="space-y-3 pt-1">
            {saved
              ? <p role="status" className="text-[13px] text-[var(--accent)] inline-flex items-center gap-2"><Check size={15} aria-hidden="true" />{t('Saved to your notebook.')}</p>
              : <button type="button" onClick={saveToNotebook} disabled={saving} className={SECONDARY_BTN}>{t('Save to notebook')}</button>}
            <div><DecisionButton title={values[5]} /></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button type="button" onClick={() => setStep(fields.length - 1)} className={SECONDARY_BTN}><ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />{t('Back')}</button>
            <button type="button" onClick={onClose} className={PRIMARY_BTN}><Check size={16} strokeWidth={1.8} aria-hidden="true" />{t('Done')}</button>
          </div>
        </>
      )}
    </ToolCard>
  );
};

/* 4. Unstick in 2 minutes --------------------------------------------------------- */

interface PendingPlan { when: string; action: string }

const Unstick: React.FC<{ onClose: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }> = ({ onClose, headingRef }) => {
  const t = useT();
  const { updateDecision } = useApp();
  const decision = useTodayDecision();
  const [step, setStep] = useState(0);
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [when, setWhen] = useState('');
  const [then, setThen] = useState('');
  const pending = useRef<PendingPlan | null>(null);

  // Once the decision this exercise created appears in the store, attach the if-then plan to it.
  useEffect(() => {
    const plan = pending.current;
    if (!plan || !decision || decision.plan) return;
    pending.current = null;
    void updateDecision(decision.id, { plan: { obstacle: t('it is {when}', { when: plan.when }), ifThen: plan.action, plannedAt: new Date().toISOString() } });
  }, [decision, updateDecision, t]);

  const sentence = t('If it is {when}, then I will {action}', { when: when.trim(), action: then.trim() });
  const goTo = (next: number) => {
    if (next === 2 && !then.trim()) setThen(action.trim());
    setStep(next);
  };

  return (
    <ToolCard title={t('Unstick in 2 minutes')} step={step} total={4} onClose={onClose} headingRef={headingRef}>
      {step === 0 && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="unstick-task" className="block text-[16px] font-medium leading-snug">{t('What are you putting off?')}</label>
            <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('Name it in a few words. It does not need to be neat.')}</p>
          </div>
          <input id="unstick-task" value={task} onChange={(event) => setTask(event.target.value)} maxLength={120} placeholder={t('Example: Send the invoice')} className={`${FIELD_CLASS} min-h-12`} />
          <Nav onNext={() => goTo(1)} nextDisabled={!task.trim()} />
        </>
      )}
      {step === 1 && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="unstick-action" className="block text-[16px] font-medium leading-snug">{t('Shrink it to the first 2 minutes')}</label>
            <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('What is the smallest first action for "{task}" that takes about 2 minutes? Open the file, write one sentence, put your shoes on.', { task: task.trim() })}</p>
          </div>
          <textarea id="unstick-action" value={action} onChange={(event) => setAction(event.target.value)} maxLength={160} rows={3} placeholder={t('Example: Open the invoice template and type the client name')} className={FIELD_CLASS} />
          <Nav onBack={() => goTo(0)} onNext={() => goTo(2)} nextDisabled={!action.trim()} />
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-1.5">
            <p className="block text-[16px] font-medium leading-snug">{t('Decide when and where')}</p>
            <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('A plan with a time or place attached often works better than a good intention alone.')}</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="unstick-when" className="block text-[13px] font-medium">{t('If it is')}</label>
              <input id="unstick-when" value={when} onChange={(event) => setWhen(event.target.value)} maxLength={80} placeholder={t('Example: 9 am at my desk')} className={`${FIELD_CLASS} min-h-12`} />
            </div>
            <div className="space-y-1">
              <label htmlFor="unstick-then" className="block text-[13px] font-medium">{t('then I will')}</label>
              <textarea id="unstick-then" value={then} onChange={(event) => setThen(event.target.value)} maxLength={160} rows={2} className={FIELD_CLASS} />
            </div>
          </div>
          <Nav onBack={() => goTo(1)} onNext={() => goTo(3)} nextDisabled={!when.trim() || !then.trim()} />
        </>
      )}
      {step === 3 && (
        <>
          <p className="oda-display text-[20px] leading-snug break-words">{sentence}</p>
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('Two minutes is the whole task for now. Once you have started, continuing is optional.')}</p>
          <DecisionButton title={then} onCreated={() => { pending.current = { when: when.trim(), action: then.trim() }; }} />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button type="button" onClick={() => setStep(2)} className={SECONDARY_BTN}><ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />{t('Back')}</button>
            <button type="button" onClick={onClose} className={PRIMARY_BTN}><Check size={16} strokeWidth={1.8} aria-hidden="true" />{t('Done')}</button>
          </div>
        </>
      )}
    </ToolCard>
  );
};

/* Section ------------------------------------------------------------------------ */

export const CoachTools: React.FC = () => {
  const t = useT();
  const [open, setOpen] = useState<ToolId | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const tileRefs = useRef<Partial<Record<ToolId, HTMLButtonElement | null>>>({});
  const lastOpened = useRef<ToolId | null>(null);

  const names: Record<ToolId, { title: string; note: string }> = {
    breathing: { title: t('Box breathing'), note: t('1 minute') },
    grounding: { title: t('5-4-3-2-1 grounding'), note: t('2 minutes') },
    reframe: { title: t('Reframe a thought'), note: t('5 minutes') },
    unstick: { title: t('Unstick in 2 minutes'), note: t('Start small') },
  };

  useEffect(() => {
    if (open) headingRef.current?.focus();
    else if (lastOpened.current) tileRefs.current[lastOpened.current]?.focus();
  }, [open]);

  const close = () => setOpen(null);
  const start = (id: ToolId) => { lastOpened.current = id; setOpen(id); };

  return (
    <section aria-labelledby="coach-tools-heading" className="space-y-3">
      <div className="space-y-1">
        <h2 id="coach-tools-heading" className="oda-kicker text-[var(--fg-muted)]">{t('Tools you can use right now')}</h2>
        {!open && <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('Short guided exercises. They work offline and do not need the AI coach.')}</p>}
      </div>
      {open ? (
        <>
          {open === 'breathing' && <BoxBreathing onClose={close} headingRef={headingRef} />}
          {open === 'grounding' && <Grounding onClose={close} headingRef={headingRef} />}
          {open === 'reframe' && <Reframe onClose={close} headingRef={headingRef} />}
          {open === 'unstick' && <Unstick onClose={close} headingRef={headingRef} />}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {TOOL_META.map(({ id, icon: Icon, tint }) => (
            <button key={id} type="button" ref={(el) => { tileRefs.current[id] = el; }} onClick={() => start(id)} className="oda-tile">
              <span className={`oda-tile-icon ${tint}`}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>
                <span className="block text-[14px] font-semibold leading-snug">{names[id].title}</span>
                <span className="block text-[12px] text-[var(--fg-muted)]">{names[id].note}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">{t('These tools are not therapy or medical care. If you are in crisis or in danger, contact your local emergency services or a crisis line.')}</p>
    </section>
  );
};
