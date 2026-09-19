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
    type Candidate = { name: string; image: string; dd: number; why?: string };
    const candidates = ids
      .map((id): Candidate | null => {
        const m = all.find((i) => i.id === id);
        if (m && m.customImageUrl) return { name: m.name, image: m.customImageUrl, dd: m.dreamDollarPrice, why: m.whyWanted };
        const e = EXPLORE_DREAM_ITEMS.find((i) => i.id === id);
        return e && e.imageUrl ? { name: e.name, image: e.imageUrl, dd: e.dreamDollarPrice, why: e.whyWanted } : null;
      })
      .filter((x): x is Candidate => x !== null && x.image.length > 0);
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
      <img src={pick.image} alt={t(pick.name)} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover animate-in zoom-in-105 duration-[6000ms]" />
      <div className="absolute inset-0 bg-black/55" />
      <button type="button" onClick={() => close()} className="absolute top-5 right-5 h-11 px-4 rounded-full text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 cursor-pointer">
        {t('Skip')}
      </button>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-14 max-w-3xl">
        <div className="text-[15px] text-white/70">{name ? t('Good morning, {name}', { name }) : t('Good morning')}</div>
        <h1 className="text-[32px] sm:text-5xl font-semibold tracking-tight leading-tight mt-1">{t(pick.name)}</h1>
        {pick.why && <p className="text-[16px] sm:text-xl text-white/80 mt-2">{t(pick.why)}</p>}
        <p className="text-[15px] text-white/70 mt-4">
          {days === 0
            ? t('You can already afford this. Today is the day you go and get it.')
            : days === 1
            ? t('1 day away at your pace. One decision today brings it closer.')
            : t('{days} days away at your pace. One decision today brings it closer.', { days })}
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          <button type="button" onClick={() => close(true)} className="h-12 px-6 rounded-[var(--radius-sm)] bg-white text-black text-[15px] font-semibold cursor-pointer hover:opacity-90">
            {t("Set today's One Decision")}
          </button>
          <button type="button" onClick={() => close()} className="h-12 px-6 rounded-[var(--radius-sm)] border border-white/40 text-white text-[15px] font-semibold cursor-pointer hover:bg-white/10">
            {t('Enter the day')}
          </button>
        </div>
      </div>
    </div>
  );
};
