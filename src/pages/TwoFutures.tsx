import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Check, Pencil, Share2 } from 'lucide-react';
import { DefaultFutureStudio } from '../components/DefaultFutureStudio';
import { useT } from '../i18n';

export const TwoFutures: React.FC = () => {
  const { data, saveTwoFutures, setActiveRoute } = useApp();
  const t = useT();

  const [isEditing, setIsEditing] = useState(false);
  const [antiVision, setAntiVision] = useState(data?.twoFutures?.antiVision || '');
  const [vision, setVision] = useState(data?.twoFutures?.vision || '');

  if (!data) return null;

  const totalVotes = (data.twoFutures.buildingVotes || 0) + (data.twoFutures.allowingVotes || 0);
  const buildingPct = totalVotes > 0 ? Math.round(((data.twoFutures.buildingVotes || 0) / totalVotes) * 100) : 75;

  const handleSave = async () => {
    await saveTwoFutures({
      antiVision: antiVision.trim(),
      vision: vision.trim(),
    });
    setIsEditing(false);
  };

  const textarea =
    'w-full p-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] resize-y min-h-[100px] leading-relaxed';
  const secondaryBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium';
  const primaryBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Two futures')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">
          {t('The life you are building, and the one you get if nothing changes.')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className={secondaryBtn}>
            <Pencil className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Edit')}
          </button>
        ) : (
          <button type="button" onClick={handleSave} className={primaryBtn}>
            <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Save')}
          </button>
        )}
        <button type="button" onClick={() => setActiveRoute('/two-futures')} className={secondaryBtn}>
          <Share2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
          {t('Share')}
        </button>
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[var(--fg)]">{t('{n}% of decisions building', { n: buildingPct })}</span>
          <span className="text-[var(--fg-muted)]">
            {t('{a} to {b}', {
              a: data.twoFutures.buildingVotes || 0,
              b: data.twoFutures.allowingVotes || 0,
            })}
          </span>
        </div>
        <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${buildingPct}%` }}
          />
        </div>
        <p className="text-xs text-[var(--fg-muted)]">
          {t('No penalty for missed days. Just the math of where your days go.')}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('If nothing changes')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          {isEditing ? (
            <div className="space-y-1.5">
              <label htmlFor="edit-anti-vision" className="block text-sm text-[var(--fg-muted)]">
                {t('I refuse to become someone who...')}
              </label>
              <textarea
                id="edit-anti-vision"
                value={antiVision}
                onChange={(e) => setAntiVision(e.target.value)}
                rows={4}
                className={textarea}
              />
            </div>
          ) : (
            <p className="text-[15px] text-[var(--fg)] leading-relaxed">{t(data.twoFutures.antiVision)}</p>
          )}
          <div className="space-y-3 text-sm border-t border-[var(--border)] pt-4">
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('What you keep accepting')}</div>
              <div className="text-[var(--fg)] mt-0.5">
                {data.twoFutures.allowingAnswers?.q1 || t('Letting tiredness decide what gets done.')}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('What avoidance protects')}</div>
              <div className="text-[var(--fg)] mt-0.5">
                {data.twoFutures.allowingAnswers?.q7 || t('Fear of being judged.')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('What you are building')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          {isEditing ? (
            <div className="space-y-1.5">
              <label htmlFor="edit-vision" className="block text-sm text-[var(--fg-muted)]">
                {t('I am building a life where...')}
              </label>
              <textarea
                id="edit-vision"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows={4}
                className={textarea}
              />
            </div>
          ) : (
            <p className="text-[15px] text-[var(--fg)] leading-relaxed">{t(data.twoFutures.vision)}</p>
          )}
          <div className="space-y-3 text-sm border-t border-[var(--border)] pt-4">
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('An ordinary day in three years')}</div>
              <div className="text-[var(--fg)] mt-0.5">
                {data.twoFutures.buildingAnswers?.b1 ||
                  data.twoFutures.buildingAnswers?.q1 ||
                  t('Calm mornings, deep work, money that gives you room.')}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('What money lets you say no to')}</div>
              <div className="text-[var(--fg)] mt-0.5">
                {data.twoFutures.buildingAnswers?.b3 ||
                  data.twoFutures.buildingAnswers?.q3 ||
                  t('Frantic schedules and work that does not fit.')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DefaultFutureStudio />

      <p className="text-xs text-[var(--fg-subtle)]">
        {t('Reread this once a week. It keeps your daily choices pointed the right way.')}
      </p>
    </div>
  );
};
