import React, { useRef, useEffect, useState } from 'react';
import { Purchase } from '../types/models';
import { Modal, Button } from './ui';
import { Download, Share2, Check } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!purchase || !isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render 1200x1500 high-res card
    const width = 1200;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;

    // Background Warm Ivory
    ctx.fillStyle = '#F7F6F2';
    ctx.fillRect(0, 0, width, height);

    // Subtle Outer Frame
    ctx.strokeStyle = '#E2DFD6';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Inner Card Container
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(100, 100, width - 200, height - 200, 32);
    ctx.fill();
    ctx.strokeStyle = '#CFCBC0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Brand Header
    ctx.fillStyle = '#708879'; // Muted Sage
    ctx.font = '600 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ONE DECISION AWAY', width / 2, 210);

    ctx.fillStyle = '#8A969C';
    ctx.font = '400 24px Inter, sans-serif';
    ctx.fillText('by AurelyStudio · Life Simulation Receipt', width / 2, 255);

    // Horizontal Divider
    ctx.strokeStyle = '#E2DFD6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 300);
    ctx.lineTo(width - 160, 300);
    ctx.stroke();

    // Item Title
    ctx.fillStyle = '#263238'; // Slate
    ctx.font = 'bold 56px Fraunces, Georgia, serif';
    ctx.fillText(purchase.itemSnapshot.name, width / 2, 410);

    // Category Badge
    ctx.fillStyle = '#E4EBE5';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 140, 460, 280, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#708879';
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText(purchase.itemSnapshot.category.toUpperCase(), width / 2, 494);

    // Center Geometric Art Box
    ctx.fillStyle = '#F7F6F2';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 260, 560, 520, 320, 24);
    ctx.fill();
    ctx.strokeStyle = '#E2DFD6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Graphic icon representation inside canvas
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(width / 2, 700, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C98276';
    ctx.beginPath();
    ctx.arc(width / 2, 700, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#708879';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText('SYMBOLIC ASSET OWNERSHIP: 100%', width / 2, 820);

    // Stats Grid
    const drawStatBox = (x: number, y: number, w: number, h: number, label: string, val: string, sub?: string) => {
      ctx.fillStyle = '#F7F6F2';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.fill();
      ctx.strokeStyle = '#E2DFD6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8A969C';
      ctx.font = '600 20px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label.toUpperCase(), x + 24, y + 42);

      ctx.fillStyle = '#263238';
      ctx.font = 'bold 36px Fraunces, Georgia, serif';
      ctx.fillText(val, x + 24, y + 90);

      if (sub) {
        ctx.fillStyle = '#708879';
        ctx.font = '500 18px Inter, sans-serif';
        ctx.fillText(sub, x + 24, y + 122);
      }
    };

    drawStatBox(160, 930, 420, 140, 'Dream Price Paid', `D$ ${purchase.dreamDollarPaid.toLocaleString()}`, 'Verified Ledger Debit');
    drawStatBox(620, 930, 420, 140, 'Missions Completed', `${completedMissionsCount} Missions`, 'Fueling Real Momentum');

    // Date & Timestamp
    const dateStr = new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    ctx.fillStyle = '#5C6A72';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Issued: ${dateStr} · Simulation Transaction ID: #${purchase.id.slice(-8)}`, width / 2, 1140);

    // Mandatory Disclaimer Notice
    ctx.fillStyle = '#EFEDE7';
    ctx.beginPath();
    ctx.roundRect(160, 1190, width - 320, 90, 16);
    ctx.fill();

    ctx.fillStyle = '#5C6A72';
    ctx.font = '600 20px Inter, sans-serif';
    ctx.fillText('SIMULATION PURCHASE – NO CASH VALUE', width / 2, 1232);

    ctx.fillStyle = '#8A969C';
    ctx.font = '400 17px Inter, sans-serif';
    ctx.fillText('All assets in My Future Life represent symbolic milestones earned through real daily action.', width / 2, 1260);

    const generated = canvas.toDataURL('image/png');
    setDataUrl(generated);
  }, [purchase, isOpen, completedMissionsCount]);

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
          title: `One Decision Away — Dream Receipt: ${purchase.itemSnapshot.name}`,
          text: `I just unlocked "${purchase.itemSnapshot.name}" in my simulation through daily completed missions on One Decision Away.`,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Dream Receipt" subtitle="Verified purchase milestone in My Future Life." maxWidth="lg">
      <div className="space-y-5">
        {/* Hidden Canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Visual Preview */}
        {dataUrl && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)] bg-[var(--bg-muted)] flex justify-center p-2">
            <img src={dataUrl} alt="Dream Receipt" className="max-h-[460px] object-contain rounded-[var(--radius-md)]" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--fg-subtle)] text-center sm:text-left">
            Simulation milestone · No cash value · by AurelyStudio
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={Download} onClick={handleDownload} className="flex-1 sm:flex-initial">
              Save PNG
            </Button>
            <Button variant="accent" size="sm" icon={Share2} onClick={handleShare} className="flex-1 sm:flex-initial">
              Share Receipt
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
