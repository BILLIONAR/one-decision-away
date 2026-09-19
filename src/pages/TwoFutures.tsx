import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { PageHeader, Button, Card, Field, Textarea, Badge, Disclaimer } from '../components/ui';
import { Check, Edit2, Share2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Two Futures')}
        subtitle={t('The life you are building against the life you will live if nothing changes.')}
        action={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" icon={Edit2} onClick={() => setIsEditing(true)}>
                {t('Edit Statements')}
              </Button>
            ) : (
              <Button variant="accent" size="sm" icon={Check} onClick={handleSave}>
                {t('Save Declarations')}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={Share2}
              onClick={() => setActiveRoute('/two-futures')}
            >
              {t('Public Compass')}
            </Button>
          </div>
        }
      />

      {/* Trajectory Bar */}
      <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Trajectory Momentum')}
            </span>
            <div className="text-sm font-semibold text-[var(--fg)]">
              {t('{pct}% of daily decisions have cast votes for the Built Future', { pct: buildingPct })}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Badge variant="sage">{t('Building: {n}', { n: data.twoFutures.buildingVotes || 0 })}</Badge>
            <Badge variant="subtle">{t('Default: {n}', { n: data.twoFutures.allowingVotes || 0 })}</Badge>
          </div>
        </div>

        <div className="h-3.5 w-full bg-[#9A8F86]/30 rounded-full overflow-hidden flex border border-[var(--border)]">
          <div
            className="h-full bg-[var(--color-sage)] transition-all duration-500 ease-out"
            style={{ width: `${buildingPct}%` }}
          />
        </div>

        <p className="text-[11px] text-[var(--fg-subtle)] pt-1 leading-relaxed">
          {t('There is no penalty for missed days — only the quiet math of where your days go.')}
        </p>
      </Card>

      {/* Side-by-Side Declarations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Life You're Allowing */}
        <Card
          padding="lg"
          className="border-2 border-[#9A8F86]/40 bg-[var(--bg-elevated)] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A8F86]">
              {t("The Life You're Allowing")}
            </span>
            <Badge variant="subtle">{t('Default Future')}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-[var(--fg)]">
              {t('Anti-Vision Statement')}
            </h3>
            {isEditing ? (
              <Field id="edit-anti-vision" label={t('I refuse to become someone who...')}>
                <Textarea
                  id="edit-anti-vision"
                  value={antiVision}
                  onChange={(e) => setAntiVision(e.target.value)}
                  rows={4}
                />
              </Field>
            ) : (
              <p className="text-sm italic font-serif text-[var(--fg)] bg-[var(--bg-muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] leading-relaxed">
                "{data.twoFutures.antiVision}"
              </p>
            )}
          </div>

          {/* Key Allowing Questions Snapshot */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
            <span className="text-[11px] font-bold uppercase text-[var(--fg-muted)]">
              {t('Recorded Observations')}
            </span>
            <div className="text-xs text-[var(--fg-muted)] space-y-2">
              <div className="p-2.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
                <span className="font-semibold text-[var(--fg)] block">{t('Quiet Dissatisfaction:')}</span>
                {data.twoFutures.allowingAnswers?.q1 || t('Quietly accepting tiredness dictating outputs.')}
              </div>
              <div className="p-2.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
                <span className="font-semibold text-[var(--fg)] block">{t('What Avoidance Protects:')}</span>
                {data.twoFutures.allowingAnswers?.q7 || t('Protects against fear of judgment.')}
              </div>
            </div>
          </div>
        </Card>

        {/* The Life You're Building */}
        <Card
          padding="lg"
          className="border-2 border-[var(--color-sage)]/50 bg-[var(--bg-elevated)] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage)]">
              {t("The Life You're Building")}
            </span>
            <Badge variant="sage">{t('Built Future')}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-xl text-[var(--fg)]">
              {t('Vision Statement')}
            </h3>
            {isEditing ? (
              <Field id="edit-vision" label={t('I am building a life where...')}>
                <Textarea
                  id="edit-vision"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={4}
                />
              </Field>
            ) : (
              <p className="text-sm font-serif font-medium text-[var(--fg)] bg-[var(--bg-muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] leading-relaxed">
                "{data.twoFutures.vision}"
              </p>
            )}
          </div>

          {/* Key Building Questions Snapshot */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
            <span className="text-[11px] font-bold uppercase text-[var(--fg-muted)]">
              {t('Vision Pillars')}
            </span>
            <div className="text-xs text-[var(--fg-muted)] space-y-2">
              <div className="p-2.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
                <span className="font-semibold text-[var(--fg)] block">{t('Ordinary Day in 3 Years:')}</span>
                {data.twoFutures.buildingAnswers?.b1 || data.twoFutures.buildingAnswers?.q1 || t('Calm mornings, deep creative blocks, financial autonomy.')}
              </div>
              <div className="p-2.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
                <span className="font-semibold text-[var(--fg)] block">{t('What Money Lets You Say No To:')}</span>
                {data.twoFutures.buildingAnswers?.b3 || data.twoFutures.buildingAnswers?.q3 || t('Frantic schedules, hurried commutes, and misaligned work.')}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enriched anti-vision: the future you're running from */}
      <DefaultFutureStudio />

      <Disclaimer text={t('Reviewing your Two Futures weekly reinforces your identity shift and aligns daily mission choices.')} />
    </div>
  );
};
