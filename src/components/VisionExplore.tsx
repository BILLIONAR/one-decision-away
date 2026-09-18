import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import {
  Card,
  Badge,
  Button,
  Modal,
  Field,
  Input,
  Textarea,
} from './ui';
import {
  Sparkles,
  Home,
  Car,
  Compass,
  Briefcase,
  Star,
  Check,
  Plus,
  Eye,
  Search,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  EXPLORE_CATEGORIES,
  EXPLORE_DREAM_ITEMS,
  ExploreDreamItem,
} from '../data/exploreDreams';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { MarketCategory, MarketItem } from '../types/models';
import { triggerGoldConfetti } from '../utils/confetti';
import { computeLedgerBalance, estimateDailyEarningPace, daysToAfford } from '../services/economy';

const BUDGET_TIERS: { key: string; label: string; min: number; max: number }[] = [
  { key: 'all', label: 'Any budget', min: 0, max: Infinity },
  { key: 'starter', label: 'Under $10k', min: 0, max: 10000 },
  { key: 'mid', label: '$10k – $100k', min: 10000, max: 100000 },
  { key: 'high', label: '$100k – $1M', min: 100000, max: 1000000 },
  { key: 'ultra', label: '$1M+', min: 1000000, max: Infinity },
];

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'dd_asc';

interface VisionExploreProps {
  onOpenCustomModal?: () => void;
}

export const VisionExplore: React.FC<VisionExploreProps> = ({ onOpenCustomModal }) => {
  const { data, pinExploreDream, showToast, setActiveRoute } = useApp();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetKey, setBudgetKey] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ExploreDreamItem | null>(null);

  // Customization modal states
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRealUsd, setCustomRealUsd] = useState<number>(0);
  const [customDPrice, setCustomDPrice] = useState<number>(0);
  const [customWhy, setCustomWhy] = useState('');
  const [customStep, setCustomStep] = useState('');
  const [customItemTarget, setCustomItemTarget] = useState<ExploreDreamItem | null>(null);

  if (!data) return null;

  // Set of pinned IDs or existing custom item URLs
  const inVisionItemIds = new Set(data.inVisionItemIds || []);
  const customItems = data.customMarketItems || [];
  const ownedItemIds = new Set(data.purchases.map((p) => p.itemId));
  const balance = computeLedgerBalance(data.transactions);
  const pace = estimateDailyEarningPace(data.transactions);

  // Helper to check if an explore item is currently pinned in the user's vision board
  const isItemPinned = (item: ExploreDreamItem): boolean => {
    if (inVisionItemIds.has(item.id)) return true;
    const foundCustom = customItems.find(
      (c) => c.id === item.id || (item.imageUrl && c.customImageUrl === item.imageUrl)
    );
    if (foundCustom && inVisionItemIds.has(foundCustom.id)) return true;
    return false;
  };

  // Helper to check if an explore item is in the user's custom market
  const isItemInMarket = (item: ExploreDreamItem): boolean => {
    return customItems.some(
      (c) => c.id === item.id || (item.imageUrl && c.customImageUrl === item.imageUrl)
    );
  };

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return EXPLORE_DREAM_ITEMS.filter((item) => {
      const activeCat = EXPLORE_CATEGORIES.find((c) => c.key === selectedCategoryKey);
      const matchesCategory =
        !activeCat || activeCat.category === 'All' || item.category === activeCat.category;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.whyWanted && item.whyWanted.toLowerCase().includes(q)) ||
        item.highlights.some((h) => h.toLowerCase().includes(q));

      const tier = BUDGET_TIERS.find((t) => t.key === budgetKey) || BUDGET_TIERS[0];
      const matchesBudget = item.realPriceUsd >= tier.min && item.realPriceUsd < tier.max;
      const matchesAffordable = !affordableOnly || item.dreamDollarPrice <= balance;

      return matchesCategory && matchesSearch && matchesBudget && matchesAffordable;
    }).sort((a, b) => {
      if (sortKey === 'price_asc') return a.realPriceUsd - b.realPriceUsd;
      if (sortKey === 'price_desc') return b.realPriceUsd - a.realPriceUsd;
      if (sortKey === 'dd_asc') return a.dreamDollarPrice - b.dreamDollarPrice;
      return 0;
    });
  }, [selectedCategoryKey, searchQuery, budgetKey, sortKey, affordableOnly, balance]);

  const affordableCount = EXPLORE_DREAM_ITEMS.filter((i) => i.dreamDollarPrice <= balance).length;

  // "Start here" shelf: the six cheapest dreams — designed to be bought in the first week
  const firstWeekShelf = useMemo(
    () => [...EXPLORE_DREAM_ITEMS].sort((a, b) => a.dreamDollarPrice - b.dreamDollarPrice).slice(0, 6),
    []
  );
  const showShelf = selectedCategoryKey === 'all' && !searchQuery.trim() && budgetKey === 'all' && !affordableOnly;

  // Handle Quick Pin / Unpin
  const handleTogglePin = async (item: ExploreDreamItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentlyPinned = isItemPinned(item);
    await pinExploreDream(item, !currentlyPinned);
  };

  // Handle Open Customization Modal
  const handleOpenCustomize = (item: ExploreDreamItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomItemTarget(item);
    setCustomName(item.name);
    setCustomRealUsd(item.realPriceUsd);
    setCustomDPrice(item.dreamDollarPrice);
    setCustomWhy(item.whyWanted);
    setCustomStep(item.firstRealStep);
    setIsCustomizeOpen(true);
  };

  // Handle Save Customization and Pin
  const handleSaveCustomizedDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemTarget) return;

    await pinExploreDream(
      {
        ...customItemTarget,
        name: customName.trim() || customItemTarget.name,
        realPriceUsd: customRealUsd || customItemTarget.realPriceUsd,
        dreamDollarPrice: customDPrice || customItemTarget.dreamDollarPrice,
        whyWanted: customWhy.trim() || customItemTarget.whyWanted,
        firstRealStep: customStep.trim() || customItemTarget.firstRealStep,
      },
      true
    );

    setIsCustomizeOpen(false);
    setCustomItemTarget(null);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const totalCuratedCount = EXPLORE_DREAM_ITEMS.length;
  const pinnedCuratedCount = EXPLORE_DREAM_ITEMS.filter((item) => isItemPinned(item)).length;

  return (
    <div className="space-y-6">
      {/* Explore Hero Banner & Search */}
      <div className="p-6 bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-muted)] to-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Vision & Luxury Gallery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--fg)]">
              Inspire Your Vision, Choose, and Add to Your Market
            </h2>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
              Pick your favorites from the world's finest architecture, supercars and one-of-a-kind experiences, then <strong>pin them to your Vision Board</strong> and <strong>add them to your Dream Market</strong> in one click.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] text-center min-w-[120px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] block">
                Pinned on Board
              </span>
              <div className="text-xl font-bold font-display text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                <span>{pinnedCuratedCount} / {totalCuratedCount}</span>
              </div>
            </div>

            {onOpenCustomModal && (
              <Button
                variant="primary"
                size="sm"
                icon={Camera}
                onClick={onOpenCustomModal}
                className="h-full whitespace-nowrap"
              >
                Take Your Own Photo
              </Button>
            )}
          </div>
        </div>

        {/* Search and Category Filter Tabs */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {EXPLORE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryKey === cat.key;
              const countInCat =
                cat.category === 'All'
                  ? EXPLORE_DREAM_ITEMS.length
                  : EXPLORE_DREAM_ITEMS.filter((i) => i.category === cat.category).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className={isSelected ? 'text-[var(--bg)]' : 'text-[var(--color-sage)]'}>
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[var(--bg)]/20 text-[var(--bg)]'
                        : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]'
                    }`}
                  >
                    {countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--fg-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, location, villa name or feature (e.g. Porsche, Como, Villa, V12, Yacht, Kyoto)…"
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--color-sage)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Budget ladder, sort & affordability — makes browsing feel like shopping */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {BUDGET_TIERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setBudgetKey(t.key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                    budgetKey === t.key
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAffordableOnly(!affordableOnly)}
                title="Show only dreams you can buy with your current Dream Dollars"
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  affordableOnly
                    ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)]'
                    : 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border-[var(--color-sage)]/30'
                }`}
              >
                ✓ Affordable now ({affordableCount})
              </button>
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="dd_asc">Closest to my D$ balance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Start-here shelf: first purchases within the first week */}
      {showShelf && (
        <div className="p-4 sm:p-5 bg-[var(--color-sage)]/8 border border-[var(--color-sage)]/30 rounded-[var(--radius-md)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-[var(--fg)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-sage)]" /> Start here — your first-week dreams
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)]">
                Small enough to buy within days at your current pace (~D$ {pace.perDay.toLocaleString()}/day). The first purchase is the one that makes it real.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[var(--color-sage)] self-start sm:self-auto">
              Balance: D$ {balance.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {firstWeekShelf.map((item) => {
              const d = daysToAfford(item.dreamDollarPrice, balance, pace.perDay);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemForDetail(item)}
                  className="text-left rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--color-sage)] transition-all cursor-pointer group"
                >
                  <div className="h-20 bg-black overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-[var(--fg)] leading-snug line-clamp-2">{item.name}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="font-mono font-bold text-[var(--fg)]">D$ {item.dreamDollarPrice.toLocaleString()}</span>
                      <span className={d === 0 ? 'text-[var(--color-sage)] font-bold' : 'text-[var(--fg-subtle)]'}>{d === 0 ? 'Now' : `~${d}d`}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Curated Dreams */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] space-y-3">
          <Search className="w-8 h-8 text-[var(--fg-muted)] mx-auto opacity-60" />
          <h4 className="font-display font-bold text-base text-[var(--fg)]">
            No Dreams Match Your Search
          </h4>
          <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
            No results for "{searchQuery}". Reset the filter or add your own custom photo.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
            Reset Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const pinned = isItemPinned(item);
            const inMarket = isItemInMarket(item);
            const isOwned = ownedItemIds.has(item.id);
            const canAfford = item.dreamDollarPrice <= balance;
            const pctToAfford = Math.min(100, Math.round((balance / item.dreamDollarPrice) * 100));
            const daysLeft = daysToAfford(item.dreamDollarPrice, balance, pace.perDay);

            return (
              <Card
                key={item.id}
                className="flex flex-col h-full overflow-hidden group hover:border-[var(--border-strong)] transition-all"
              >
                {/* Visual Media Header */}
                <div
                  className="h-56 w-full relative bg-black overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItemForDetail(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {isOwned ? null : canAfford ? (
                    <span className="absolute top-12 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-sage)] text-white shadow-sm">
                      ✓ Affordable now
                    </span>
                  ) : (
                    <span
                      className="absolute top-12 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/55 text-white backdrop-blur-sm"
                      title={`${pctToAfford}% funded · at ~D$ ${pace.perDay.toLocaleString()}/day${pace.isBaseline ? ' (one One Decision a day)' : ' (your recent pace)'}`}
                    >
                      ~{daysLeft} day{daysLeft === 1 ? '' : 's'} at your pace
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="subtle" className="backdrop-blur-xs bg-black/60 text-white border-0 text-[10px]">
                      {item.category}
                    </Badge>
                    {item.location && (
                      <span className="bg-black/60 backdrop-blur-xs text-white/90 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--color-coral)]" />
                        {item.location}
                      </span>
                    )}
                  </div>

                  {/* Pin Status Button */}
                  <button
                    onClick={(e) => handleTogglePin(item, e)}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-all shadow-md cursor-pointer ${
                      pinned
                        ? 'bg-amber-500 text-white ring-2 ring-white/50 scale-105'
                        : 'bg-black/60 text-white/80 hover:bg-black/90 hover:text-white hover:scale-105'
                    }`}
                    title={pinned ? 'Remove from Vision Board' : 'Pin to Vision Board & Add to Market'}
                  >
                    <Star className={`w-4 h-4 ${pinned ? 'fill-current' : ''}`} />
                  </button>

                  {/* Valuation Overlays */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono font-bold text-white shadow-xs">
                      ${item.realPriceUsd.toLocaleString()} USD
                    </span>
                    <span className="bg-[var(--color-slate)]/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono font-bold text-white shadow-xs">
                      D$ {item.dreamDollarPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedItemForDetail(item)}
                    >
                      <h3 className="font-display font-bold text-sm text-[var(--fg)] group-hover:text-[var(--color-sage)] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[var(--fg-muted)] line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Highlights Pills */}
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.highlights.slice(0, 3).map((hl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-[var(--bg-muted)] text-[var(--fg-subtle)] rounded border border-[var(--border)]"
                          >
                            {hl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Why Wanted Anchor Quote */}
                    {item.whyWanted && (
                      <div className="p-2.5 bg-[var(--bg-muted)]/80 rounded-[var(--radius-sm)] border border-[var(--border)] text-[11px] text-[var(--fg-subtle)] italic line-clamp-2">
                        "{item.whyWanted}"
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
                    {pinned ? (
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(item, e)}
                        className="flex-1 py-1.5 px-3 rounded-[var(--radius-md)] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pinned to Vision ⭐</span>
                      </button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Star}
                        onClick={(e) => handleTogglePin(item, e)}
                        className="flex-1 text-xs"
                      >
                        Add to Vision & Market
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedItemForDetail(item)}
                      title="View details"
                      className="px-2.5"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenCustomize(item, e)}
                      title="Customize & add"
                      className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] px-2"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemForDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItemForDetail(null)}
          title={selectedItemForDetail.name}
          subtitle={`${selectedItemForDetail.category} · ${selectedItemForDetail.location || 'Global Luxury'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Modal Hero Image */}
            <div className="w-full h-72 rounded-[var(--radius-md)] overflow-hidden relative bg-black">
              <img
                src={selectedItemForDetail.imageUrl}
                alt={selectedItemForDetail.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <Badge variant="subtle" className="backdrop-blur-xs bg-black/75 text-white border-0">
                  {selectedItemForDetail.category}
                </Badge>
                {selectedItemForDetail.location && (
                  <span className="bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                    {selectedItemForDetail.location}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
                <span className="bg-black/85 backdrop-blur-xs px-3 py-1.5 rounded text-sm font-mono font-bold text-white">
                  ${selectedItemForDetail.realPriceUsd.toLocaleString()} USD
                </span>
                <span className="bg-[var(--color-slate)]/95 backdrop-blur-xs px-3 py-1.5 rounded text-sm font-mono font-bold text-white">
                  D$ {selectedItemForDetail.dreamDollarPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description & Details */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[var(--fg)] leading-relaxed">
                {selectedItemForDetail.description}
              </p>

              {/* Highlights */}
              {selectedItemForDetail.highlights && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                    Highlights & Features:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItemForDetail.highlights.map((hl, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 bg-[var(--bg-muted)] text-[var(--fg)] rounded border border-[var(--border)] font-medium"
                      >
                        ✨ {hl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Identity Anchor & First Step */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-sage)] block">
                    Emotional Anchor & Identity Standard
                  </span>
                  <p className="text-xs text-[var(--fg)] italic">
                    "{selectedItemForDetail.whyWanted}"
                  </p>
                </div>

                <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-coral)] block">
                    First Concrete Step
                  </span>
                  <p className="text-xs text-[var(--fg)]">
                    {selectedItemForDetail.firstRealStep}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedItemForDetail(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const item = selectedItemForDetail;
                    setSelectedItemForDetail(null);
                    handleOpenCustomize(item);
                  }}
                >
                  Customize & Add
                </Button>

                <Button
                  variant={isItemPinned(selectedItemForDetail) ? 'secondary' : 'primary'}
                  icon={Star}
                  onClick={() => {
                    handleTogglePin(selectedItemForDetail);
                    setSelectedItemForDetail(null);
                  }}
                >
                  {isItemPinned(selectedItemForDetail)
                    ? 'Remove from Vision'
                    : 'Pin to Vision & Add to Market ⭐'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Customize & Pin Modal */}
      {isCustomizeOpen && customItemTarget && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsCustomizeOpen(false);
            setCustomItemTarget(null);
          }}
          title="Customize This Dream & Add to Vision"
          subtitle={`Adapt the "${customItemTarget.name}" template to your own goals and budget.`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveCustomizedDream} className="space-y-4">
            <Field id="custom-explore-name" label="Goal / Dream Title" required>
              <Input
                id="custom-explore-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Porsche 911 GT3 RS Guards Red"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="custom-explore-usd" label="Estimated Real Value ($ USD)">
                <Input
                  id="custom-explore-usd"
                  type="number"
                  min={100}
                  value={customRealUsd}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCustomRealUsd(val);
                    setCustomDPrice(Math.max(100, Math.round(val * 0.008)));
                  }}
                />
              </Field>

              <Field id="custom-explore-dprice" label="Dream Dollar Price (D$)">
                <Input
                  id="custom-explore-dprice"
                  type="number"
                  min={100}
                  value={customDPrice}
                  onChange={(e) => setCustomDPrice(parseInt(e.target.value) || 100)}
                />
              </Field>
            </div>

            <Field
              id="custom-explore-why"
              label="Why Do You Want This? (Your Emotional Anchor)"
            >
              <Textarea
                id="custom-explore-why"
                value={customWhy}
                onChange={(e) => setCustomWhy(e.target.value)}
                rows={2}
              />
            </Field>

            <Field
              id="custom-explore-step"
              label="Your First Concrete Real-World Step"
            >
              <Input
                id="custom-explore-step"
                value={customStep}
                onChange={(e) => setCustomStep(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsCustomizeOpen(false);
                  setCustomItemTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save & Pin to Vision ⭐
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
