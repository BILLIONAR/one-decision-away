import React, { useState } from 'react';
import { MarketItem, ArchiveReason, Purchase } from '../types/models';
import { useApp } from '../store/useApp';
import { Modal, Button, Badge } from './ui';
import { DreamArt } from './DreamArt';
import { Archive, CheckCircle2, RefreshCw, Sparkles, Compass, XCircle, FileText } from 'lucide-react';

interface ArchiveDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketItem | null;
  purchase?: Purchase | null;
}

export const ArchiveDreamModal: React.FC<ArchiveDreamModalProps> = ({
  isOpen,
  onClose,
  item,
  purchase,
}) => {
  const { archiveMarketItem } = useApp();
  const [reason, setReason] = useState<ArchiveReason>(purchase ? 'completed' : 'no_longer_relevant');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const isOwned = !!purchase;

  const reasonOptions: {
    value: ArchiveReason;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    recommended?: boolean;
  }[] = [
    {
      value: 'completed',
      label: 'Completed / Acquired',
      description: 'You have attained this milestone in real life or completed its full simulation cycle.',
      icon: CheckCircle2,
      recommended: isOwned,
    },
    {
      value: 'outgrown',
      label: 'Outgrown / Taste Evolved',
      description: 'Your priorities and personal vision have matured beyond this specific item.',
      icon: RefreshCw,
    },
    {
      value: 'replaced',
      label: 'Replaced with Higher Ambition',
      description: 'Upgraded to a higher tier supercar, residence, or more meaningful aspiration.',
      icon: Sparkles,
    },
    {
      value: 'no_longer_relevant',
      label: 'No Longer Relevant',
      description: 'Does not align with your current focus, but you want to retain historical record.',
      icon: XCircle,
      recommended: !isOwned,
    },
    {
      value: 'other',
      label: 'Other Reason',
      description: 'Custom personal reasoning recorded in your milestone archives.',
      icon: FileText,
    },
  ];

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await archiveMarketItem(item.id, reason, note);
      onClose();
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive Dream & Preserve History"
      size="lg"
    >
      <form onSubmit={handleConfirm} className="space-y-6">
        {/* Item Summary Box */}
        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] border border-[var(--border)]">
          <div className="w-20 h-20 rounded-[var(--radius-md)] overflow-hidden shrink-0 bg-black/80 relative border border-[var(--border)]">
            <DreamArt
              type={item.illustrationKey}
              imageUrl={item.customImageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="subtle">{item.category}</Badge>
              {isOwned && <Badge variant="success">Acquired 100%</Badge>}
            </div>
            <h4 className="font-display font-bold text-sm text-[var(--fg)] truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--fg-muted)]">
              <span>${item.realPriceUsd.toLocaleString()} USD</span>
              <span>·</span>
              <span>D$ {item.dreamDollarPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Informational callout */}
        <div className="p-3.5 rounded-[var(--radius-md)] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
          <Archive className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <strong>Active Vision Board cleanup:</strong> Archiving will immediately move this item out of your active Vision Board while preserving its date, valuation, and milestone note in your <strong>Archived History</strong>.
          </div>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            Select Archive Reason
          </label>

          <div className="grid grid-cols-1 gap-2">
            {reasonOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = reason === opt.value;

              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setReason(opt.value)}
                  className={`p-3 rounded-[var(--radius-md)] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-slate)] bg-[var(--bg-elevated)] ring-2 ring-[var(--color-slate)]/20 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)]/60 hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full mt-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-[var(--color-slate)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--fg-muted)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                        {opt.label}
                      </span>
                      {opt.recommended && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--color-sage)]/20 text-[var(--color-sage)] font-bold">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--fg-subtle)] mt-0.5 leading-normal">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note & Reflection field */}
        <div className="space-y-1.5">
          <label htmlFor="archive-note" className="block text-xs font-bold text-[var(--fg-muted)]">
            Personal Reflection Note (Optional)
          </label>
          <textarea
            id="archive-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g., Achieved key promotion; or upgrading vision to a GT3 RS instead..."
            className="w-full px-3 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--color-slate)]"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Archive}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Archiving...' : 'Confirm & Archive'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
