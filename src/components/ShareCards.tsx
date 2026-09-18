import React, { useRef, useState } from 'react';
import { useApp } from '../store/useApp';
import { Modal, Button } from './ui';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { captureElementToPng, downloadPngDataUrl, copyPngToClipboard } from '../utils/exportVisualizationImage';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { computeLedgerBalance, calculateOneDecisionStreakData } from '../services/economy';
import { MarketItem } from '../types/models';

/**
 * Shareable image cards (1080×1350, Instagram/Stories friendly):
 *  - Vision Board collage
 *  - One Decision streak card
 * Rendered off-screen, captured with html-to-image, downloaded or copied.
 */

type Kind = 'vision' | 'streak';

function useShare(kind: Kind) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();

  const capture = async () => {
    if (!ref.current) return null;
    setBusy(true);
    try {
      // wait a tick for images
      await new Promise((r) => setTimeout(r, 300));
      return await captureElementToPng(ref.current, { pixelRatio: 2, backgroundColor: '#1C1B19' });
    } catch {
      showToast('Could not render the image. Try again in a moment.', 'error');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    const url = await capture();
    if (url) downloadPngDataUrl(url, `one-decision-away-${kind}-${new Date().toISOString().slice(0, 10)}.png`);
  };
  const copy = async () => {
    const url = await capture();
    if (url && (await copyPngToClipboard(url))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (url) {
      showToast('Clipboard not available here — downloaded instead.', 'info');
      downloadPngDataUrl(url, `one-decision-away-${kind}.png`);
    }
  };
  return { ref, open, setOpen, busy, copied, download, copy };
}

const CardFrame: React.FC<{ innerRef: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }> = ({ innerRef, children }) => (
  <div className="overflow-auto max-h-[70vh] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] p-3">
    <div className="mx-auto" style={{ width: 540 }}>
      <div
        ref={innerRef}
        style={{ width: 1080, height: 1350, transform: 'scale(0.5)', transformOrigin: 'top left', marginBottom: -675 }}
        className="bg-[#1C1B19] text-[#F5F2ED] font-display relative overflow-hidden"
      >
        {children}
      </div>
    </div>
  </div>
);

const Footer: React.FC = () => (
  <div style={{ position: 'absolute', left: 64, right: 64, bottom: 56 }} className="flex items-end justify-between">
    <div>
      <div style={{ fontSize: 22, letterSpacing: 6 }} className="uppercase text-[#9A8F86]">
        One Decision Away
      </div>
      <div style={{ fontSize: 26 }} className="italic text-[#F5F2ED]/80">
        Build the life before you live it.
      </div>
    </div>
    <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#7A927A]">
      by AurelyStudio
    </div>
  </div>
);

export const ShareVisionBoardButton: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = useApp();
  const s = useShare('vision');
  if (!data) return null;
  const all: MarketItem[] = [...SEED_MARKET_ITEMS, ...(data.customMarketItems || [])];
  const items = (data.inVisionItemIds || [])
    .map((id) => {
      const m = all.find((i) => i.id === id);
      if (m) return { name: m.name, image: m.customImageUrl, dd: m.dreamDollarPrice };
      const e = EXPLORE_DREAM_ITEMS.find((i) => i.id === id);
      return e ? { name: e.name, image: e.imageUrl, dd: e.dreamDollarPrice } : null;
    })
    .filter((x): x is { name: string; image?: string; dd: number } => !!x)
    .slice(0, 6);
  const balance = computeLedgerBalance(data.transactions);
  const total = items.reduce((a, i) => a + i.dd, 0);
  const pct = total > 0 ? Math.min(100, Math.round((balance / total) * 100)) : 0;

  return (
    <>
      <Button variant="outline" size="sm" icon={Share2} className={className} onClick={() => s.setOpen(true)} disabled={items.length === 0}>
        Share board
      </Button>
      <Modal isOpen={s.open} onClose={() => s.setOpen(false)} title="Share your Vision Board" subtitle="A 1080×1350 image — perfect for Stories or a lock screen." maxWidth="lg">
        <div className="space-y-3">
          <CardFrame innerRef={s.ref}>
            <div style={{ padding: 64 }}>
              <div style={{ fontSize: 24, letterSpacing: 8 }} className="uppercase text-[#9A8F86]">
                My Vision Board · {new Date().getFullYear()}
              </div>
              <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 12 }} className="font-bold">
                {data.profile.displayName ? `${data.profile.displayName}'s` : 'The'} future,
                <br />
                <span className="italic text-[#7A927A]">chosen on purpose.</span>
              </div>
              <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ height: i < 3 ? 300 : 260, position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#2A2926' }}>
                    {it.image && <img src={it.image} crossOrigin="anonymous" referrerPolicy="no-referrer" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,.75))', fontSize: 22 }} className="font-sans font-semibold">
                      {it.name}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, display: 'flex', gap: 48 }} className="font-sans">
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Dreams pinned</div>
                  <div style={{ fontSize: 56 }} className="font-display font-bold">{(data.inVisionItemIds || []).length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Funded</div>
                  <div style={{ fontSize: 56 }} className="font-display font-bold text-[#7A927A]">{pct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Dream Dollars</div>
                  <div style={{ fontSize: 56 }} className="font-display font-bold">D$ {balance.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <Footer />
          </CardFrame>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" icon={s.copied ? Check : Copy} onClick={s.copy} disabled={s.busy}>{s.copied ? 'Copied' : 'Copy image'}</Button>
            <Button variant="primary" size="sm" icon={Download} onClick={s.download} disabled={s.busy}>{s.busy ? 'Rendering…' : 'Download PNG'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const ShareStreakButton: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = useApp();
  const s = useShare('streak');
  if (!data) return null;
  const streak = calculateOneDecisionStreakData(data);
  const balance = computeLedgerBalance(data.transactions);
  const todayDecision = data.missions.find((m) => m.isOneDecision && m.status === 'completed' && (m.completedAt || '').slice(0, 10) === new Date().toISOString().slice(0, 10));

  return (
    <>
      <Button variant="ghost" size="sm" icon={Share2} className={className} onClick={() => s.setOpen(true)}>
        Share streak
      </Button>
      <Modal isOpen={s.open} onClose={() => s.setOpen(false)} title="Share your One Decision streak" subtitle="Quiet proof, not a brag." maxWidth="lg">
        <div className="space-y-3">
          <CardFrame innerRef={s.ref}>
            <div style={{ padding: 80, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, letterSpacing: 8 }} className="uppercase text-[#9A8F86]">One Decision a day</div>
              <div style={{ fontSize: 300, lineHeight: 1 }} className="font-bold text-[#7A927A]">{streak.currentStreak}</div>
              <div style={{ fontSize: 60, lineHeight: 1.1 }} className="font-bold">
                day{streak.currentStreak === 1 ? '' : 's'} of keeping
                <br />
                <span className="italic">my word to myself.</span>
              </div>
              {todayDecision && (
                <div style={{ marginTop: 40, fontSize: 30, padding: '20px 28px', borderLeft: '6px solid #7A927A' }} className="font-sans text-[#F5F2ED]/85">
                  Today: {todayDecision.title}
                </div>
              )}
              <div style={{ marginTop: 48, display: 'flex', gap: 56 }} className="font-sans">
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Best streak</div>
                  <div style={{ fontSize: 48 }} className="font-display font-bold">{streak.longestStreak}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Decisions</div>
                  <div style={{ fontSize: 48 }} className="font-display font-bold">{streak.totalCompleted}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, letterSpacing: 4 }} className="uppercase text-[#9A8F86]">Dream Dollars</div>
                  <div style={{ fontSize: 48 }} className="font-display font-bold">D$ {balance.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <Footer />
          </CardFrame>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" icon={s.copied ? Check : Copy} onClick={s.copy} disabled={s.busy}>{s.copied ? 'Copied' : 'Copy image'}</Button>
            <Button variant="primary" size="sm" icon={Download} onClick={s.download} disabled={s.busy}>{s.busy ? 'Rendering…' : 'Download PNG'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
