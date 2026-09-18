import React from 'react';
import { useApp } from '../store/useApp';
import { Card, Button } from './ui';
import { Headphones, Play, ArrowRight } from 'lucide-react';
import { GUIDED_MEDITATIONS, GuidedMeditation } from '../data/guidedMeditations';

/** Picks three guided sessions that fit the time of day. */
function pickForNow(): { greeting: string; ids: string[] } {
  const h = new Date().getHours();
  if (h < 11) return { greeting: 'Morning — set the tone', ids: ['gm-motivation', 'gm-manifest', 'gm-confidence'] };
  if (h < 17) return { greeting: 'Midday — sharpen up', ids: ['gm-focus', 'gm-dopamine', 'gm-belief'] };
  if (h < 21) return { greeting: 'Evening — come back to yourself', ids: ['gm-relax', 'gm-gratitude', 'gm-two-futures'] };
  return { greeting: 'Night — close the day well', ids: ['gm-sleep', 'gm-relax', 'gm-gratitude'] };
}

export const MeditateNowWidget: React.FC = () => {
  const { startFocusSession, setActiveRoute } = useApp();
  const { greeting, ids } = pickForNow();
  const sessions = ids
    .map((id) => GUIDED_MEDITATIONS.find((m) => m.id === id))
    .filter((m): m is GuidedMeditation => !!m);

  const start = (m: GuidedMeditation) =>
    startFocusSession({
      missionTitle: `${m.emoji} ${m.title}`,
      durationMinutes: m.durationMinutes,
      soundTrack: m.track,
      guidedMeditationId: m.id,
    });

  return (
    <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-sage)]/15 text-[var(--color-sage)] flex items-center justify-center">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">Meditate Now</h3>
            <p className="text-[11px] text-[var(--fg-muted)]">{greeting} · voice-guided</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveRoute('/app/missions')}
          className="text-[11px] font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
        >
          All sessions <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {sessions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => start(m)}
            className="text-left p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--color-sage)] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg leading-none">{m.emoji}</span>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">{m.durationMinutes} min</span>
            </div>
            <div className="text-xs font-bold text-[var(--fg)] mt-1.5">{m.title}</div>
            <div className="text-[11px] italic text-[var(--fg-subtle)]">{m.tagline}</div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-sage)] flex items-center gap-1 opacity-70 group-hover:opacity-100">
              <Play className="w-3 h-3 fill-current" /> Start
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
