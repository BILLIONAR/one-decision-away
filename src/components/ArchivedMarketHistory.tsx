import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { MarketItem, ArchivedMarketRecord, ArchiveReason } from '../types/models';
import { Card, Button, Badge } from './ui';
import { DreamArt } from './DreamArt';
import {
  Archive,
  RotateCcw,
  Star,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  XCircle,
  FileText,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ArchivedMarketHistoryProps {
  onExploreMore?: () => void;
}

export const ArchivedMarketHistory: React.FC<ArchivedMarketHistoryProps> = ({ onExploreMore }) => {
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

  const getReasonBadge = (reason: ArchiveReason) => {
    switch (reason) {
      case 'completed':
      case 'acquired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed / Acquired</span>
          </span>
        );
      case 'replaced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Replaced with Bigger Goal</span>
          </span>
        );
      case 'outgrown':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-3 h-3" />
            <span>Taste Evolved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            <Archive className="w-3 h-3" />
            <span>Retired from Vision</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Archive Overview Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span>Total Archived History</span>
            <Archive className="w-4 h-4 text-[var(--color-slate)]" />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--fg)]">
            {totalArchivedCount} items
          </div>
          <p className="text-[11px] text-[var(--fg-subtle)]">
            Archived out of active vision
          </p>
        </div>

        <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span>Historical Valuation</span>
            <span className="text-xs font-mono font-bold text-[var(--color-sage)]">$ USD</span>
          </div>
          <div className="text-2xl font-bold font-display text-[var(--fg)]">
            ${totalArchivedUsd.toLocaleString()}
          </div>
          <p className="text-[11px] text-[var(--fg-subtle)]">
            Cumulative value of achieved or retired items
          </p>
        </div>

        <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span>Completed vs. Evolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--fg)]">
            {completedCount} <span className="text-xs font-normal text-[var(--fg-muted)]">achieved /</span> {outgrownOrReplacedCount} <span className="text-xs font-normal text-[var(--fg-muted)]">evolved</span>
          </div>
          <p className="text-[11px] text-[var(--fg-subtle)]">
            Full life milestone progression record
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input
            type="text"
            placeholder="Search archived dreams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--color-slate)]"
          />
        </div>

        {/* Reason Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { key: 'All', label: `All (${totalArchivedCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
            { key: 'outgrown', label: 'Taste Evolved' },
            { key: 'replaced', label: 'Replaced' },
            { key: 'no_longer_relevant', label: 'Retired' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedReason(tab.key as any)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-all cursor-pointer ${
                selectedReason === tab.key
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Archived List / Cards */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-slate)]/10 text-[var(--color-slate)] flex items-center justify-center mx-auto">
            <Archive className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-display font-bold text-base text-[var(--fg)]">
              {archivedEntries.length === 0
                ? 'No Archived Dreams Yet'
                : 'No Archive Records Match This Filter'}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {archivedEntries.length === 0
                ? 'Archive dreams you have completed or no longer prioritize to remove them from your Vision Board while keeping their history here.'
                : 'Try changing your search or the archive filter.'}
            </p>
          </div>
          {onExploreMore && (
            <Button variant="outline" size="sm" onClick={onExploreMore} className="mt-2">
              Browse the Collection
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const { item, reason, note, archivedAt, wasOwned, recordId } = entry;
            const dateStr = new Date(archivedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card
                key={recordId || item.id}
                padding="none"
                className="overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col justify-between hover:border-[var(--border-strong)] transition-colors"
              >
                <div>
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-44 h-40 sm:h-auto bg-black/80 relative overflow-hidden shrink-0 border-b sm:border-b-0 sm:border-r border-[var(--border)]">
                      <DreamArt
                        type={item.illustrationKey}
                        imageUrl={item.customImageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale-30 contrast-95 hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <Badge variant="subtle" className="text-[10px] bg-black/70 text-white border-0">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-display font-bold text-sm text-[var(--fg)] leading-snug">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--fg-muted)]">
                              <span>${item.realPriceUsd.toLocaleString()} USD</span>
                              <span>·</span>
                              <span>D$ {item.dreamDollarPrice.toLocaleString()}</span>
                            </div>
                          </div>
                          {getReasonBadge(reason)}
                        </div>

                        <p className="text-xs text-[var(--fg-muted)] line-clamp-2">
                          {item.description}
                        </p>

                        {note && (
                          <div className="p-2.5 rounded bg-[var(--bg-muted)] border border-[var(--border)] text-xs text-[var(--fg)] italic flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[var(--fg-muted)] shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">"{note}"</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[var(--fg-subtle)] pt-2 border-t border-[var(--border)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Archived on {dateStr}</span>
                        </span>
                        {wasOwned && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Acquired Asset
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 bg-[var(--bg-muted)] border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => restoreMarketItem(item.id, false)}
                      className="text-xs py-1"
                      title="Restore item back to active Market collection"
                    >
                      Restore to Market
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Star}
                      onClick={() => restoreMarketItem(item.id, true)}
                      className="text-xs py-1"
                      title="Restore back to active Market and pin to Vision Board"
                    >
                      Restore to Vision & Market ⭐
                    </Button>
                  </div>

                  {recordId && (
                    <button
                      type="button"
                      onClick={() => deleteArchivedRecord(recordId)}
                      className="p-1.5 text-[var(--fg-muted)] hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="Delete archive record permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
