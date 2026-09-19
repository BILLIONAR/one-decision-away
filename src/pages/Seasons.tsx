import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { PageHeader, Button, Card, Badge, Progress, Disclaimer } from '../components/ui';
import { Compass, CheckCircle, Flame, Award, Calendar, Sparkles } from 'lucide-react';
import { SEED_SEASONS } from '../data/seed';
import { Season } from '../types/models';
import { useT } from '../i18n';

export const Seasons: React.FC = () => {
  const { data, joinSeason, completeMission } = useApp();
  const t = useT();

  const [activeSeasonTab, setActiveSeasonTab] = useState<string>(
    data?.activeSeason?.id || SEED_SEASONS[0].id
  );

  if (!data) return null;

  const currentSeason =
    SEED_SEASONS.find((s) => s.id === activeSeasonTab) || SEED_SEASONS[0];
  const isJoined = data.activeSeason?.id === currentSeason.id;

  // Calculate progress for current season
  const completedMissionsCount = data.completions.length;
  const seasonProgress = isJoined
    ? Math.min(100, Math.round((completedMissionsCount / currentSeason.missions.length) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('30-Day Themed Seasons')}
        subtitle={t('Intensive 30-day focus cycles to create decisive breakthroughs.')}
      />

      {/* Seasons Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SEED_SEASONS.map((season) => {
          const isSelected = activeSeasonTab === season.id;
          const isCurrentlyActive = data.activeSeason?.id === season.id;

          return (
            <Card
              key={season.id}
              padding="md"
              className={`cursor-pointer transition-all border ${
                isSelected
                  ? 'border-[var(--color-slate)] bg-[var(--bg-elevated)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActiveSeasonTab(season.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[var(--color-sage)]">
                    {t('{n} Days Focus', { n: season.durationDays || 30 })}
                  </span>
                  {isCurrentlyActive && <Badge variant="coral">{t('Active Focus')}</Badge>}
                </div>

                <h3 className="font-display font-bold text-base text-[var(--fg)]">
                  {season.title}
                </h3>

                <p className="text-xs text-[var(--fg-muted)] line-clamp-2">
                  {season.theme || season.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Season Detail Card */}
      <Card padding="lg" className="space-y-6 bg-[var(--bg-elevated)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="sage">{t('{n} Days Sprint', { n: currentSeason.durationDays || 30 })}</Badge>
              <Badge variant="slate">{currentSeason.rewardBadgeTitle || currentSeason.badgeName}</Badge>
            </div>
            <h2 className="text-2xl font-bold font-display text-[var(--fg)]">
              {currentSeason.title}
            </h2>
            <p className="text-xs text-[var(--fg-muted)]">{currentSeason.theme || currentSeason.description}</p>
          </div>

          {!isJoined ? (
            <Button
              variant="accent"
              icon={Sparkles}
              onClick={() => joinSeason(currentSeason)}
            >
              {t('Enroll in This Season')}
            </Button>
          ) : (
            <div className="text-right">
              <span className="text-xs font-bold text-[var(--color-sage)] block">
                {t('Enrolled · 30 Days Active')}
              </span>
              <span className="text-[11px] text-[var(--fg-subtle)]">
                {t('{pct}% Completed', { pct: seasonProgress })}
              </span>
            </div>
          )}
        </div>

        {/* Season Progress */}
        {isJoined && (
          <div className="space-y-2 p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[var(--fg)]">{t('Seasonal Mission Progress')}</span>
              <span className="font-mono text-[var(--color-sage)] font-bold">
                {seasonProgress}%
              </span>
            </div>
            <Progress value={seasonProgress} variant="sage" />
          </div>
        )}

        {/* Missions Checklist for this Season */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            {t('Core Seasonal Quests ({n})', { n: currentSeason.missions.length })}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentSeason.missions.map((mission, idx) => (
              <div
                key={idx}
                className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[var(--fg)]">{mission.title}</div>
                  <div className="text-[11px] text-[var(--fg-muted)]">
                    {mission.area} · {mission.difficulty}
                  </div>
                </div>

                <span className="text-xs font-bold text-[var(--color-sage)] shrink-0">
                  + D$ {mission.rewardDreamDollar || 250}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cosmetic Reward Preview */}
        <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--color-coral)] flex items-center justify-center font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-coral)]">
              {t('Cosmetic Milestone Reward')}
            </span>
            <div className="font-bold text-sm text-[var(--fg)]">
              {t('"{name}" Profile Emblem', { name: currentSeason.rewardBadgeTitle || currentSeason.badgeName || '' })}
            </div>
            <p className="text-[11px] text-[var(--fg-muted)]">
              {t('Earned upon completing the 30-day cycle. Purely symbolic recognition with no pay-to-win advantages.')}
            </p>
          </div>
        </div>
      </Card>

      <Disclaimer text={t('Seasons are designed to provide sprint focus without artificial urgency or streak penalties.')} />
    </div>
  );
};
