import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  ChipGroup,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  Disclaimer,
} from '../components/ui';
import {
  Plus,
  Star,
  Sparkles,
  Search,
  Maximize2,
  Gift,
  Eye,
  SlidersHorizontal,
  Home,
  Car,
  Clock,
  Compass,
  Briefcase,
  Utensils,
  Plane,
  HeartHandshake,
  Check,
  Archive,
} from 'lucide-react';
import { DreamArt } from '../components/DreamArt';
import { DreamReceiptModal } from '../components/DreamReceipt';
import { PurchaseReveal } from '../components/PurchaseReveal';
import { AddVisionDreamModal } from '../components/AddVisionDreamModal';
import { ArchiveDreamModal } from '../components/ArchiveDreamModal';
import { ArchivedMarketHistory } from '../components/ArchivedMarketHistory';
import { SEED_MARKET_ITEMS } from '../data/seed';
import {
  computeLedgerBalance,
  estimateMissionsFor,
} from '../services/economy';
import { MarketCategory, MarketItem, Purchase } from '../types/models';

export const Market: React.FC = () => {
  const {
    data,
    purchaseItem,
    addCustomDream,
    grantSimulationBonus,
    toggleInVision,
    setActiveRoute,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'usd-desc'>('featured');
  const [buyingItem, setBuyingItem] = useState<MarketItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<MarketItem | null>(null);
  const [isCustomDreamOpen, setIsCustomDreamOpen] = useState(false);
  const [marketView, setMarketView] = useState<'collection' | 'archived'>('collection');
  const [archivingItem, setArchivingItem] = useState<{ item: MarketItem; purchase?: Purchase | null } | null>(null);
  const [latestPurchase, setLatestPurchase] = useState<Purchase | null>(null);
  const [revealPurchase, setRevealPurchase] = useState<Purchase | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Custom dream form state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<MarketCategory>('Homes');
  const [customRealPrice, setCustomRealPrice] = useState(250000);
  const [customDPrice, setCustomDPrice] = useState(15000);
  const [customDescription, setCustomDescription] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customWhyWanted, setCustomWhyWanted] = useState('');
  const [customFirstStep, setCustomFirstStep] = useState('');

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const allItems = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  const ownedItemIds = new Set(data.purchases.map((p) => p.itemId));
  const inVisionItemIds = new Set(data.inVisionItemIds || []);
  const archivedItemIds = new Set(data.archivedMarketItemIds || []);

  const categories: string[] = [
    'All',
    'Homes',
    'Cars & Mobility',
    'Luxury Watches',
    'Yachts & Aviation',
    'Experiences',
    'Dream Workspace',
    'Travel',
    'Business',
    'Health & Wellness',
    'Giving',
  ];

  const categoryPresets: Record<
    string,
    { name: string; category: MarketCategory; realUsd: number; dPrice: number; img: string; desc: string; step: string }
  > = {
    supercar: {
      name: 'Porsche 911 GT3 RS in Guards Red',
      category: 'Cars & Mobility',
      realUsd: 285000,
      dPrice: 18500,
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      desc: 'Naturally aspirated 4.0L flat-six, lightweight motorsport aerodynamic package, track telemetry.',
      step: 'Book a Porsche Track Experience session and calculate lease/amortization structure.',
    },
    villa: {
      name: 'Lake Como Waterfront Modernist Villa',
      category: 'Homes',
      realUsd: 6500000,
      dPrice: 45000,
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      desc: 'Direct private dock, floor-to-ceiling glass pavilions, infinity pool overlooking Bellagio, heated olive gardens.',
      step: 'Visit Italian lakeside properties and consult with European cross-border wealth advisory.',
    },
    watch: {
      name: 'Patek Philippe Nautilus 5711/1R Rose Gold',
      category: 'Luxury Watches',
      realUsd: 145000,
      dPrice: 12000,
      img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85',
      desc: 'Warm 18k rose gold case, chocolate embossed horizontal dial, mechanical self-winding caliber 26-330 S C.',
      step: 'Register profile with authorized Geneva salon and track certified pre-owned horology auctions.',
    },
    yacht: {
      name: 'Riva 68 Diable Mediterranean Yacht',
      category: 'Yachts & Aviation',
      realUsd: 3800000,
      dPrice: 32000,
      img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=85',
      desc: 'Handcrafted mahogany varnished deck, twin MAN 1,550 hp engines, bespoke owner stateroom, Monaco berth.',
      step: 'Obtain international RYA skipper license and charter a weekend sea trial in Cannes.',
    },
  };

  const handleApplyPreset = (key: keyof typeof categoryPresets) => {
    const preset = categoryPresets[key];
    setCustomName(preset.name);
    setCustomCategory(preset.category);
    setCustomRealPrice(preset.realUsd);
    setCustomDPrice(preset.dPrice);
    setCustomImageUrl(preset.img);
    setCustomDescription(preset.desc);
    setCustomFirstStep(preset.step);
  };

  const filteredAndSortedItems = useMemo(() => {
    let list = allItems.filter((item) => {
      if (archivedItemIds.has(item.id)) return false;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.dreamDollarPrice - b.dreamDollarPrice;
      if (sortBy === 'price-desc') return b.dreamDollarPrice - a.dreamDollarPrice;
      if (sortBy === 'usd-desc') return b.realPriceUsd - a.realPriceUsd;
      return 0; // featured default
    });
  }, [allItems, selectedCategory, searchQuery, sortBy, archivedItemIds]);

  const handleRealPriceChange = (val: number) => {
    setCustomRealPrice(val);
    setCustomDPrice(Math.max(100, Math.round(val * 0.008)));
  };

  const handleConfirmPurchase = async () => {
    if (!buyingItem) return;
    try {
      setIsPurchasing(true);
      await purchaseItem(buyingItem.id);
      const createdPurchase = data.purchases.find((p) => p.itemId === buyingItem.id) || {
        id: `purch-${Date.now()}`,
        userId: data.profile.id,
        itemId: buyingItem.id,
        dreamDollarPaid: buyingItem.dreamDollarPrice,
        itemSnapshot: buyingItem,
        purchasedAt: new Date().toISOString(),
      };
      setRevealPurchase(createdPurchase);
      setBuyingItem(null);
      setInspectingItem(null);
    } catch (e) {
      // Toast handles error
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCreateCustomDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    await addCustomDream({
      name: customName.trim(),
      category: customCategory,
      realPriceUsd: customRealPrice,
      dreamDollarPrice: customDPrice,
      description: customDescription.trim() || 'A personally crafted luxury milestone for My Future Life.',
      illustrationKey: 'custom_dream',
      customImageUrl: customImageUrl.trim() || undefined,
      whyWanted: customWhyWanted.trim(),
      firstRealStep: customFirstStep.trim(),
    });

    setIsCustomDreamOpen(false);
    setCustomName('');
    setCustomDescription('');
    setCustomImageUrl('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dream Market · Luxury Collection"
        subtitle="Furnish your symbolic Future Life with authentic supercars, architectural villas, haute horlogerie, and elite assets."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Compass}
              onClick={() => setActiveRoute('/app/life')}
              title="Explore curated luxury homes, supercars, and experiences to pin into your vision"
            >
              Explore & Pin Visions 🧭
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Gift}
              onClick={() => grantSimulationBonus(25000, 'Executive Life Simulation Grant')}
              title="Claim simulation reward funds to acquire luxury assets freely"
            >
              +D$ 25,000 Grant
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCustomDreamOpen(true)}>
              Add Custom Dream
            </Button>
          </div>
        }
      />

      {/* Balance & Life Gallery Header Bar */}
      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[var(--color-slate)] text-white flex items-center justify-center font-serif text-lg font-bold">
            D$
          </div>
          <div>
            <span className="text-xs text-[var(--fg-muted)]">Available Dream Balance</span>
            <div className="text-2xl font-bold font-display text-[var(--fg)]">
              D$ {balance.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => grantSimulationBonus(50000, 'Ultra-Luxury Executive Bonus')}
          >
            +D$ 50,000 Top-Up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveRoute('/app/life')}
            icon={Sparkles}
          >
            My Future Life ({data.purchases.length} Owned)
          </Button>
        </div>
      </div>

      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input
              type="text"
              placeholder="Search villas, Porsche, Rolex, yachts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--color-slate)]"
            />
          </div>
        </div>

        {/* View Switcher: Active Collection vs Archived History */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center p-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)]">
            <button
              type="button"
              onClick={() => setMarketView('collection')}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                marketView === 'collection'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              Koleksiyon ({filteredAndSortedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setMarketView('archived')}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 cursor-pointer ${
                marketView === 'archived'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive History ({data.archivedMarketRecords?.length || archivedItemIds.size})</span>
            </button>
          </div>

          {marketView === 'collection' && (
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] focus:outline-none"
              >
                <option value="featured">Featured Curations</option>
                <option value="usd-desc">Highest Real Value ($ USD)</option>
                <option value="price-desc">Price: D$ High to Low</option>
                <option value="price-asc">Price: D$ Low to High</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {marketView === 'archived' ? (
        <ArchivedMarketHistory onExploreMore={() => setMarketView('collection')} />
      ) : (
        <>
          {/* Categories Bar */}
          <ChipGroup
            items={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Products Grid */}
          {filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedItems.map((item) => {
                const isOwned = ownedItemIds.has(item.id);
                const isInVision = inVisionItemIds.has(item.id);
                const canAfford = balance >= item.dreamDollarPrice;
                const missingD = Math.max(0, item.dreamDollarPrice - balance);
                const estMissions = estimateMissionsFor(missingD);
                const matchingPurchase = data.purchases.find((p) => p.itemId === item.id);

                return (
                  <Card
                    key={item.id}
                    padding="sm"
                    className={`group flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:shadow-md ${
                      isOwned
                        ? 'border-[var(--color-sage)]/60 bg-[var(--bg-elevated)] ring-1 ring-[var(--color-sage)]/30'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      {/* Photo / Vector Container */}
                      <div className="w-full h-52 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] relative bg-[#121415]">
                        <DreamArt
                          type={item.illustrationKey}
                          imageUrl={item.customImageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                          <Badge variant="slate" className="backdrop-blur-md bg-black/60 text-white border-0">
                            {item.category}
                          </Badge>
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          {isOwned && (
                            <Badge variant="sage" className="backdrop-blur-md bg-[#2d4033]/85 text-emerald-200 border-0">
                              Owned 100%
                            </Badge>
                          )}
                          <button
                            onClick={() => setInspectingItem(item)}
                            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 transition-colors cursor-pointer"
                            title="Zoom & Inspect Details"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setArchivingItem({ item, purchase: matchingPurchase })}
                            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:text-amber-400 hover:bg-black/90 transition-colors cursor-pointer"
                            title="Archive (remove from Vision Board & keep history)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Real Market Tag on Image Bottom */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-white/90 z-10 pointer-events-none">
                          <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono tracking-tight">
                            ${item.realPriceUsd.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-bold text-base text-[var(--fg)] leading-snug group-hover:text-[var(--color-slate)]">
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-xs text-[var(--fg-muted)] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] block">
                              Dream Price
                            </span>
                            <span className="font-bold text-sm text-[var(--color-slate)]">
                              D$ {item.dreamDollarPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] block">
                              Approx. Market
                            </span>
                            <span className="font-semibold text-xs text-[var(--fg-muted)]">
                              ${item.realPriceUsd.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-3.5 pt-0 space-y-2">
                      {!isOwned && (
                        <div className="text-[11px] text-[var(--fg-subtle)] flex items-center justify-between">
                          <span>
                            {canAfford ? (
                              <span className="text-[var(--color-sage)] font-bold">Ready to acquire!</span>
                            ) : (
                              `Need D$ ${missingD.toLocaleString()} more`
                            )}
                          </span>
                          {!canAfford && <span>≈ {estMissions} quests</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {!isOwned ? (
                          <>
                            <Button
                              variant={isInVision ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => toggleInVision(item.id)}
                              className="px-2.5"
                              title={isInVision ? 'Pinned to Vision Board' : 'Pin to Vision Board'}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isInVision ? 'text-[var(--color-coral)] fill-current' : ''
                                }`}
                              />
                            </Button>

                            <Button
                              variant={canAfford ? 'accent' : 'secondary'}
                              size="sm"
                              className="flex-1"
                              onClick={() => setBuyingItem(item)}
                            >
                              {canAfford ? 'Buy with D$' : `Buy with D$ (${item.dreamDollarPrice.toLocaleString()})`}
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setActiveRoute('/app/life')}
                            >
                              View in My Future Life
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setArchivingItem({ item, purchase: matchingPurchase })}
                              title="Archive milestone"
                              className="px-2.5 text-[var(--fg-muted)] hover:text-amber-500"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-3">
              <Search className="w-8 h-8 text-[var(--fg-subtle)] mx-auto" />
              <h3 className="font-display font-bold text-base text-[var(--fg)]">No items found</h3>
              <p className="text-xs text-[var(--fg-muted)]">
                No luxury assets matched "{searchQuery}" in category "{selectedCategory}".
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </>
      )}

      <Disclaimer text="Dream Dollars (D$) has no cash value and cannot be withdrawn. All purchases are symbolic representations in your lifestyle blueprint." />

      {/* Inspect / Zoom Detail Modal */}
      <Modal
        isOpen={Boolean(inspectingItem)}
        onClose={() => setInspectingItem(null)}
        title={inspectingItem?.name || 'Asset Blueprint'}
        subtitle={inspectingItem ? `${inspectingItem.category} · Valuation: $${inspectingItem.realPriceUsd.toLocaleString()} USD` : ''}
        maxWidth="lg"
      >
        {inspectingItem && (
          <div className="space-y-4">
            <div className="w-full h-72 rounded-[var(--radius-lg)] overflow-hidden relative bg-black border border-[var(--border)]">
              <DreamArt
                type={inspectingItem.illustrationKey}
                imageUrl={inspectingItem.customImageUrl}
                alt={inspectingItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="slate" className="backdrop-blur-md bg-black/70 text-white">
                  {inspectingItem.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-[var(--fg)] leading-relaxed">{inspectingItem.description}</p>
              {inspectingItem.whyWanted && (
                <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-xs text-[var(--fg-muted)]">
                  <span className="font-bold text-[var(--fg)] block mb-0.5">Sovereignty Purpose:</span>
                  {inspectingItem.whyWanted}
                </div>
              )}
              {inspectingItem.firstRealStep && (
                <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-xs text-[var(--fg-muted)]">
                  <span className="font-bold text-[var(--fg)] block mb-0.5">Physical Milestone Step:</span>
                  {inspectingItem.firstRealStep}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block">Simulated Price</span>
                <span className="text-lg font-bold text-[var(--color-slate)]">
                  D$ {inspectingItem.dreamDollarPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Archive}
                  onClick={() => {
                    const itemToArchive = inspectingItem;
                    const p = data.purchases.find((purch) => purch.itemId === itemToArchive.id);
                    setInspectingItem(null);
                    setArchivingItem({ item: itemToArchive, purchase: p });
                  }}
                  title="Archive Milestone"
                >
                  Archive
                </Button>
                <Button variant="ghost" onClick={() => setInspectingItem(null)}>
                  Close
                </Button>
                {!ownedItemIds.has(inspectingItem.id) && (
                  <Button
                    variant="accent"
                    onClick={() => {
                      setBuyingItem(inspectingItem);
                    }}
                  >
                    Acquire Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal
        isOpen={Boolean(buyingItem)}
        onClose={() => setBuyingItem(null)}
        title="Confirm Symbolic Acquisition"
        subtitle={buyingItem?.name}
      >
        {buyingItem && (
          <div className="space-y-4">
            {buyingItem.customImageUrl && (
              <div className="w-full h-40 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)]">
                <img
                  src={buyingItem.customImageUrl}
                  alt={buyingItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Asset:</span>
                <span className="font-bold text-[var(--fg)]">{buyingItem.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Category:</span>
                <span className="font-medium text-[var(--fg)]">{buyingItem.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Price:</span>
                <span className="font-bold text-[var(--color-coral)]">
                  D$ {buyingItem.dreamDollarPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Current Balance:</span>
                <span className="font-bold text-[var(--fg)]">
                  D$ {balance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--fg-muted)]">Balance After:</span>
                <span className={`font-bold ${balance >= buyingItem.dreamDollarPrice ? 'text-[var(--color-sage)]' : 'text-red-500'}`}>
                  D$ {(balance - buyingItem.dreamDollarPrice).toLocaleString()}
                </span>
              </div>
            </div>

            {balance < buyingItem.dreamDollarPrice && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-md)] text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span>You need D$ {(buyingItem.dreamDollarPrice - balance).toLocaleString()} more.</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => grantSimulationBonus(buyingItem.dreamDollarPrice - balance + 5000, 'Acquisition Simulation Grant')}
                >
                  Grant Exact D$
                </Button>
              </div>
            )}

            <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] text-xs text-[var(--fg-muted)] leading-relaxed">
              <span className="font-bold text-[var(--fg)] block mb-0.5">Life Blueprint Disclosure:</span>
              Acquiring this item places it into your "My Future Life" visual palace, where you can establish a tangible Reality Bridge and track physical savings.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setBuyingItem(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                isLoading={isPurchasing}
                disabled={balance < buyingItem.dreamDollarPrice}
                onClick={handleConfirmPurchase}
              >
                Confirm & Acquire
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dream Receipt Modal */}
      <PurchaseReveal
        item={revealPurchase?.itemSnapshot || null}
        dreamDollarPaid={revealPurchase?.dreamDollarPaid || 0}
        onDone={() => {
          if (revealPurchase) setLatestPurchase(revealPurchase);
          setRevealPurchase(null);
        }}
      />
      <DreamReceiptModal
        purchase={latestPurchase}
        completedMissionsCount={data.completions.length}
        isOpen={Boolean(latestPurchase)}
        onClose={() => setLatestPurchase(null)}
      />

      {/* Create Custom Dream & Vision Modal */}
      <AddVisionDreamModal
        isOpen={isCustomDreamOpen}
        onClose={() => setIsCustomDreamOpen(false)}
        defaultPinToVision={true}
      />

      {/* Archive Dream Modal */}
      <ArchiveDreamModal
        isOpen={Boolean(archivingItem)}
        onClose={() => setArchivingItem(null)}
        item={archivingItem?.item || null}
        purchase={archivingItem?.purchase || null}
      />
    </div>
  );
};
