import React, { useEffect, useState } from 'react';
import { Check, Feather, Mail } from 'lucide-react';
import { useApp } from '../store/useApp';
import { N_, useT } from '../i18n';
import { getNotebookDateKey, getNotebookStats } from '../services/notebook';
import { JournalWorkspace } from '../components/notebook/JournalWorkspace';
import { WrittenPractice } from '../components/notebook/WrittenPractice';
import { Practice369 } from '../components/notebook/Practice369';
import { AffirmationPractice, GratitudePractice } from '../components/notebook/DailyPractices';

const SCRIPTING_PROMPTS = [
  { id: 'ordinary-day', label: N_('An ordinary day in my future'), question: N_('It is an ordinary day in the life I am building. Where am I, what do I do, and how do I feel?') },
  { id: 'kept-promise', label: N_('A promise I keep'), question: N_('I keep this promise to myself. What does that look like in the small choices of today?') },
  { id: 'meaningful-work', label: N_('Work that feels meaningful'), question: N_('I am doing work that matters to me. Who does it help, and what does my day feel like?') },
];
const LETTER_PROMPTS = [
  { id: 'one-year', label: N_('To me, one year from now'), question: N_('What do I hope you kept, what did you let go of, and what would make me proud of you?') },
  { id: 'from-future', label: N_('From my future self'), question: N_('Looking back from a calmer future, what would I tell the person I am today?') },
  { id: 'hard-day', label: N_('For a day when I need courage'), question: N_('What do I want to remember when progress feels quiet or difficult?') },
];

export const Notebook: React.FC = () => {
  const t = useT();
  const { data } = useApp();
  const [section, setSection] = useState<'journal' | 'manifest'>('journal');
  const [today, setToday] = useState(getNotebookDateKey);
  useEffect(() => {
    const refresh = () => setToday(getNotebookDateKey());
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  if (!data) return <p role="status" className="text-sm text-[var(--fg-muted)]">{t('Opening your notebook…')}</p>;
  const stats = getNotebookStats(data);
  const tabs = [{ id: 'journal' as const, label: t('Journal') }, { id: 'manifest' as const, label: t('Practices') }];
  return <div className="space-y-6 text-[var(--fg)]">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Notebook')}</h1>
      <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Write your days. Give your future a voice.')}</p>
    </div>

    <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] px-4 min-h-[56px] py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-[var(--fg)]">{t('{n} day streak', { n: stats.currentStreak })}</span>
        <span className="text-[var(--fg-muted)]">{t('{n} days written', { n: stats.totalWritingDays })}</span>
        <span className="text-[var(--fg-muted)]">{t('Best {n}', { n: stats.bestStreak })}</span>
      </div>
      <span className="flex items-center gap-1.5 text-[var(--fg-muted)]" role="status">
        {stats.writtenToday
          ? <><Check className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.8} />{stats.rewardedToday > 0 ? t('Written today · D$ {amount}', { amount: stats.rewardedToday }) : t('Written today')}</>
          : t('First writing today earns up to D$25.')}
      </span>
    </div>

    <nav aria-label={t('Notebook sections')} className="flex p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
      {tabs.map(({ id, label }) => <button key={id} type="button" aria-pressed={section === id} aria-controls={`notebook-${id}-section`} onClick={() => setSection(id)} className={`flex-1 h-10 rounded-[var(--radius-xs)] text-sm font-medium cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 ${section === id ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>{label}</button>)}
    </nav>

    <section id="notebook-journal-section" hidden={section !== 'journal'} aria-label={t('Journal')}><JournalWorkspace today={today} /></section>
    <section id="notebook-manifest-section" hidden={section !== 'manifest'} aria-label={t('Practices')}>
      <p className="text-sm text-[var(--fg-muted)] mb-6">{t('Five ways to write. Pick one, use your own words, come back when it helps.')}</p>
      <div className="space-y-6">
        <WrittenPractice kind="scripting" number="01" title={N_('Scripting')} description={N_('Write a scene from the life you want as if you are already living it. Begin with the details you can see and feel.')} icon={Feather} prompts={SCRIPTING_PROMPTS} />
        <WrittenPractice kind="future_letter" number="02" title={N_('A letter across time')} description={N_('Write to the person you are becoming, or let that person write back to you.')} icon={Mail} prompts={LETTER_PROMPTS} />
        <Practice369 today={today} />
        <GratitudePractice today={today} />
        <AffirmationPractice active={section === 'manifest'} />
      </div>
    </section>
  </div>;
};
