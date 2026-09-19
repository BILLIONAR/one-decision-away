import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { MarketItem, ArchiveReason } from '../types/models';
import { Button, Empty } from './ui';
import { DreamArt } from './DreamArt';
import { useT } from '../i18n';
import { Archive, RotateCcw, Search, Trash2, Star } from 'lucide-react';

interface ArchivedMarketHistoryProps {
  onExploreMore?: () => void;
}

export const ArchivedMarketHistory: React.FC<ArchivedMarketHistoryProps> = ({ onExploreMore }) => {
  const t = useT();
  const { data, restoreMarketItem, deleteArchivedRecord, setActiveRoute } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<'All' | ArchiveReason>('All');

  if (!data) return null;

  const allItems: MarketItem[] = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  const archivedIds = new Set<string>(data.archivedMarketItemIds || []);
  const records = data.archivedMarketRecords || [];

  // Build a consolidated list of archived items with metadata
  const archivedEntries: {
    recordId?: string;
    item: MarketItem;
    reason: ArchiveReason;
    note?: string;
    archivedAt: string;
    wasOwned: boolean;
  }[] = useMemo(() => {
    const list: {
      recordId?: string;
      item: MarketItem;
      reason: ArchiveReason;
      note?: string;
      archivedAt: string;
      wasOwned: boolean;
    }[] = [];

    const recordedItemIds = new Set<string>();

    // 1. Add explicitly recorded archive events
    records.forEach((rec) => {
      recordedItemIds.add(rec.itemId);
      const currentLiveItem = allItems.find((i) => i.id === rec.itemId);
      list.push({
        recordId: rec.id,
        item: currentLiveItem || rec.itemSnapshot,
        reason: rec.reason,
        note: rec.note,
        archivedAt: rec.archivedAt,
        wasOwned: rec.wasOwned ?? data.purchases.some((p) => p.itemId === rec.itemId),
      });
    });

    // 2. Add any custom items or archived item IDs that might not have a full record
    archivedIds.forEach((id) => {
      if (!recordedItemIds.has(id)) {
        const found = allItems.find((i) => i.id === id);
        if (found) {
          list.push({
            item: found,
            reason: found.archiveReason || 'no_longer_relevant',
            archivedAt: found.archivedAt || new Date().toISOString(),
            wasOwned: data.purchases.some((p) => p.itemId === id),
          });
        }
      }
    });

    return list;
  }, [records, archivedIds, allItems, data.purchases]);

  // Filter archived entries
  const filteredEntries = useMemo(() => {
    return archivedEntries.filter((entry) => {
      const matchesReason =
        selectedReason === 'All' || entry.reason === selectedReason;
      const matchesSearch =
        !searchQuery.trim() ||
        entry.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.note && entry.note.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesReason && matchesSearch;
    });
  }, [archivedEntries, selectedReason, searchQuery]);

  // Metrics
  const totalArchivedCount = archivedEntries.length;
  const totalArchivedUsd = archivedEntries.reduce(
    (acc, e) => acc + (e.item.realPriceUsd || 0),
    0
  );
  const completedCount = archivedEntries.filter(
    (e) => e.reason === 'completed' || e.reason === 'acquired' || e.wasOwned
  ).length;
  const outgrownOrReplacedCount = archivedEntries.filter(
    (e) => e.reason === 'outgrown' || e.reason === 'replaced'
  ).length;

  const getReasonLabel = (reason: ArchiveReason) => {
    switch (reason) {
      case 'completed':
      case 'acquired':
        return t('Completed');
      case 'replaced':
        return t('Replaced');
      case 'outgrown':
        return t('Outgrown');
      default:
        return t('Retired');
    }
  };

  const filterTabs: { key: 'All' | ArchiveReason; label: string }[] = [
    { key: 'All', label: t('All') },
    { key: 'completed', label: t('Completed') },
    { key: 'outgrown', label: t('Outgrown') },
    { key: 'replaced', label: t('Replaced') },
    { key: 'no_longer_relevant', label: t('Retired') },
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
          <div className="text-[13px] text-[var(--fg-muted)]">{t('Archived')}</div>
          <div className="text-[22px] font-semibold tracking-tight text-[var(--fg)] mt-1">{totalArchivedCount}</div>
        </div>
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
          <div className="text-[13px] text-[var(--fg-muted)]">{t('Value')}</div>
          <div className="text-[22px] font-semibold tracking-tight text-[var(--fg)] mt-1 truncate">
            ${totalArchivedUsd.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
          <div className="text-[13px] text-[var(--fg-muted)]">{t('Done')}</div>
          <div className="text-[22px] font-semibold tracking-tight text-[var(--accent)] mt-1">
            {completedCount}
            <span className="text-[13px] font-normal text-[var(--fg-muted)] ml-1.5">
              {t('{n} moved on', { n: outgrownOrReplacedCount })}
            </span>
          </div>
        </div>
      </div>

      {/* Search & filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]"
            strokeWidth={1.8}
          />
          <input
            type="text"
            placeholder={t('Search archive')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-3.5 text-[15px] bg-[var(--bg-muted)] border border-transparent rounded-[var(--radius-sm)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--border-strong)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedReason(tab.key)}
              className={`h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedReason === tab.key
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredEntries.length === 0 ? (
        <Empty
          icon={Archive}
          title={archivedEntries.length === 0 ? t('Nothing archived yet') : t('No matches')}
          description={
            archivedEntries.length === 0
              ? t('Dreams you complete or let go of will be kept here.')
              : t('Try a different search or filter.')
          }
          actionLabel={archivedEntries.length === 0 && onExploreMore ? t('Browse dreams') : undefined}
          onAction={archivedEntries.length === 0 && onExploreMore ? onExploreMore : undefined}
        />
      ) : (
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] overflow-hidden">
          {filteredEntries.map((entry, idx) => {
            const { item, reason, note, archivedAt, wasOwned, recordId } = entry;
            const dateStr = new Date(archivedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={recordId || item.id}
                className={`px-4 py-3 ${idx > 0 ? 'border-t border-[var(--border)]' : ''}`}
              >
                <div className="flex items-center gap-3 min-h-[40px]">
                  <div className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--bg-inset)]">
                    <DreamArt
                      type={item.illustrationKey}
                      imageUrl={item.customImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[var(--fg)] truncate">{t(item.name)}</div>
                    <div className="text-[13px] text-[var(--fg-muted)] truncate">
                      {getReasonLabel(reason)} · {dateStr} · D$ {item.dreamDollarPrice.toLocaleString()}
                      {wasOwned ? ` · ${t('Owned')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => restoreMarketItem(item.id, false)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer"
                      title={t('Restore')}
                      aria-label={t('Restore')}
                    >
                      <RotateCcw className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => restoreMarketItem(item.id, true)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer"
                      title={t('Restore and pin to Vision Board')}
                      aria-label={t('Restore and pin to Vision Board')}
                    >
                      <Star className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </button>
                    {recordId && (
                      <button
                        type="button"
                        onClick={() => deleteArchivedRecord(recordId)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer"
                        title={t('Delete record')}
                        aria-label={t('Delete record')}
                      >
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                </div>
                {note && (
                  <p className="text-[13px] text-[var(--fg-muted)] mt-2 pl-[60px] leading-relaxed line-clamp-2">
                    {note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {onExploreMore && filteredEntries.length > 0 && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onExploreMore}>
            {t('Browse dreams')}
          </Button>
        </div>
      )}
    </div>
  );
};
