import React, { useState } from 'react';
import { MarketItem, ArchiveReason, Purchase } from '../types/models';
import { useApp } from '../store/useApp';
import { Modal, Button } from './ui';
import { DreamArt } from './DreamArt';
import { useT } from '../i18n';
import { Check } from 'lucide-react';

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
  const t = useT();
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
    recommended?: boolean;
  }[] = [
    {
      value: 'completed',
      label: t('Completed'),
      description: t('You reached this in real life or finished its cycle.'),
      recommended: isOwned,
    },
    {
      value: 'outgrown',
      label: t('Outgrown'),
      description: t('Your priorities moved past this one.'),
    },
    {
      value: 'replaced',
      label: t('Replaced'),
      description: t('Swapped for a bigger or more meaningful goal.'),
    },
    {
      value: 'no_longer_relevant',
      label: t('No longer relevant'),
      description: t('Not part of your focus now, but worth keeping on record.'),
      recommended: !isOwned,
    },
    {
      value: 'other',
      label: t('Other'),
      description: t('Add your own reason in the note below.'),
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
      title={t('Archive dream')}
      subtitle={t('It leaves your Vision Board. Its date, value and note stay in your history.')}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-6">
        {/* Item summary */}
        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
          <div className="w-14 h-14 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--bg-inset)]">
            <DreamArt
              type={item.illustrationKey}
              imageUrl={item.customImageUrl}
              alt={t(item.name)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-[var(--fg)] truncate">{t(item.name)}</div>
            <div className="text-[13px] text-[var(--fg-muted)] truncate">
              {t(item.category)} · D$ {item.dreamDollarPrice.toLocaleString()}
              {isOwned ? ` · ${t('Owned')}` : ''}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Reason')}</span>
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] overflow-hidden">
            {reasonOptions.map((opt, idx) => {
              const isSelected = reason === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setReason(opt.value)}
                  className={`w-full min-h-[56px] px-4 py-3 flex items-center gap-3 text-left cursor-pointer transition-colors hover:bg-[var(--bg-inset)] ${
                    idx > 0 ? 'border-t border-[var(--border)]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[var(--fg)] leading-tight">
                      {opt.label}
                      {opt.recommended && (
                        <span className="ml-2 text-[13px] font-normal text-[var(--fg-subtle)]">
                          {t('Suggested')}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-[var(--fg-muted)] mt-0.5 leading-snug">{opt.description}</div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                      isSelected ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border-strong)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label htmlFor="archive-note" className="block text-[13px] font-medium text-[var(--fg-muted)]">
            {t('Note (optional)')}
          </label>
          <textarea
            id="archive-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={t('What changed?')}
            className="w-full p-3.5 text-[15px] bg-[var(--bg-muted)] border border-transparent rounded-[var(--radius-sm)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--border-strong)] resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('Cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? t('Archiving…') : t('Archive')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
