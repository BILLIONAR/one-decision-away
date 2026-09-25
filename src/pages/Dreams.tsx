import React, { useMemo, useState } from 'react';
import { Search, Plus, Check, Receipt } from 'lucide-react';
import { useApp } from '../store/useApp';
import { Modal } from '../components/ui';
import { DreamRealityCheck } from '../components/momentum/DreamRealityCheck';
import { DreamArt } from '../components/DreamArt';
import { DreamReceiptModal } from '../components/DreamReceipt';
import { PurchaseReveal } from '../components/PurchaseReveal';
import { AddVisionDreamModal } from '../components/AddVisionDreamModal';
import { ArchiveDreamModal } from '../components/ArchiveDreamModal';
import { ArchivedMarketHistory } from '../components/ArchivedMarketHistory';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_CATEGORIES, EXPLORE_DREAM_ITEMS, ExploreDreamItem } from '../data/exploreDreams';
import { computeLedgerBalance, estimateDailyEarningPace, daysToAfford } from '../services/economy';
import { MarketItem, Purchase } from '../types/models';
import { useT, N_ } from '../i18n';

type Tab = 'mine' | 'explore' | 'owned';
type BudgetKey = 'all' | 'now' | 'week' | 'month';

const BUDGET_FILTERS: { key: BudgetKey; label: string; maxDays: number }[] = [
  { key: 'all', label: N_('All'), maxDays: Infinity },
  { key: 'now', label: N_('Affordable now'), maxDays: 0 },
  { key: 'week', label: N_('Under 1 week'), maxDays: 7 },
  { key: 'month', label: N_('Under 1 month'), maxDays: 30 },
];

const ICON_STROKE = 1.8;

/* ---------- Card ---------- */

interface DreamCardProps {
  name: string;
  imageUrl?: string;
  illustrationKey: string;
  price: number;
  progressPct?: number;
  status?: string;
  onClick: () => void;
  action?: React.ReactNode;
}

/** Smaller Unsplash rendition for grid cards so the grid fills fast. */
const cardImageUrl = (url: string) =>
  url.includes('images.unsplash.com') ? url.replace(/w=\d+/, 'w=600') : url;

const DreamCard: React.FC<DreamCardProps> = ({
  name,
  imageUrl,
  illustrationKey,
  price,
  progressPct,
  status,
  onClick,
  action,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] overflow-hidden flex flex-col">
      <button type="button" onClick={onClick} className="text-left w-full cursor-pointer">
        <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-muted)]">
          {imageUrl && !imgFailed ? (
            <img
              src={cardImageUrl(imageUrl)}
              alt={name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
              className="w-full h-full object-cover opacity-0 transition-opacity duration-500"
            />
          ) : (
            <DreamArt type={illustrationKey} alt={name} className="w-full h-full" />
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <div className="text-[14px] font-semibold text-[var(--fg)] leading-snug line-clamp-2">{name}</div>
          <div className="text-[13px] text-[var(--accent)] font-semibold">D$ {price.toLocaleString()}</div>
          {typeof progressPct === 'number' && (
            <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          )}
          {status && <div className="text-[12px] text-[var(--fg-muted)]">{status}</div>}
        </div>
      </button>
      {action && <div className="px-3 pb-3 mt-auto">{action}</div>}
    </div>
  );
};

/* ---------- Page ---------- */

export const Dreams: React.FC = () => {
  const t = useT();
  const {
    data,
    purchaseItem,
    pinExploreDream,
    reorderVisionItems,
    setActiveRoute,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<Tab | null>(null);
  const [detailItem, setDetailItem] = useState<MarketItem | null>(null);
  const [exploreDetail, setExploreDetail] = useState<ExploreDreamItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [archivingItem, setArchivingItem] = useState<{ item: MarketItem; purchase?: Purchase | null } | null>(null);
  const [revealPurchase, setRevealPurchase] = useState<Purchase | null>(null);
  const [receiptPurchase, setReceiptPurchase] = useState<Purchase | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [query, setQuery] = useState('');
  const [categoryKey, setCategoryKey] = useState('all');
  const [budgetKey, setBudgetKey] = useState<BudgetKey>('all');

  const balance = data ? computeLedgerBalance(data.transactions) : 0;
  const pace = useMemo(
    () => (data ? estimateDailyEarningPace(data.transactions) : { perDay: 1, isBaseline: true }),
    [data]
  );

  const allItems: MarketItem[] = useMemo(
    () => (data ? [...SEED_MARKET_ITEMS, ...(data.customMarketItems || [])] : []),
    [data]
  );
  const visionIds = data?.inVisionItemIds || [];
  const ownedIds = useMemo(() => new Set((data?.purchases || []).map((p) => p.itemId)), [data]);
  const archivedIds = useMemo(() => new Set(data?.archivedMarketItemIds || []), [data]);

  // Mine: pinned or custom, not archived, not yet owned. Ordered by the vision list (index 0 = focus).
  const mineItems = useMemo(() => {
    const inVision = new Set(visionIds);
    const list = allItems.filter(
      (i) => !archivedIds.has(i.id) && !ownedIds.has(i.id) && (inVision.has(i.id) || i.isCustom)
    );
    return list.sort((a, b) => {
      const ia = visionIds.indexOf(a.id);
      const ib = visionIds.indexOf(b.id);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    });
  }, [allItems, visionIds, archivedIds, ownedIds]);

  const focusId = visionIds.find((id) => !archivedIds.has(id) && !ownedIds.has(id)) || mineItems[0]?.id;

  const activeTab: Tab = tab ?? (mineItems.length > 0 ? 'mine' : 'explore');

  // Explore helpers (same matching rule pinExploreDream uses)
  const addedExploreIds = useMemo(() => {
    const set = new Set<string>();
    const customs = data?.customMarketItems || [];
    const inVision = new Set(visionIds);
    EXPLORE_DREAM_ITEMS.forEach((item) => {
      const match = customs.find((c) => c.id === item.id || c.customImageUrl === item.imageUrl);
      if ((match && (inVision.has(match.id) || match.isCustom)) || inVision.has(item.id)) set.add(item.id);
    });
    return set;
  }, [data, visionIds]);

  const days = (price: number) => daysToAfford(price, balance, pace.perDay);
  const daysLabel = (price: number) => {
    const d = days(price);
    return d === 0 ? t('Affordable now') : d === 1 ? t('~1 day') : t('~{n} days', { n: d });
  };
  const pctFor = (price: number) => Math.min(100, Math.round((balance / Math.max(1, price)) * 100));

  const filteredExplore = useMemo(() => {
    const cat = EXPLORE_CATEGORIES.find((c) => c.key === categoryKey);
    const q = query.trim().toLocaleLowerCase();
    const maxDays = BUDGET_FILTERS.find((b) => b.key === budgetKey)?.maxDays ?? Infinity;
    return EXPLORE_DREAM_ITEMS.filter((item) => {
      if (cat && cat.category !== 'All' && item.category !== cat.category) return false;
      if (q) {
        const hay = [item.name, item.category, item.location || '', t(item.name), t(item.category), item.location ? t(item.location) : ''];
        if (!hay.some((v) => v.toLocaleLowerCase().includes(q))) return false;
      }
      if (days(item.dreamDollarPrice) > maxDays) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, query, budgetKey, balance, pace.perDay, t]);

  const startHere = useMemo(
    () => [...EXPLORE_DREAM_ITEMS].sort((a, b) => a.dreamDollarPrice - b.dreamDollarPrice).slice(0, 4),
    []
  );
  const showStartHere = categoryKey === 'all' && !query.trim() && budgetKey === 'all';

  if (!data) return null;

  const purchases = [...data.purchases].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));

  /* ---------- actions (all reuse store) ---------- */

  const handleBuy = async (item: MarketItem) => {
    if (isPurchasing) return;
    try {
      setIsPurchasing(true);
      await purchaseItem(item.id);
      const created =
        data.purchases.find((p) => p.itemId === item.id) || {
          id: `purch-${Date.now()}`,
          userId: data.profile.id,
          itemId: item.id,
          dreamDollarPaid: item.dreamDollarPrice,
          itemSnapshot: item,
          purchasedAt: new Date().toISOString(),
        };
      setDetailItem(null);
      setRevealPurchase(created);
    } catch {
      // store shows the error toast
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSetFocus = async (item: MarketItem) => {
    await reorderVisionItems([item.id]);
    showToast(t('"{name}" is now your focus.', { name: t(item.name) }), 'success');
    setDetailItem(null);
  };

  const handleAddExplore = async (item: ExploreDreamItem) => {
    if (addedExploreIds.has(item.id)) return;
    await pinExploreDream(item, true);
    showToast(t('Added to your dreams.'), 'success');
  };

  const findMarketItemForExplore = (item: ExploreDreamItem): MarketItem | undefined =>
    allItems.find((c) => c.id === item.id || c.customImageUrl === item.imageUrl);

  /* ---------- render ---------- */

  const tabs: { key: Tab; label: string }[] = [
    { key: 'mine', label: t('Mine') },
    { key: 'explore', label: t('Explore') },
    { key: 'owned', label: t('Owned') },
  ];

  const primaryBtn =
    'h-12 w-full rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const secondaryBtn =
    'h-12 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] font-semibold text-[15px] cursor-pointer';
  const smallBtn =
    'h-9 w-full rounded-[var(--radius-sm)] text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--fg)]">{t('Dreams')}</h1>
        <button
          type="button"
          onClick={() => setActiveRoute('/app/bank')}
          className="h-11 px-4 rounded-full bg-[var(--bg-muted)] text-[14px] font-semibold text-[var(--accent)] cursor-pointer"
          aria-label={t('Dream Dollar balance')}
        >
          D$ {balance.toLocaleString()}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-muted)] rounded-full p-1 flex">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex-1 h-10 rounded-full text-[14px] cursor-pointer transition-colors ${
              activeTab === tb.key
                ? 'bg-[var(--bg)] shadow-sm font-semibold text-[var(--fg)]'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Mine */}
      {activeTab === 'mine' && (
        <div className="space-y-6">
          {mineItems.length === 0 ? (
            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
              <p className="text-[15px] font-semibold text-[var(--fg)]">{t('No dreams yet')}</p>
              <p className="text-[14px] text-[var(--fg-muted)]">{t('Pick one from Explore or add your own.')}</p>
              <button type="button" className={secondaryBtn} onClick={() => setTab('explore')}>
                {t('Explore')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mineItems.map((item) => (
                <DreamCard
                  key={item.id}
                  name={t(item.name)}
                  imageUrl={item.customImageUrl}
                  illustrationKey={item.illustrationKey}
                  price={item.dreamDollarPrice}
                  progressPct={pctFor(item.dreamDollarPrice)}
                  status={item.id === focusId ? t('Focus') : daysLabel(item.dreamDollarPrice)}
                  onClick={() => setDetailItem(item)}
                />
              ))}
            </div>
          )}
          <button type="button" className={secondaryBtn} onClick={() => setIsAddOpen(true)}>
            {t('Add your own dream')}
          </button>
        </div>
      )}

      {/* Explore */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]"
                size={18}
                strokeWidth={ICON_STROKE}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search dreams')}
                className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[15px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]">
              {EXPLORE_CATEGORIES.map((cat) => {
                const active = categoryKey === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategoryKey(cat.key)}
                    className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                      active
                        ? 'bg-[var(--fg)] text-[var(--bg)]'
                        : 'bg-[var(--bg-muted)] text-[var(--fg-muted)]'
                    }`}
                  >
                    {t(cat.label)}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]">
              {BUDGET_FILTERS.map((b) => {
                const active = budgetKey === b.key;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBudgetKey(b.key)}
                    className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer border transition-colors ${
                      active
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border)] text-[var(--fg-muted)]'
                    }`}
                  >
                    {t(b.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {showStartHere && (
            <section className="space-y-3">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Start here')}</h2>
                <p className="text-[13px] text-[var(--fg-muted)]">
                  {t('Small enough to buy in your first week at ~D$ {pace} a day.', { pace: pace.perDay.toLocaleString() })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {startHere.map((item) => (
                  <DreamCard
                    key={item.id}
                    name={t(item.name)}
                    imageUrl={item.imageUrl}
                    illustrationKey="custom_dream"
                    price={item.dreamDollarPrice}
                    status={daysLabel(item.dreamDollarPrice)}
                    onClick={() => setExploreDetail(item)}
                    action={
                      addedExploreIds.has(item.id) ? (
                        <div className={`${smallBtn} text-[var(--accent)]`}>
                          <Check size={16} strokeWidth={ICON_STROKE} /> {t('Added')}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`${smallBtn} bg-[var(--bg)] text-[var(--fg)]`}
                          onClick={() => handleAddExplore(item)}
                        >
                          <Plus size={16} strokeWidth={ICON_STROKE} /> {t('Add')}
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            {showStartHere && <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('All dreams')}</h2>}
            {filteredExplore.length === 0 ? (
              <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
                <p className="text-[14px] text-[var(--fg-muted)]">{t('Nothing matches. Try another filter.')}</p>
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={() => {
                    setQuery('');
                    setCategoryKey('all');
                    setBudgetKey('all');
                  }}
                >
                  {t('Clear filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredExplore.map((item) => (
                  <DreamCard
                    key={item.id}
                    name={t(item.name)}
                    imageUrl={item.imageUrl}
                    illustrationKey="custom_dream"
                    price={item.dreamDollarPrice}
                    status={daysLabel(item.dreamDollarPrice)}
                    onClick={() => setExploreDetail(item)}
                    action={
                      addedExploreIds.has(item.id) ? (
                        <div className={`${smallBtn} text-[var(--accent)]`}>
                          <Check size={16} strokeWidth={ICON_STROKE} /> {t('Added')}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`${smallBtn} bg-[var(--bg)] text-[var(--fg)]`}
                          onClick={() => handleAddExplore(item)}
                        >
                          <Plus size={16} strokeWidth={ICON_STROKE} /> {t('Add')}
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Owned */}
      {activeTab === 'owned' && (
        <div className="space-y-6">
          {purchases.length === 0 ? (
            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
              <p className="text-[15px] font-semibold text-[var(--fg)]">{t('Nothing owned yet')}</p>
              <p className="text-[14px] text-[var(--fg-muted)]">{t('Earn Dream Dollars from decisions, then buy your first dream.')}</p>
              <button type="button" className={secondaryBtn} onClick={() => setTab('explore')}>
                {t('Explore')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {purchases.map((p) => {
                const item = p.itemSnapshot;
                return (
                  <div
                    key={p.id}
                    className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-3 flex items-center gap-3"
                  >
                    <div className="w-16 h-12 rounded-[8px] overflow-hidden shrink-0">
                      <DreamArt type={item.illustrationKey} imageUrl={item.customImageUrl} alt={t(item.name)} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[var(--fg)] truncate">{t(item.name)}</div>
                      <div className="text-[12px] text-[var(--fg-muted)]">
                        {new Date(p.purchasedAt).toLocaleDateString()} · D$ {p.dreamDollarPaid.toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptPurchase(p)}
                      className="h-11 w-11 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                      aria-label={t('Receipt')}
                      title={t('Receipt')}
                    >
                      <Receipt size={20} strokeWidth={ICON_STROKE} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Archived')}</h2>
            <ArchivedMarketHistory onExploreMore={() => setTab('explore')} />
          </section>
        </div>
      )}

      {/* Detail: one of mine */}
      <Modal isOpen={Boolean(detailItem)} onClose={() => setDetailItem(null)} title={t(detailItem?.name || '')}>
        {detailItem && (
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full rounded-[var(--radius-md)] overflow-hidden">
              <DreamArt
                type={detailItem.illustrationKey}
                imageUrl={detailItem.customImageUrl}
                alt={t(detailItem.name)}
                className="w-full h-full"
              />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[20px] font-semibold text-[var(--accent)]">D$ {detailItem.dreamDollarPrice.toLocaleString()}</span>
              <span className="text-[13px] text-[var(--fg-muted)]">{daysLabel(detailItem.dreamDollarPrice)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)] overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pctFor(detailItem.dreamDollarPrice)}%` }} />
            </div>

            <div className="space-y-3 text-[14px]">
              {detailItem.description && <p className="text-[var(--fg)]">{t(detailItem.description)}</p>}
              {detailItem.whyWanted && (
                <div>
                  <div className="text-[13px] font-semibold text-[var(--fg)]">{t('Why you want it')}</div>
                  <p className="text-[var(--fg-muted)]">{t(detailItem.whyWanted)}</p>
                </div>
              )}
              {detailItem.firstRealStep && (
                <div>
                  <div className="text-[13px] font-semibold text-[var(--fg)]">{t('First real step')}</div>
                  <p className="text-[var(--fg-muted)]">{t(detailItem.firstRealStep)}</p>
                </div>
              )}
            </div>

            <DreamRealityCheck item={detailItem} onDecisionSet={() => { setDetailItem(null); setActiveRoute('/app'); }} />

            <div className="space-y-2 pt-1">
              <button
                type="button"
                className={primaryBtn}
                disabled={balance < detailItem.dreamDollarPrice || isPurchasing}
                onClick={() => handleBuy(detailItem)}
              >
                {t('Buy for D$ {price}', { price: detailItem.dreamDollarPrice.toLocaleString() })}
              </button>
              {detailItem.id !== focusId && (
                <button type="button" className={secondaryBtn} onClick={() => handleSetFocus(detailItem)}>
                  {t('Set as focus')}
                </button>
              )}
              <button
                type="button"
                className="h-12 w-full rounded-[var(--radius-sm)] text-[15px] font-semibold text-[var(--fg-muted)] cursor-pointer"
                onClick={() => {
                  const item = detailItem;
                  setDetailItem(null);
                  setArchivingItem({ item, purchase: null });
                }}
              >
                {t('Archive')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail: catalog item */}
      <Modal isOpen={Boolean(exploreDetail)} onClose={() => setExploreDetail(null)} title={t(exploreDetail?.name || '')}>
        {exploreDetail && (
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full rounded-[var(--radius-md)] overflow-hidden">
              <DreamArt type="custom_dream" imageUrl={exploreDetail.imageUrl} alt={t(exploreDetail.name)} className="w-full h-full" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[20px] font-semibold text-[var(--accent)]">D$ {exploreDetail.dreamDollarPrice.toLocaleString()}</span>
              <span className="text-[13px] text-[var(--fg-muted)]">{daysLabel(exploreDetail.dreamDollarPrice)}</span>
            </div>
            {exploreDetail.location && (
              <p className="text-[13px] text-[var(--fg-muted)]">{t(exploreDetail.location)}</p>
            )}
            <div className="space-y-3 text-[14px]">
              <p className="text-[var(--fg)]">{t(exploreDetail.description)}</p>
              <div>
                <div className="text-[13px] font-semibold text-[var(--fg)]">{t('Why you want it')}</div>
                <p className="text-[var(--fg-muted)]">{t(exploreDetail.whyWanted)}</p>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--fg)]">{t('First real step')}</div>
                <p className="text-[var(--fg-muted)]">{t(exploreDetail.firstRealStep)}</p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {addedExploreIds.has(exploreDetail.id) ? (
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={() => {
                    const mi = findMarketItemForExplore(exploreDetail);
                    setExploreDetail(null);
                    if (mi) setDetailItem(mi);
                  }}
                >
                  {t('Open in Mine')}
                </button>
              ) : (
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={async () => {
                    await handleAddExplore(exploreDetail);
                    setExploreDetail(null);
                    setTab('mine');
                  }}
                >
                  {t('Add to my dreams')}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reused flows */}
      <PurchaseReveal
        item={revealPurchase?.itemSnapshot || null}
        dreamDollarPaid={revealPurchase?.dreamDollarPaid || 0}
        onDone={() => {
          if (revealPurchase) setReceiptPurchase(revealPurchase);
          setRevealPurchase(null);
        }}
      />
      <DreamReceiptModal
        purchase={receiptPurchase}
        completedMissionsCount={data.completions.length}
        isOpen={Boolean(receiptPurchase)}
        onClose={() => setReceiptPurchase(null)}
      />
      <AddVisionDreamModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} defaultPinToVision={true} />
      <ArchiveDreamModal
        isOpen={Boolean(archivingItem)}
        onClose={() => setArchivingItem(null)}
        item={archivingItem?.item || null}
        purchase={archivingItem?.purchase || null}
      />
    </div>
  );
};
