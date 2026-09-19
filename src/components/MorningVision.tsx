import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { computeLedgerBalance, estimateDailyEarningPace, daysToAfford } from '../services/economy';
import { useT } from '../i18n';

const KEY = 'oda_morning_vision_seen';

/**
 * First open of the day: one full-screen photo from the vision board, one line, one button.
 * The reason to open the app in the morning.
 */
export const MorningVision: React.FC = () => {
  const t = useT();
  const { data, setActiveRoute } = useApp();
  const todayKey = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);

  const pick = useMemo(() => {
    if (!data) return null;
    const ids = data.inVisionItemIds || [];
    if (ids.length === 0) return null;
    const all = [...SEED_MARKET_ITEMS, ...(data.customMarketItems || [])];
    const candidates = ids
      .map((id) => {
        const m = all.find((i) => i.id === id);
        if (m && m.customImageUrl) return { name: m.name, image: m.customImageUrl, dd: m.dreamDollarPrice, why: m.whyWanted };
        const e = EXPLORE_DREAM_ITEMS.find((i) => i.id === id);
        return e ? { name: e.name, image: e.imageUrl, dd: e.dreamDollarPrice, why: e.whyWanted } : null;
      })
      .filter((x): x is { name: string; image: string; dd: number; why?: string } => !!x && !!x.image);
    if (candidates.length === 0) return null;
    // rotate deterministically by day
    const dayIndex = Math.floor(Date.now() / 86400000);
    return candidates[dayIndex % candidates.length];
  }, [data]);

  useEffect(() => {
    if (!pick) return;
    const hour = new Date().getHours();
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    if (seen !== todayKey && hour >= 5 && hour < 12) setOpen(true);
  }, [pick, todayKey]);

  if (!data || !pick || !open) return null;

  const balance = computeLedgerBalance(data.transactions);
  const pace = estimateDailyEarningPace(data.transactions);
  const days = daysToAfford(pick.dd, balance, pace.perDay);
  const name = data.profile.displayName?.split(' ')[0];

  const close = (goSet?: boolean) => {
    try {
      localStorage.setItem(KEY, todayKey);
    } catch {
      /* ignore */
    }
    setOpen(false);
    if (goSet) {
      setActiveRoute('/app');
      setTimeout(() => document.getElementById('set-one-decision')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] bg-black text-white animate-in fade-in duration-500">
      <img src={pick.image} alt={pick.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover animate-in zoom-in-105 duration-[6000ms]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
      <button type="button" onClick={() => close()} className="absolute top-5 right-5 text-[11px] uppercase tracking-widest text-white/70 hover:text-white cursor-pointer">
        {t('Skip')}
      </button>
      <div className="absolute inset-x-0 bottom-0 p-8 sm:p-14 max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.35em] text-white/60">{name ? t('Good morning, {name}', { name }) : t('Good morning')}</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mt-2">{pick.name}</h1>
        {pick.why && <p className="font-display italic text-base sm:text-xl text-white/80 mt-2">{pick.why}</p>}
        <p className="text-sm text-white/70 mt-4">
          {days === 0
            ? t('You can already afford this. Today is the day you go and get it.')
            : days === 1
            ? t('1 day away at your pace. One decision today brings it closer.')
            : t('{days} days away at your pace. One decision today brings it closer.', { days })}
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          <button type="button" onClick={() => close(true)} className="px-6 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90">
            {t("Set today's One Decision")}
          </button>
          <button type="button" onClick={() => close()} className="px-6 py-3 rounded-full border border-white/40 text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10">
            {t('Enter the day')}
          </button>
        </div>
      </div>
    </div>
  );
};
