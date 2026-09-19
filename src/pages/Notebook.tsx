import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Feather, Mail, Sparkles } from 'lucide-react';
import { useApp } from '../store/useApp';
import { N_, useT } from '../i18n';
import { getNotebookDateKey, getNotebookStats } from '../services/notebook';
import { PageHeader } from '../components/ui';
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
  return <div className="space-y-6 text-[var(--fg)]">
    <PageHeader title={t('Notebook')} subtitle={t('A quiet place to write your days and give your future a voice.')} />
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-[var(--border)] py-3 text-xs">
      <div className="flex flex-wrap gap-x-5 gap-y-2"><span>{t('{n} day writing streak', { n: stats.currentStreak })}</span><span className="text-[var(--fg-muted)]">{t('{n} writing days', { n: stats.totalWritingDays })}</span><span className="text-[var(--fg-muted)]">{t('Best: {n} days', { n: stats.bestStreak })}</span></div>
      <span className="flex items-center gap-1.5 text-[var(--fg-muted)]" role="status">{stats.writtenToday ? <><Check className="w-3.5 h-3.5 text-[var(--color-sage)]" />{stats.rewardedToday > 0 ? t('Written today · D$ {amount} earned', { amount: stats.rewardedToday }) : t('Today’s writing is saved')}</> : t('Your first writing today can earn up to D$25.')}</span>
    </div>
    <nav aria-label={t('Notebook sections')} className="flex gap-6 border-b border-[var(--border)]">
      {[{ id: 'journal' as const, label: t('Journal'), Icon: BookOpen }, { id: 'manifest' as const, label: t('Manifest'), Icon: Sparkles }].map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={section === id} aria-controls={`notebook-${id}-section`} onClick={() => setSection(id)} className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${section === id ? 'border-[var(--color-coral)] text-[var(--fg)]' : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}><Icon className="w-4 h-4" aria-hidden="true" />{label}</button>)}
    </nav>
    <section id="notebook-journal-section" hidden={section !== 'journal'} aria-label={t('Journal')}><JournalWorkspace today={today} /></section>
    <section id="notebook-manifest-section" hidden={section !== 'manifest'} aria-label={t('Manifest')}>
      <div className="mb-6 max-w-2xl"><h2 className="font-display text-3xl sm:text-4xl">{t('Make room for what you are becoming.')}</h2><p className="text-sm leading-relaxed text-[var(--fg-muted)] mt-2">{t('Five writing practices to explore your intentions. Choose one, use your own words, and return when it helps.')}</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <WrittenPractice kind="scripting" number="01" title={N_('Scripting')} description={N_('Write a scene from the life you want as if you are already living it. Begin with the details you can see and feel.')} icon={Feather} prompts={SCRIPTING_PROMPTS} />
        <WrittenPractice kind="future_letter" number="02" title={N_('A letter across time')} description={N_('Write to the person you are becoming, or let that person write back to you.')} icon={Mail} prompts={LETTER_PROMPTS} />
        <Practice369 today={today} />
        <GratitudePractice today={today} />
        <AffirmationPractice active={section === 'manifest'} />
      </div>
    </section>
  </div>;
};
