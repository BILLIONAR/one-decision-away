import React from 'react';
import { useApp } from '../store/useApp';
import { Card } from './ui';
import { Play, ArrowRight } from 'lucide-react';
import { GUIDED_MEDITATIONS, GuidedMeditation } from '../data/guidedMeditations';
import { useT, N_ } from '../i18n';

/** Picks three guided sessions that fit the time of day. */
function pickForNow(): { greeting: string; ids: string[] } {
  const h = new Date().getHours();
  if (h < 11) return { greeting: N_('Morning — set the tone'), ids: ['gm-motivation', 'gm-manifest', 'gm-confidence'] };
  if (h < 17) return { greeting: N_('Midday — sharpen up'), ids: ['gm-focus', 'gm-dopamine', 'gm-belief'] };
  if (h < 21) return { greeting: N_('Evening — come back to yourself'), ids: ['gm-relax', 'gm-gratitude', 'gm-two-futures'] };
  return { greeting: N_('Night — close the day well'), ids: ['gm-sleep', 'gm-relax', 'gm-gratitude'] };
}

export const MeditateNowWidget: React.FC = () => {
  const t = useT();
  const { startFocusSession, setActiveRoute } = useApp();
  const { greeting, ids } = pickForNow();
  const sessions = ids
    .map((id) => GUIDED_MEDITATIONS.find((m) => m.id === id))
    .filter((m): m is GuidedMeditation => !!m);

  const start = (m: GuidedMeditation) =>
    startFocusSession({
      missionTitle: `${m.emoji} ${t(m.title)}`,
      durationMinutes: m.durationMinutes,
      soundTrack: m.track,
      guidedMeditationId: m.id,
    });

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Meditate')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] truncate">{t(greeting)}</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveRoute('/app/missions')}
          className="h-9 px-2 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer shrink-0"
        >
          {t('All sessions')} <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {sessions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => start(m)}
            className="text-left p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-semibold text-[var(--fg)] truncate">{t(m.title)}</span>
              <span className="text-[12px] text-[var(--fg-subtle)] shrink-0">{t('{n} min', { n: m.durationMinutes })}</span>
            </div>
            <div className="text-[13px] text-[var(--fg-muted)] mt-0.5">{t(m.tagline)}</div>
            <div className="mt-3 text-[13px] font-medium text-[var(--accent)] flex items-center gap-1.5">
              <Play className="w-4 h-4" strokeWidth={1.8} /> {t('Start')}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
