import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { RotateCcw, Check } from 'lucide-react';
import { LifeScoreCategories } from '../types/models';
import { useT, N_ } from '../i18n';

const DOMAINS: {
  key: keyof LifeScoreCategories;
  label: string;
  helper: string;
}[] = [
  { key: 'money', label: N_('Money'), helper: N_('How secure and intentional does your money feel?') },
  { key: 'workAndPurpose', label: N_('Work'), helper: N_('How aligned is your daily work?') },
  { key: 'health', label: N_('Health'), helper: N_('How rested and energised are you?') },
  { key: 'relationships', label: N_('Relationships'), helper: N_('How present are you with the people closest to you?') },
  { key: 'discipline', label: N_('Discipline'), helper: N_('How often do you do what you said you would?') },
  { key: 'environment', label: N_('Environment'), helper: N_('How calm and orderly is your space?') },
  { key: 'learning', label: N_('Learning'), helper: N_('How consistently are you learning something valuable?') },
  { key: 'personalMeaning', label: N_('Meaning'), helper: N_('How clear is your reason for showing up?') },
];

export const LifeScore: React.FC = () => {
  const { data, saveLifeScores } = useApp();
  const t = useT();

  const latestScore = data?.lifeScores?.[0];

  const [isAssessing, setIsAssessing] = useState(false);
  const [scores, setScores] = useState<LifeScoreCategories>(
    latestScore?.scores || {
      money: 6,
      workAndPurpose: 7,
      health: 8,
      relationships: 7,
      discipline: 6,
      environment: 7,
      learning: 8,
      personalMeaning: 7,
    }
  );

  if (!data) return null;

  const currentScoreValues = Object.values(scores) as number[];
  const calculatedTotal = Math.round(
    (currentScoreValues.reduce((a, b) => a + b, 0) / (currentScoreValues.length * 10)) * 100
  );

  const handleSaveScore = async () => {
    await saveLifeScores(scores);
    setIsAssessing(false);
  };

  const primaryBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold shrink-0';
  const secondaryBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium shrink-0';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Life score')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Eight areas, rated by you.')}</p>
        </div>
        {!isAssessing ? (
          <button type="button" onClick={() => setIsAssessing(true)} className={secondaryBtn}>
            <RotateCcw className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Rate')}
          </button>
        ) : (
          <button type="button" onClick={handleSaveScore} className={primaryBtn}>
            <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Save')}
          </button>
        )}
      </div>

      {latestScore && !isAssessing ? (
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-strong)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray={`${(latestScore.totalScore / 100) * 314} 314`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{latestScore.totalScore}</span>
              </div>
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                {latestScore.totalScore >= 75
                  ? t('Strong foundation')
                  : latestScore.totalScore >= 50
                  ? t('Getting there')
                  : t('Starting point')}
              </h2>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{t(latestScore.interpretation)}</p>
            </div>
          </div>

          {latestScore.lowestAreas.length > 0 && (
            <p className="text-sm text-[var(--fg-muted)] border-t border-[var(--border)] pt-4">
              {t('{areas} need the most attention right now.', {
                areas: latestScore.lowestAreas.map((area) => t(area)).join(t(' and ')),
              })}
            </p>
          )}
        </div>
      ) : null}

      {isAssessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Rate each area')}</h2>
            <span className="text-sm text-[var(--accent)] font-medium">{calculatedTotal} / 100</span>
          </div>

          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {DOMAINS.map((domain) => {
              const val = scores[domain.key];
              return (
                <div key={domain.key} className="px-4 py-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-[var(--fg)]">{t(domain.label)}</span>
                    <span className="text-[var(--fg-muted)]">{val} / 10</span>
                  </div>
                  <p className="text-xs text-[var(--fg-subtle)]">{t(domain.helper)}</p>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={val}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [domain.key]: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAssessing(false)} className={secondaryBtn}>
              {t('Cancel')}
            </button>
            <button type="button" onClick={handleSaveScore} className={primaryBtn}>
              {t('Save')}
            </button>
          </div>
        </div>
      )}

      {data.lifeScores.length > 1 && (
        <div className="space-y-3">
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('History')}</h2>
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {data.lifeScores.slice(1, 5).map((entry) => (
              <div key={entry.id} className="px-4 min-h-[52px] flex justify-between items-center text-sm">
                <span className="text-[var(--fg-muted)]">{new Date(entry.createdAt).toLocaleDateString()}</span>
                <span className="font-medium text-[var(--fg)]">{entry.totalScore} / 100</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--fg-subtle)]">
        {t('This is not your worth. It measures how close your life is to what you said you want.')}
      </p>
    </div>
  );
};
