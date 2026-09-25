import React, { useEffect, useState } from 'react';
import { Modal } from '../ui';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import { FEELINGS, type DecisionFeeling } from '../../services/momentum';
import type { Mission } from '../../types/models';

/**
 * Thirty seconds of planning: name the feeling, name the obstacle, decide in
 * advance what you will do when it shows up (mental contrasting + if-then plan).
 */
export const DecisionPlanModal: React.FC<{ mission: Mission | null; isOpen: boolean; onClose: () => void; justSet?: boolean; initialFeeling?: DecisionFeeling }> = ({ mission, isOpen, onClose, justSet, initialFeeling }) => {
  const t = useT();
  const { updateDecision, showToast } = useApp();
  const [feeling, setFeeling] = useState<DecisionFeeling | undefined>();
  const [title, setTitle] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [ifThen, setIfThen] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !mission) return;
    setFeeling(initialFeeling ?? mission.plan?.feeling);
    setTitle(t(mission.title));
    setObstacle(mission.plan?.obstacle ?? '');
    setIfThen(mission.plan?.ifThen ?? '');
    // Re-seed only when the sheet opens for a decision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mission?.id]);

  if (!mission) return null;
  const tip = FEELINGS.find(f => f.key === feeling)?.tip;
  const shrink = feeling === 'overwhelming' || feeling === 'unclear';

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const nextTitle = title.trim();
      await updateDecision(mission.id, {
        plan: { feeling, obstacle: obstacle.trim() || undefined, ifThen: ifThen.trim() || undefined, plannedAt: new Date().toISOString() },
        ...(shrink && nextTitle && nextTitle !== t(mission.title) ? { title: nextTitle } : {}),
      });
      showToast(ifThen.trim() ? t('Plan saved. You know what to do when it gets hard.') : t('Saved.'), 'success');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full min-h-12 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[16px] text-[var(--fg)] outline-none focus:border-[var(--accent)]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={justSet ? t('Make it doable') : t('Your plan for today')}
      subtitle={t('Thirty seconds now saves you from deciding again later.')}
    >
      <div className="space-y-6 pb-2">
        <fieldset className="space-y-3">
          <legend className="text-[14px] font-semibold text-[var(--fg)] mb-3">{t('1. How does this decision feel right now?')}</legend>
          <div className="flex flex-wrap gap-2">
            {FEELINGS.map(f => (
              <button
                key={f.key}
                type="button"
                aria-pressed={feeling === f.key}
                onClick={() => setFeeling(feeling === f.key ? undefined : f.key)}
                className={`min-h-11 px-4 rounded-full text-[14px] font-medium transition-colors ${feeling === f.key ? 'bg-[var(--accent)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-inset)]'}`}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
          {tip && <p role="status" className="text-[14px] leading-relaxed text-[var(--fg-muted)] border-l-2 border-[var(--accent)] pl-3">{t(tip)}</p>}
          {shrink && (
            <div className="space-y-1.5">
              <label htmlFor="plan-title" className="text-[13px] font-medium text-[var(--fg)]">{t('Rewrite it smaller (optional)')}</label>
              <input id="plan-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={140} className={field} />
            </div>
          )}
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor="plan-obstacle" className="block text-[14px] font-semibold text-[var(--fg)]">{t('2. What could stop you today?')}</label>
          <input id="plan-obstacle" value={obstacle} onChange={e => setObstacle(e.target.value)} maxLength={140} placeholder={t('e.g. I’ll pick up my phone first')} className={field} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="plan-then" className="block text-[14px] font-semibold text-[var(--fg)]">{t('3. If that happens, I will…')}</label>
          <input id="plan-then" value={ifThen} onChange={e => setIfThen(e.target.value)} maxLength={160} placeholder={t('e.g. put the phone in another room and start for two minutes')} className={field} />
          <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">{t('Deciding in advance what you will do when the obstacle appears is one of the best-studied ways to follow through.')}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button type="button" onClick={onClose} className="h-12 px-5 rounded-[var(--radius-sm)] text-[15px] font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]">
            {justSet ? t('Skip for now') : t('Cancel')}
          </button>
          <button type="button" onClick={save} disabled={saving} className="h-12 w-full sm:flex-1 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[15px] font-semibold disabled:opacity-50">
            {t('Save plan')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
