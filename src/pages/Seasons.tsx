import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Check } from 'lucide-react';
import { SEED_SEASONS } from '../data/seed';
import { useT } from '../i18n';

export const Seasons: React.FC = () => {
  const { data, joinSeason } = useApp();
  const t = useT();

  const [activeSeasonTab, setActiveSeasonTab] = useState<string>(
    data?.activeSeason?.id || SEED_SEASONS[0].id
  );

  if (!data) return null;

  const currentSeason =
    SEED_SEASONS.find((s) => s.id === activeSeasonTab) || SEED_SEASONS[0];
  const isJoined = data.activeSeason?.id === currentSeason.id;

  const completedMissionsCount = data.completions.length;
  const seasonProgress = isJoined
    ? Math.min(100, Math.round((completedMissionsCount / currentSeason.missions.length) * 100))
    : 0;

  const badgeName = currentSeason.rewardBadgeTitle || currentSeason.badgeName || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Seasons')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Thirty days on one theme.')}</p>
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
        {SEED_SEASONS.map((season) => {
          const isSelected = activeSeasonTab === season.id;
          const isCurrentlyActive = data.activeSeason?.id === season.id;

          return (
            <button
              key={season.id}
              type="button"
              onClick={() => setActiveSeasonTab(season.id)}
              className="w-full text-left px-4 min-h-[56px] py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className={`text-[15px] truncate ${isSelected ? 'font-semibold text-[var(--fg)]' : 'font-medium text-[var(--fg)]'}`}>
                  {t(season.title)}
                </div>
                <div className="text-xs text-[var(--fg-muted)] truncate">
                  {t('{n} days', { n: season.durationDays || 30 })}
                  {isCurrentlyActive ? ` · ${t('Joined')}` : ''}
                </div>
              </div>
              {isSelected && <Check className="w-[18px] h-[18px] text-[var(--accent)] shrink-0" strokeWidth={1.8} />}
            </button>
          );
        })}
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--fg)]">{t(currentSeason.title)}</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t(currentSeason.theme || currentSeason.description)}</p>
        </div>

        {!isJoined ? (
          <button
            type="button"
            onClick={() => joinSeason(currentSeason)}
            className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px]"
          >
            {t('Join')}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--fg)]">{t('Progress')}</span>
              <span className="text-[var(--accent)] font-medium">{seasonProgress}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${seasonProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">
          {t('Missions')} <span className="text-[var(--fg-muted)] font-normal">({currentSeason.missions.length})</span>
        </h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
          {currentSeason.missions.map((mission, idx) => (
            <div key={idx} className="px-4 min-h-[56px] py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-[var(--fg)] truncate">{t(mission.title)}</div>
                <div className="text-xs text-[var(--fg-muted)]">
                  {t(mission.area)} · {t(mission.difficulty)}
                </div>
              </div>
              <span className="text-sm text-[var(--accent)] shrink-0">D$ {mission.rewardDreamDollar || 250}</span>
            </div>
          ))}
        </div>
      </div>

      {badgeName && (
        <p className="text-sm text-[var(--fg-muted)]">
          {t('Finish the season to earn the {name} badge on your profile.', { name: t(badgeName) })}
        </p>
      )}

      <p className="text-xs text-[var(--fg-subtle)]">{t('No streak penalties. No artificial urgency.')}</p>
    </div>
  );
};
