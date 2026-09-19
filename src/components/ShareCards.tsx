import React, { useRef, useState } from 'react';
import { useApp } from '../store/useApp';
import { Modal, Button } from './ui';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { captureElementToPng, downloadPngDataUrl, copyPngToClipboard } from '../utils/exportVisualizationImage';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { computeLedgerBalance, calculateOneDecisionStreakData } from '../services/economy';
import { MarketItem } from '../types/models';
import { useT } from '../i18n';

/**
 * Shareable image cards (1080×1350, Instagram/Stories friendly):
 *  - Vision Board collage
 *  - One Decision streak card
 * Rendered off-screen, captured with html-to-image, downloaded or copied.
 * Drawn in the "Paper" palette: white, #111111, #6F6F6C, #1F5F3F, #C9C9C6.
 */

type Kind = 'vision' | 'streak';

const CARD = {
  bg: '#FFFFFF',
  fg: '#111111',
  muted: '#6F6F6C',
  accent: '#1F5F3F',
  line: '#C9C9C6',
  tile: '#F3F3F1',
  font: "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function useShare(kind: Kind) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();
  const t = useT();

  const capture = async () => {
    if (!ref.current) return null;
    setBusy(true);
    try {
      // wait a tick for images
      await new Promise((r) => setTimeout(r, 300));
      return await captureElementToPng(ref.current, { pixelRatio: 2, backgroundColor: CARD.bg });
    } catch {
      showToast(t('Could not render the image. Try again in a moment.'), 'error');
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
      showToast(t('Clipboard not available here — downloaded instead.'), 'info');
      downloadPngDataUrl(url, `one-decision-away-${kind}.png`);
    }
  };
  return { ref, open, setOpen, busy, copied, download, copy };
}

const CardFrame: React.FC<{ innerRef: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }> = ({ innerRef, children }) => (
  <div className="overflow-auto max-h-[70vh] rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-3">
    <div className="mx-auto" style={{ width: 540 }}>
      <div
        ref={innerRef}
        style={{
          width: 1080,
          height: 1350,
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          marginBottom: -675,
          background: CARD.bg,
          color: CARD.fg,
          fontFamily: CARD.font,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const Footer: React.FC = () => {
  const t = useT();
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        bottom: 64,
        paddingTop: 28,
        borderTop: `2px solid ${CARD.line}`,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 600, color: CARD.fg, letterSpacing: -0.3 }}>
        {t('One Decision Away')}
      </div>
      <div style={{ fontSize: 24, color: CARD.muted }}>{t('Build the life before you live it.')}</div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div>
    <div style={{ fontSize: 22, color: CARD.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1, color: accent ? CARD.accent : CARD.fg }}>
      {value}
    </div>
  </div>
);

export const ShareVisionBoardButton: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = useApp();
  const t = useT();
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
      <Button variant="secondary" size="sm" icon={Share2} className={className} onClick={() => s.setOpen(true)} disabled={items.length === 0}>
        {t('Share board')}
      </Button>
      <Modal isOpen={s.open} onClose={() => s.setOpen(false)} title={t('Share your board')} subtitle={t('1080×1350, ready for Stories.')} maxWidth="lg">
        <div className="space-y-4">
          <CardFrame innerRef={s.ref}>
            <div style={{ padding: 72 }}>
              <div style={{ fontSize: 24, color: CARD.muted }}>
                {t('Vision Board · {year}', { year: new Date().getFullYear() })}
              </div>
              <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, marginTop: 16 }}>
                {data.profile.displayName ? t("{name}'s future,", { name: data.profile.displayName }) : t('The future,')}
                <br />
                <span style={{ color: CARD.accent }}>{t('chosen on purpose.')}</span>
              </div>
              <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ height: 272, position: 'relative', borderRadius: 20, overflow: 'hidden', background: CARD.tile }}>
                    {it.image && <img src={it.image} crossOrigin="anonymous" referrerPolicy="no-referrer" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div
                      style={{
                        position: 'absolute',
                        left: 12,
                        right: 12,
                        bottom: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.92)',
                        color: CARD.fg,
                        fontSize: 20,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t(it.name)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 56, display: 'flex', gap: 64 }}>
                <Stat label={t('Dreams pinned')} value={String((data.inVisionItemIds || []).length)} />
                <Stat label={t('Funded')} value={`${pct}%`} accent />
                <Stat label={t('Dream Dollars')} value={`D$ ${balance.toLocaleString()}`} />
              </div>
            </div>
            <Footer />
          </CardFrame>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" icon={s.copied ? Check : Copy} onClick={s.copy} disabled={s.busy}>{s.copied ? t('Copied') : t('Copy image')}</Button>
            <Button variant="primary" icon={Download} onClick={s.download} disabled={s.busy}>{s.busy ? t('Rendering…') : t('Download PNG')}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const ShareStreakButton: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = useApp();
  const t = useT();
  const s = useShare('streak');
  if (!data) return null;
  const streak = calculateOneDecisionStreakData(data);
  const balance = computeLedgerBalance(data.transactions);
  const todayDecision = data.missions.find((m) => m.isOneDecision && m.status === 'completed' && (m.completedAt || '').slice(0, 10) === new Date().toISOString().slice(0, 10));

  return (
    <>
      <Button variant="ghost" size="sm" icon={Share2} className={className} onClick={() => s.setOpen(true)}>
        {t('Share streak')}
      </Button>
      <Modal isOpen={s.open} onClose={() => s.setOpen(false)} title={t('Share your streak')} subtitle={t('Quiet proof, not a brag.')} maxWidth="lg">
        <div className="space-y-4">
          <CardFrame innerRef={s.ref}>
            <div style={{ padding: 88, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 26, color: CARD.muted }}>{t('One decision a day')}</div>
              <div style={{ fontSize: 320, fontWeight: 600, letterSpacing: -14, lineHeight: 1, color: CARD.accent, marginTop: 8 }}>
                {streak.currentStreak}
              </div>
              <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.1, marginTop: 8 }}>
                {streak.currentStreak === 1 ? t('day of keeping') : t('days of keeping')}
                <br />
                <span style={{ color: CARD.muted, fontWeight: 500 }}>{t('my word to myself.')}</span>
              </div>
              {todayDecision && (
                <div
                  style={{
                    marginTop: 48,
                    fontSize: 28,
                    lineHeight: 1.35,
                    padding: '24px 28px',
                    borderRadius: 20,
                    background: CARD.tile,
                    color: CARD.fg,
                  }}
                >
                  <span style={{ color: CARD.muted }}>{t('Today')} · </span>
                  {t(todayDecision.title)}
                </div>
              )}
              <div style={{ marginTop: 56, display: 'flex', gap: 64 }}>
                <Stat label={t('Best streak')} value={String(streak.longestStreak)} />
                <Stat label={t('Decisions')} value={String(streak.totalCompleted)} />
                <Stat label={t('Dream Dollars')} value={`D$ ${balance.toLocaleString()}`} />
              </div>
            </div>
            <Footer />
          </CardFrame>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" icon={s.copied ? Check : Copy} onClick={s.copy} disabled={s.busy}>{s.copied ? t('Copied') : t('Copy image')}</Button>
            <Button variant="primary" icon={Download} onClick={s.download} disabled={s.busy}>{s.busy ? t('Rendering…') : t('Download PNG')}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
