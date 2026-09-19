import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { PageHeader, Button, Card, Badge, Disclaimer } from '../components/ui';
import { Award, RotateCcw, Check, ArrowRight } from 'lucide-react';
import { LifeScoreCategories } from '../types/models';
import { useT, N_ } from '../i18n';

const DOMAINS: {
  key: keyof LifeScoreCategories;
  label: string;
  helper: string;
}[] = [
  { key: 'money', label: N_('Money & Wealth'), helper: N_('How secure, intentional, and autonomous does your capital feel?') },
  { key: 'workAndPurpose', label: N_('Work & Purpose'), helper: N_('How aligned and high-leverage is your daily enterprise?') },
  { key: 'health', label: N_('Health & Vitality'), helper: N_('How resilient, well-rested, and energised is your physical body?') },
  { key: 'relationships', label: N_('Relationships'), helper: N_('How present, honest, and generous are you with your closest people?') },
  { key: 'discipline', label: N_('Discipline & Follow-Through'), helper: N_('How often do you do what you said you would, without delay?') },
  { key: 'environment', label: N_('Environment & Space'), helper: N_('How calm, orderly, and inspiring is your physical sanctuary?') },
  { key: 'learning', label: N_('Learning & Mastery'), helper: N_('How consistently are you mastering high-value skills?') },
  { key: 'personalMeaning', label: N_('Personal Meaning'), helper: N_('How clear and grounding is your reason for daily action?') },
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Future Life Score')}
        subtitle={t('A periodic diagnostic of the 8 essential foundations of your life.')}
        action={
          !isAssessing ? (
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsAssessing(true)}
            >
              {t('Retake Assessment')}
            </Button>
          ) : (
            <Button variant="accent" size="sm" icon={Check} onClick={handleSaveScore}>
              {t('Save Diagnostic Score')}
            </Button>
          )
        }
      />

      {/* Hero Score Display */}
      {latestScore && !isAssessing ? (
        <Card padding="lg" className="space-y-6 bg-[var(--bg-elevated)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* SVG Ring Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--color-sage)"
                  strokeWidth="10"
                  strokeDasharray={`${(latestScore.totalScore / 100) * 314} 314`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold font-display text-[var(--fg)]">
                  {latestScore.totalScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--fg-subtle)]">
                  / 100
                </span>
              </div>
            </div>

            {/* Interpretation Text */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <Badge variant="sage">{t('Diagnostic Overview')}</Badge>
              <h2 className="text-xl font-bold font-display text-[var(--fg)]">
                {latestScore.totalScore >= 75
                  ? t('Strong Life Foundation')
                  : latestScore.totalScore >= 50
                  ? t('Emerging Alignment')
                  : t('Starting Benchmark')}
              </h2>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                {t(latestScore.interpretation)}
              </p>
            </div>
          </div>

          {/* Lowest scoring areas highlight */}
          {latestScore.lowestAreas.length > 0 && (
            <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[var(--color-coral)] block">
                  {t('Priority Focus Domains:')}
                </span>
                <span className="text-[var(--fg-muted)]">
                  {t('{areas} are currently asking for deliberate attention.', { areas: latestScore.lowestAreas.map((area) => t(area)).join(t(' and ')) })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssessing(true)}
              >
                {t('Rebalance Sliders')}
              </Button>
            </div>
          )}
        </Card>
      ) : null}

      {/* Interactive Sliders (When assessing or first time) */}
      {isAssessing && (
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold font-display text-[var(--fg)]">
              {t('Rate Each Foundation (1 to 10)')}
            </h2>
            <span className="text-sm font-bold text-[var(--color-sage)]">
              {t('Live Score: {n} / 100', { n: calculatedTotal })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DOMAINS.map((domain) => {
              const val = scores[domain.key];
              return (
                <div
                  key={domain.key}
                  className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--fg)]">{t(domain.label)}</span>
                    <span className="font-mono font-bold text-sm text-[var(--color-slate)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">
                      {val} / 10
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--fg-subtle)]">{t(domain.helper)}</p>

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
                    className="w-full accent-[var(--color-slate)] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => setIsAssessing(false)}>
              {t('Cancel')}
            </Button>
            <Button variant="accent" onClick={handleSaveScore}>
              {t('Save Diagnostic ({n}/100)', { n: calculatedTotal })}
            </Button>
          </div>
        </Card>
      )}

      {/* History Log */}
      {data.lifeScores.length > 1 && (
        <Card padding="md" className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            {t('Score History')}
          </span>
          <div className="space-y-2 text-xs">
            {data.lifeScores.slice(1, 5).map((entry) => (
              <div
                key={entry.id}
                className="p-2.5 bg-[var(--bg-muted)] rounded-[var(--radius-sm)] flex justify-between items-center text-[var(--fg-muted)]"
              >
                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                <span className="font-bold text-[var(--fg)]">{entry.totalScore} / 100</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Disclaimer text={t('The Future Life Score is an honest reflection tool. It does not measure your worth — it measures alignment with your stated ambitions.')} />
    </div>
  );
};
