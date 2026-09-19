import React, { useEffect, useState } from 'react';
import { MarketItem } from '../types/models';
import { DreamArt } from './DreamArt';
import { triggerGoldConfetti } from '../utils/confetti';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { useT } from '../i18n';

interface Props {
  item: MarketItem | null;
  dreamDollarPaid: number;
  onDone: () => void;
}

/**
 * The purchase ritual: the dream fades from black-and-white into full color,
 * a chord plays, confetti falls. Small ceremony, big memory.
 */
export const PurchaseReveal: React.FC<Props> = ({ item, dreamDollarPaid, onDone }) => {
  const t = useT();
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!item) return;
    setStage(0);
    const t1 = window.setTimeout(() => setStage(1), 150);
    const t2 = window.setTimeout(() => {
      setStage(2);
      try {
        soundSynthesizer.playSuccessChord();
        triggerGoldConfetti();
      } catch {
        /* ignore */
      }
    }, 2100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0f0e0d] text-[#F5F2ED] flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={() => stage === 2 && onDone()}>
      <div className="relative w-[min(92vw,720px)] aspect-[4/3] rounded-[28px] overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 transition-all ease-out"
          style={{
            filter: stage >= 1 ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.55)',
            transform: stage >= 1 ? 'scale(1)' : 'scale(1.08)',
            transitionDuration: '2000ms',
          }}
        >
          <DreamArt type={item.illustrationKey} imageUrl={item.customImageUrl} alt={item.name} className="w-full h-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#9A8F86]">{stage < 2 ? t('Becoming yours…') : t('Yours.')}</div>
          <div className="font-display text-2xl sm:text-4xl font-bold leading-tight">{item.name}</div>
        </div>
      </div>
      <div className={`mt-8 text-center transition-opacity duration-700 ${stage === 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="font-mono text-sm text-[#9A8F86]">{t('− D$ {amount} · paid with earned decisions', { amount: dreamDollarPaid.toLocaleString() })}</div>
        <p className="font-display italic text-lg mt-2 max-w-md text-[#F5F2ED]/85">
          {item.whyWanted || t('You did not wish for this. You earned it, one decision at a time.')}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#F5F2ED] text-[#1C1B19] text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90"
        >
          {t('See the receipt')}
        </button>
      </div>
    </div>
  );
};
