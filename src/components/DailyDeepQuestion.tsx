import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Textarea, Badge } from './ui';
import { MessageCircleQuestion, Check, ArrowRight } from 'lucide-react';
import { useT, N_ } from '../i18n';

/**
 * Onboarding, spread over days: one deep question a day on the Home page instead of a 12-step form.
 * Writes straight into Two Futures / Future Self so the rest of the app fills in gradually.
 */

interface Q {
  id: string;
  group: 'allowing' | 'building' | 'identity';
  title: string;
  prompt: string;
}

const QUESTIONS: Q[] = [
  { id: 'q1', group: 'allowing', title: N_('Quiet dissatisfaction'), prompt: N_('What dissatisfaction have you quietly agreed to live with?') },
  { id: 'b1', group: 'building', title: N_('A day in the built life'), prompt: N_('Describe an ordinary day in the life you want, three years from now.') },
  { id: 'q2', group: 'allowing', title: N_('Unchanged complaints'), prompt: N_('What do you complain about but never actually take action to change?') },
  { id: 'b2', group: 'building', title: N_('Reputation & mastery'), prompt: N_('What are you known for, and by whom?') },
  { id: 'q3', group: 'allowing', title: N_('A Tuesday in 5 years'), prompt: N_('If nothing changes, describe an ordinary Tuesday five years from now.') },
  { id: 'identity', group: 'identity', title: N_('Identity statement'), prompt: N_('Finish the sentence: "I am becoming the kind of person who…"') },
  { id: 'q4', group: 'allowing', title: N_('Closed doors in 10 years'), prompt: N_('Ten years on this default path — which doors have quietly closed for good?') },
  { id: 'b3', group: 'building', title: N_('Sovereignty & money'), prompt: N_('What does financial autonomy let you say "no" to?') },
  { id: 'q5', group: 'allowing', title: N_('Late-life regret'), prompt: N_('At the end of your life, what would you deeply regret not trying?') },
  { id: 'b4', group: 'building', title: N_('Inner circle'), prompt: N_('Who is around you, and how do you show up for them?') },
  { id: 'q6', group: 'allowing', title: N_('Identity to release'), prompt: N_('Which outdated version of yourself would you need to let go of to change?') },
  { id: 'q7', group: 'allowing', title: N_('The shield'), prompt: N_('What fear, discomfort, or judgment are your current avoidance habits protecting you from?') },
  { id: 'q8', group: 'allowing', title: N_('The real price'), prompt: N_('What is that protection actually costing you in time, dignity, and potential?') },
];

const SKIP_KEY = 'oda_deep_q_skipped';

export const DailyDeepQuestion: React.FC = () => {
  const t = useT();
  const { data, saveTwoFutures, saveFutureSelf, setActiveRoute } = useApp();
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [skipped, setSkipped] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SKIP_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const todayKey = new Date().toISOString().slice(0, 10);

  const remaining = useMemo(() => {
    if (!data) return [];
    const a = data.twoFutures.allowingAnswers || {};
    const b = data.twoFutures.buildingAnswers || {};
    return QUESTIONS.filter((q) => {
      if (skipped.includes(`${todayKey}:${q.id}`)) return false;
      if (q.group === 'allowing') return !(a[q.id] || '').trim();
      if (q.group === 'building') return !(b[q.id] || b[q.id.replace('b', 'q')] || '').trim();
      return !(data.futureSelf?.identityStatement || '').trim();
    });
  }, [data, skipped, todayKey]);

  if (!data || remaining.length === 0) return null;

  const total = QUESTIONS.length;
  const answered = total - remaining.length;
  const q = remaining[0];

  const save = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      if (q.group === 'allowing') {
        await saveTwoFutures({ allowingAnswers: { ...(data.twoFutures.allowingAnswers || {}), [q.id]: answer.trim() } });
      } else if (q.group === 'building') {
        await saveTwoFutures({ buildingAnswers: { ...(data.twoFutures.buildingAnswers || {}), [q.id]: answer.trim() } });
      } else {
        await saveFutureSelf({ identityStatement: answer.trim() });
      }
      setAnswer('');
    } finally {
      setSaving(false);
    }
  };

  const skipToday = () => {
    const next = [...skipped, `${todayKey}:${q.id}`];
    setSkipped(next);
    try {
      localStorage.setItem(SKIP_KEY, JSON.stringify(next.slice(-30)));
    } catch {
      /* ignore */
    }
  };

  return (
    <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-coral)]/15 text-[var(--color-coral)] flex items-center justify-center">
            <MessageCircleQuestion className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">{t('One Question Today')}</h3>
            <p className="text-[11px] text-[var(--fg-muted)]">
              {q.group === 'allowing' ? t("The life you're allowing") : q.group === 'building' ? t("The life you're building") : t('Future self')} · {t(q.title)}
            </p>
          </div>
        </div>
        <Badge variant="subtle">{t('{answered} / {total} answered', { answered, total })}</Badge>
      </div>
      <p className="text-base font-display italic text-[var(--fg)] leading-relaxed">{t(q.prompt)}</p>
      <Textarea id={`deep-${q.id}`} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t('One honest paragraph is enough.')} />
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setActiveRoute('/app/two-futures')} className="text-[11px] text-[var(--fg-subtle)] underline cursor-pointer flex items-center gap-1">
          {t('See all answers')} <ArrowRight className="w-3 h-3" />
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={skipToday}>{t('Not today')}</Button>
          <Button variant="primary" size="sm" icon={Check} onClick={save} disabled={saving || !answer.trim()}>{t('Save answer')}</Button>
        </div>
      </div>
    </Card>
  );
};
