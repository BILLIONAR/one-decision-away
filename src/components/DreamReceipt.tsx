import React, { useRef, useEffect, useState } from 'react';
import { Purchase } from '../types/models';
import { Modal, Button } from './ui';
import { Download, Share2 } from 'lucide-react';
import { useT, getSpeechLang } from '../i18n';

interface DreamReceiptModalProps {
  purchase: Purchase | null;
  completedMissionsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const DreamReceiptModal: React.FC<DreamReceiptModalProps> = ({
  purchase,
  completedMissionsCount,
  isOpen,
  onClose,
}) => {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!purchase || !isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render 1200x1500 card in the "Paper" palette
    const width = 1200;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;

    const BG = '#FFFFFF';
    const FG = '#111111';
    const MUTED = '#6F6F6C';
    const ACCENT = '#1F5F3F';
    const LINE = '#C9C9C6';
    const TILE = '#F3F3F1';
    const FONT = "'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif";
    const PAD = 96;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);

    const hairline = (y: number) => {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(width - PAD, y);
      ctx.stroke();
    };

    // Wrap long titles onto up to two lines
    const wrapLines = (text: string, maxWidth: number, maxLines: number) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
        if (lines.length === maxLines) break;
      }
      if (lines.length < maxLines && current) lines.push(current);
      if (lines.length === maxLines && current && lines[maxLines - 1] !== current) {
        let last = lines[maxLines - 1];
        while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1);
        lines[maxLines - 1] = `${last}…`;
      }
      return lines;
    };

    // Header
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = FG;
    ctx.font = `600 30px ${FONT}`;
    ctx.fillText(t('One Decision Away'), PAD, PAD + 30);

    ctx.fillStyle = MUTED;
    ctx.font = `400 26px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(t('Receipt'), width - PAD, PAD + 30);
    ctx.textAlign = 'left';

    hairline(PAD + 70);

    // Category
    ctx.fillStyle = MUTED;
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(t(purchase.itemSnapshot.category), PAD, 300);

    // Title
    ctx.fillStyle = FG;
    ctx.font = `600 84px ${FONT}`;
    const titleLines = wrapLines(t(purchase.itemSnapshot.name), width - PAD * 2, 2);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, PAD, 400 + i * 96);
    });

    // Ownership mark
    const markY = 400 + titleLines.length * 96 + 20;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(PAD + 16, markY - 10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BG;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(PAD + 8, markY - 10);
    ctx.lineTo(PAD + 14, markY - 4);
    ctx.lineTo(PAD + 25, markY - 17);
    ctx.stroke();
    ctx.fillStyle = ACCENT;
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText(t('Yours, 100%'), PAD + 48, markY);

    // Stats
    const statsTop = 760;
    const colW = (width - PAD * 2 - 24) / 2;
    const drawStat = (x: number, y: number, label: string, val: string, sub?: string) => {
      ctx.fillStyle = TILE;
      ctx.beginPath();
      ctx.roundRect(x, y, colW, 200, 24);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = MUTED;
      ctx.font = `400 26px ${FONT}`;
      ctx.fillText(label, x + 32, y + 56);

      ctx.fillStyle = FG;
      ctx.font = `600 56px ${FONT}`;
      ctx.fillText(val, x + 32, y + 126);

      if (sub) {
        ctx.fillStyle = MUTED;
        ctx.font = `400 22px ${FONT}`;
        ctx.fillText(sub, x + 32, y + 168);
      }
    };

    drawStat(PAD, statsTop, t('Paid'), `D$ ${purchase.dreamDollarPaid.toLocaleString()}`, t('From your ledger'));
    drawStat(
      PAD + colW + 24,
      statsTop,
      t('Missions completed'),
      completedMissionsCount.toLocaleString(),
      t('Real actions, real progress')
    );

    // Date & ID
    const dateStr = new Date(purchase.purchasedAt).toLocaleDateString(getSpeechLang(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    hairline(1060);

    ctx.fillStyle = MUTED;
    ctx.font = `400 26px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(dateStr, PAD, 1120);
    ctx.textAlign = 'right';
    ctx.fillText(`#${purchase.id.slice(-8).toUpperCase()}`, width - PAD, 1120);
    ctx.textAlign = 'left';

    // Footer note
    hairline(height - PAD - 120);
    ctx.fillStyle = FG;
    ctx.font = `500 26px ${FONT}`;
    ctx.fillText(t('Simulation purchase. No cash value.'), PAD, height - PAD - 62);
    ctx.fillStyle = MUTED;
    ctx.font = `400 22px ${FONT}`;
    ctx.fillText(t('Every dream here is a milestone earned through daily action.'), PAD, height - PAD - 24);

    const generated = canvas.toDataURL('image/png');
    setDataUrl(generated);
  }, [purchase, isOpen, completedMissionsCount, t]);

  if (!purchase) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `dream-receipt-${purchase.itemSnapshot.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!dataUrl) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'dream-receipt.png', { type: 'image/png' });
        await navigator.share({
          title: t('One Decision Away — {name}', { name: t(purchase.itemSnapshot.name) }),
          text: t('I unlocked "{name}" through daily decisions on One Decision Away.', { name: t(purchase.itemSnapshot.name) }),
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      handleDownload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Receipt')} subtitle={t('Simulation purchase. No cash value.')} maxWidth="md">
      <div className="space-y-4">
        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {dataUrl && (
          <div className="rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-muted)] flex justify-center p-3">
            <img src={dataUrl} alt={t('Receipt')} className="max-h-[460px] object-contain rounded-[var(--radius-sm)]" />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" icon={Download} onClick={handleDownload}>
            {t('Save PNG')}
          </Button>
          <Button variant="primary" icon={Share2} onClick={handleShare}>
            {t('Share')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
