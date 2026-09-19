import React, { useState, useEffect, useRef } from 'react';
import { ShareVisionBoardButton } from '../components/ShareCards';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Progress,
  Empty,
  Modal,
  Field,
  Input,
  Disclaimer,
} from '../components/ui';
import {
  Sparkles,
  Layers,
  ShoppingBag,
  ExternalLink,
  Plus,
  CheckCircle,
  FileText,
  Camera,
  Globe,
  Star,
  Eye,
  BookOpen,
  Compass,
  Archive,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
} from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { DreamArt } from '../components/DreamArt';
import { DreamReceiptModal } from '../components/DreamReceipt';
import { DreamJournal } from '../components/DreamJournal';
import { AddVisionDreamModal } from '../components/AddVisionDreamModal';
import { VisionExplore } from '../components/VisionExplore';
import { ArchiveDreamModal } from '../components/ArchiveDreamModal';
import { ArchivedMarketHistory } from '../components/ArchivedMarketHistory';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { MarketItem, Purchase, RealityBridge } from '../types/models';
import { useT } from '../i18n';

export const MyLife: React.FC = () => {
  const {
    data,
    createRealityBridge,
    updateRealityBridgeSavings,
    toggleInVision,
    reorderVisionItems,
    purchaseItem,
    setActiveRoute,
    showToast,
  } = useApp();
  const t = useT();

  const [activeTab, setActiveTab] = useState<'vision' | 'assets' | 'archive' | 'journal'>('vision');
  const [visionSubTab, setVisionSubTab] = useState<'board' | 'explore'>('board');
  const [isAddVisionModalOpen, setIsAddVisionModalOpen] = useState(false);
  const [receiptPurchase, setReceiptPurchase] = useState<Purchase | null>(null);
  const [archivingItem, setArchivingItem] = useState<{ item: MarketItem; purchase?: Purchase | null } | null>(null);
  const [bridgeTargetPurchase, setBridgeTargetPurchase] = useState<Purchase | null>(null);
  const [loggingSavingsBridge, setLoggingSavingsBridge] = useState<RealityBridge | null>(null);
  const [addedSavingsAmount, setAddedSavingsAmount] = useState<number>(100);
  const [savingsNote, setSavingsNote] = useState<string>('');

  // Drag and drop state for vision board reordering
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());
  const prevVisionIdsRef = useRef<string[] | null>(null);

  // New bridge form state
  const [realCostUsd, setRealCostUsd] = useState<number>(0);
  const [currentSavingsUsd, setCurrentSavingsUsd] = useState<number>(0);
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [incomeProject, setIncomeProject] = useState<string>('');
  const [firstRealAction, setFirstRealAction] = useState<string>('');
  const [nextMilestone, setNextMilestone] = useState<string>('');

  if (!data) return null;

  const allItems: MarketItem[] = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  const inVisionItemIdsList = data.inVisionItemIds || [];
  const inVisionItemIds = new Set(inVisionItemIdsList);
  const ownedItemIds = new Set(data.purchases.map((p) => p.itemId));
  const archivedItemIds = new Set(data.archivedMarketItemIds || []);

  // Pinned or custom vision board items (excluding archived ones)
  const rawVisionItems = allItems.filter(
    (item) => !archivedItemIds.has(item.id) && (inVisionItemIds.has(item.id) || item.isCustom)
  );

  // Sort strictly according to persistent inVisionItemIdsList order
  const visionItems = [...rawVisionItems].sort((a, b) => {
    const idxA = inVisionItemIdsList.indexOf(a.id);
    const idxB = inVisionItemIdsList.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  // Track newly added vision board items to apply entrance animation & spotlight glow
  useEffect(() => {
    const currentIds = visionItems.map((i) => i.id);
    if (prevVisionIdsRef.current !== null) {
      const prevIdsSet = new Set(prevVisionIdsRef.current);
      const newlyAdded = currentIds.filter((id) => !prevIdsSet.has(id));
      if (newlyAdded.length > 0) {
        setRecentlyAddedIds((prev) => new Set([...prev, ...newlyAdded]));
        const timer = setTimeout(() => {
          setRecentlyAddedIds((prev) => {
            const next = new Set(prev);
            newlyAdded.forEach((id) => next.delete(id));
            return next;
          });
        }, 3600);
        return () => clearTimeout(timer);
      }
    }
    prevVisionIdsRef.current = currentIds;
  }, [visionItems]);

  const handleDropItem = async (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const currentIds = visionItems.map((i) => i.id);
    const sourceIndex = currentIds.indexOf(draggedItemId);
    const targetIndex = currentIds.indexOf(targetItemId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const newIds = [...currentIds];
    const [moved] = newIds.splice(sourceIndex, 1);
    newIds.splice(targetIndex, 0, moved);

    setDraggedItemId(null);
    setDragOverItemId(null);

    await reorderVisionItems(newIds);
    soundSynthesizer.playTapChime();
    showToast(t('✨ Vision board priority order updated.'), 'success');
  };

  const handleMovePriority = async (itemId: string, direction: 'prev' | 'next') => {
    const currentIds = visionItems.map((i) => i.id);
    const index = currentIds.indexOf(itemId);
    if (index === -1) return;

    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentIds.length) return;

    const newIds = [...currentIds];
    const [moved] = newIds.splice(index, 1);
    newIds.splice(targetIndex, 0, moved);

    await reorderVisionItems(newIds);
    soundSynthesizer.playTapChime();
    showToast(t('✨ "{name}" moved to priority #{n}.', { name: t(visionItems[index].name), n: targetIndex + 1 }), 'info');
  };

  const handleSortPreset = async (type: 'highest_val' | 'lowest_val' | 'highest_dprice' | 'alphabetical') => {
    const sorted = [...visionItems];
    if (type === 'highest_val') {
      sorted.sort((a, b) => (b.realPriceUsd || 0) - (a.realPriceUsd || 0));
    } else if (type === 'lowest_val') {
      sorted.sort((a, b) => (a.realPriceUsd || 0) - (b.realPriceUsd || 0));
    } else if (type === 'highest_dprice') {
      sorted.sort((a, b) => (b.dreamDollarPrice || 0) - (a.dreamDollarPrice || 0));
    } else if (type === 'alphabetical') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    const newIds = sorted.map((i) => i.id);
    await reorderVisionItems(newIds);
    soundSynthesizer.playTapChime();
    showToast(t('✨ Vision board sorted.'), 'success');
  };

  // Total valuation of active vision board
  const totalVisionRealUsd = visionItems.reduce((acc, item) => acc + (item.realPriceUsd || 0), 0);
  const totalVisionDPrice = visionItems.reduce((acc, item) => acc + (item.dreamDollarPrice || 0), 0);

  // Calculate Dream Net Worth & Real USD Valuation of owned items
  const dreamNetWorth = data.purchases.reduce((acc, p) => acc + p.dreamDollarPaid, 0);
  const totalRealWorthUsd = data.purchases.reduce(
    (acc, p) => acc + (p.itemSnapshot.realPriceUsd || 0),
    0
  );

  // Group purchases by category
  const categories = [
    { key: 'Homes', label: t('My Luxury Villas & Residences') },
    { key: 'Cars & Mobility', label: t('My Supercars & Fleet') },
    { key: 'Luxury Watches', label: t('My Haute Horlogerie & Timepieces') },
    { key: 'Yachts & Aviation', label: t('My Marine & Aviation Fleet') },
    { key: 'Experiences', label: t('My Elite Experiences & Gastronomy') },
    { key: 'Dream Workspace', label: t('My Workspace & Sanctuary') },
    { key: 'Travel', label: t('My Travels & Expeditions') },
    { key: 'Education', label: t('My Education & Mastery') },
    { key: 'Business', label: t('My Enterprise & Capital') },
    { key: 'Health & Wellness', label: t('My Health & Vitality') },
    { key: 'Giving', label: t('My Legacy & Contributions') },
  ];

  const handleOpenCreateBridge = (purchase: Purchase) => {
    setBridgeTargetPurchase(purchase);
    setRealCostUsd(purchase.itemSnapshot.realPriceUsd || 1000);
    setCurrentSavingsUsd(0);
    setIncomeProject(t('Primary Income Allocation'));
    setFirstRealAction(t('Open a dedicated sub-account for {name}', { name: t(purchase.itemSnapshot.name) }));
    setNextMilestone(t('Save first 20% of {name} cost', { name: t(purchase.itemSnapshot.name) }));
  };

  const handleSaveBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridgeTargetPurchase) return;

    // Calculate required monthly savings
    const target = new Date(targetDate);
    const now = new Date();
    const months = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
    const remaining = Math.max(0, realCostUsd - currentSavingsUsd);
    const requiredMonthly = Math.round(remaining / months);

    await createRealityBridge({
      userId: data.profile.id,
      purchaseId: bridgeTargetPurchase.id,
      realCostUsd,
      currentSavingsUsd,
      targetDate,
      requiredMonthlySavingsUsd: requiredMonthly,
      incomeProject: incomeProject.trim() || t('Core Savings Allocation'),
      firstRealAction: firstRealAction.trim() || t('Draft timeline for {name}', { name: t(bridgeTargetPurchase.itemSnapshot.name) }),
      nextMilestone: nextMilestone.trim() || t('Reach first milestone'),
    });

    setBridgeTargetPurchase(null);
  };

  const handleLogSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingSavingsBridge || addedSavingsAmount <= 0) return;

    await updateRealityBridgeSavings(loggingSavingsBridge.id, addedSavingsAmount, savingsNote);
    setLoggingSavingsBridge(null);
    setAddedSavingsAmount(100);
    setSavingsNote('');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('My Future Life · Vision Board & Palace')}
        subtitle={t('Photograph the things you see in real life, add goals from the web, and build your symbolic future.')}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Camera}
              onClick={() => setIsAddVisionModalOpen(true)}
            >
              {t('Take / Add Photo')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingBag}
              onClick={() => setActiveRoute('/app/market')}
            >
              {t('Dream Market')}
            </Button>
          </div>
        }
      />

      {/* Dream Net Worth Banner */}
      <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] block">
                {activeTab === 'vision' ? t('Vision Board Value') : t('Total Dream Balance Invested')}
              </span>
              <div className="text-3xl font-bold font-display text-[var(--color-sage)]">
                {activeTab === 'vision'
                  ? t('${n} USD', { n: totalVisionRealUsd.toLocaleString() })
                  : `D$ ${dreamNetWorth.toLocaleString()}`}
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--border)] hidden sm:block" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] block">
                {activeTab === 'vision' ? t('Target Dream Dollars (D$)') : t('Equivalent Real Valuation')}
              </span>
              <div className="text-2xl font-bold font-display text-[var(--fg)]">
                {activeTab === 'vision'
                  ? `D$ ${totalVisionDPrice.toLocaleString()}`
                  : t('${n} USD', { n: totalRealWorthUsd.toLocaleString() })}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--fg-subtle)] pt-1">
            {activeTab === 'vision'
              ? t('{n} vision goals anchored on your board.', { n: visionItems.length })
              : t('{n} luxury assets anchored in your physical reality transition plan.', { n: data.purchases.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ShareVisionBoardButton />
          <Button
            variant="accent"
            size="sm"
            icon={Camera}
            onClick={() => setIsAddVisionModalOpen(true)}
          >
            {t('+ Add to Vision')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Layers}
            onClick={() => setActiveRoute('/app/bridge')}
          >
            {t('Reality Bridges ({n})', { n: data.realityBridges.length })}
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab('vision')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vision'
              ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)]'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span>{t('Vision Board ({n})', { n: visionItems.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Visual Palace & Assets ({n})', { n: data.purchases.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{t('Archive History ({n})', { n: data.archivedMarketRecords?.length || archivedItemIds.size })}</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('Dream Journal & Photo Log ({n})', { n: data.dreamJournal?.length || 0 })}</span>
        </button>
      </div>

      {activeTab === 'vision' ? (
        <div className="space-y-6">
          {/* Sub Tab Switcher: Pinned Board vs Explore Grid */}
          <div className="flex items-center justify-between gap-3 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVisionSubTab('board')}
                className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  visionSubTab === 'board'
                    ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>{t('Dreams on My Board ({n})', { n: visionItems.length })}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisionSubTab('explore')}
                className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  visionSubTab === 'explore'
                    ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                <span>{t('Explore & Add Luxury Dreams ({n})', { n: EXPLORE_DREAM_ITEMS.length })}</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 pr-2">
              <Button
                variant="outline"
                size="sm"
                icon={Camera}
                onClick={() => setIsAddVisionModalOpen(true)}
                className="text-xs py-1"
              >
                {t('Add Custom Photo')}
              </Button>
            </div>
          </div>

          {visionSubTab === 'explore' ? (
            <VisionExplore onOpenCustomModal={() => setIsAddVisionModalOpen(true)} />
          ) : (
            <>
              {visionItems.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="font-display font-bold text-lg text-[var(--fg)]">
                      {t('Your Vision Board Is Empty')}
                    </h3>
                    <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                      {t("Photograph the cars, homes and places that inspire you in real life, or pin inspiring dreams from our curated explore gallery to your board.")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      icon={Compass}
                      onClick={() => setVisionSubTab('explore')}
                    >
                      {t('Explore the Curated Gallery')}
                    </Button>
                    <Button
                      variant="outline"
                      icon={Camera}
                      onClick={() => setIsAddVisionModalOpen(true)}
                    >
                      {t('Open Camera & Take a Photo')}
                    </Button>
                    <Button
                      variant="ghost"
                      icon={Globe}
                      onClick={() => setIsAddVisionModalOpen(true)}
                    >
                      {t('Add a Link from the Web')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Prioritization & Reordering Toolbar */}
                  {visionItems.length > 1 && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xs">
                      <div className="flex items-center gap-2.5 text-xs text-[var(--fg-muted)]">
                        <div className="p-1.5 rounded-[var(--radius-sm)] bg-amber-500/10 text-amber-500 shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-[var(--fg)]">{t('Priority Order:')} </span>
                          <span>{t('Drag and drop your dreams, or use the arrows on each card, to rank them by importance.')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto shrink-0">
                        <span className="text-[11px] font-medium text-[var(--fg-subtle)] mr-1">{t('Quick sort:')}</span>
                        <button
                          type="button"
                          onClick={() => handleSortPreset('highest_val')}
                          className="text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer font-medium"
                          title={t('Sort by real value, highest first')}
                        >
                          {t('Highest $ USD')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSortPreset('lowest_val')}
                          className="text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer font-medium"
                          title={t('Sort by real value, lowest first')}
                        >
                          {t('Lowest $ USD')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSortPreset('highest_dprice')}
                          className="text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer font-medium"
                          title={t('Sort by Dream Dollar price, highest first')}
                        >
                          {t('Highest D$')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSortPreset('alphabetical')}
                          className="text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer font-medium"
                          title={t('Sort alphabetically')}
                        >
                          {t('A-Z')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visionItems.map((item, index) => {
                      const isOwned = ownedItemIds.has(item.id);
                      const isPinned = inVisionItemIds.has(item.id);
                      const isBeingDragged = draggedItemId === item.id;
                      const isDragTarget = dragOverItemId === item.id && !isBeingDragged;
                      const isRecentlyAdded = recentlyAddedIds.has(item.id);

                      return (
                        <Card
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedItemId(item.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            if (draggedItemId && draggedItemId !== item.id) {
                              setDragOverItemId(item.id);
                            }
                          }}
                          onDragLeave={(e) => {
                            if (dragOverItemId === item.id) {
                              setDragOverItemId(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropItem(item.id);
                          }}
                          onDragEnd={() => {
                            setDraggedItemId(null);
                            setDragOverItemId(null);
                          }}
                          style={{
                            animationDelay: isRecentlyAdded ? '0ms' : `${Math.min(index * 50, 300)}ms`,
                          }}
                          className={`flex flex-col h-full overflow-hidden group transition-all duration-200 relative ${
                            isRecentlyAdded
                              ? 'animate-vision-new ring-2 ring-amber-400 shadow-xl'
                              : 'animate-vision-enter'
                          } ${
                            isBeingDragged
                              ? 'opacity-35 scale-[0.98] ring-2 ring-dashed ring-amber-400 shadow-xl'
                              : isDragTarget
                              ? 'ring-2 ring-emerald-500 scale-[1.02] shadow-2xl'
                              : 'hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {/* Drop Target Overlay Highlight */}
                          {isDragTarget && (
                            <div className="absolute inset-0 z-30 bg-emerald-500/10 backdrop-blur-[2px] border-2 border-dashed border-emerald-500 rounded-[var(--radius-lg)] flex items-center justify-center pointer-events-none animate-pulse">
                              <div className="bg-[var(--bg-elevated)]/95 px-3 py-1.5 rounded-[var(--radius-md)] border border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('Drop at #{n}', { n: index + 1 })}</span>
                              </div>
                            </div>
                          )}

                          <div className="h-52 w-full relative bg-black/90 overflow-hidden">
                            <DreamArt
                              illustrationKey={item.illustrationKey}
                              customImageUrl={item.customImageUrl}
                              category={item.category}
                              name={t(item.name)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                            />

                            {/* Top Left: Priority Rank Badge & Drag Handle */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                              <div
                                className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[11px] font-bold text-amber-400 border border-amber-400/30 shadow-xs cursor-grab active:cursor-grabbing select-none"
                                title={t('Drag to reorder priority')}
                              >
                                <GripVertical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>#{index + 1}</span>
                              </div>
                              <Badge variant="subtle">{t(item.category)}</Badge>
                              {isRecentlyAdded && (
                                <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                                  <Sparkles className="w-3 h-3 fill-current" /> {t('Just Added')}
                                </span>
                              )}
                              {item.customImageUrl && (
                                <span className="bg-black/75 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-medium">
                                  {item.customImageUrl.startsWith('data:image') ? t('📸 Live Photo') : t('🌐 Image')}
                                </span>
                              )}
                            </div>

                            {/* Top Right: Move Buttons & Star Pin */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                              {visionItems.length > 1 && (
                                <div className="flex items-center bg-black/70 backdrop-blur-xs rounded-full p-0.5 border border-white/10">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMovePriority(item.id, 'prev');
                                    }}
                                    className="p-1 text-white/80 hover:text-white disabled:opacity-25 disabled:hover:text-white/80 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    title={t('Raise priority (move left)')}
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === visionItems.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMovePriority(item.id, 'next');
                                    }}
                                    className="p-1 text-white/80 hover:text-white disabled:opacity-25 disabled:hover:text-white/80 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    title={t('Lower priority (move right)')}
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleInVision(item.id);
                                }}
                                className={`p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                                  isPinned
                                    ? 'bg-amber-500/90 text-white'
                                    : 'bg-black/60 text-white/70 hover:text-white'
                                }`}
                                title={isPinned ? t('Remove from Vision Board') : t('Pin to Vision Board')}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>

                            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between">
                              <span className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono font-bold text-white">
                                {t('${n} USD', { n: (item.realPriceUsd || 0).toLocaleString() })}
                              </span>
                              <span className="bg-[var(--color-slate)]/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono font-bold text-white">
                                D$ {(item.dreamDollarPrice || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <h3 className="font-display font-bold text-sm text-[var(--fg)] leading-snug">
                                {t(item.name)}
                              </h3>
                              <p className="text-xs text-[var(--fg-muted)] line-clamp-2">
                                {t(item.description)}
                              </p>

                              {item.whyWanted && (
                                <div className="p-2 bg-[var(--bg-muted)] rounded text-[11px] text-[var(--fg-subtle)] italic border border-[var(--border)]">
                                  "{t(item.whyWanted)}"
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                              {isOwned ? (
                                <div className="flex items-center gap-2 w-full">
                                  <Badge variant="success" className="flex-1 justify-center py-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t('Owned (in Palace)')}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2 text-[var(--fg-muted)] hover:text-amber-500"
                                    onClick={() => {
                                      const p = data.purchases.find((purch) => purch.itemId === item.id);
                                      setArchivingItem({ item, purchase: p });
                                    }}
                                    title={t('Archive (move to history)')}
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs flex-1"
                                    onClick={() => setActiveRoute('/app/market')}
                                  >
                                    {t('View in Market')}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={Layers}
                                    className="text-xs flex-1"
                                    onClick={() => {
                                      const dummyPurchase: Purchase = {
                                        id: `vision-ref-${item.id}`,
                                        userId: data.profile.id,
                                        itemId: item.id,
                                        dreamDollarPaid: item.dreamDollarPrice,
                                        itemSnapshot: item,
                                        purchasedAt: new Date().toISOString(),
                                      };
                                      handleOpenCreateBridge(dummyPurchase);
                                    }}
                                  >
                                    {t('Build Bridge')}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2 text-[var(--fg-muted)] hover:text-amber-500"
                                    onClick={() => setArchivingItem({ item, purchase: null })}
                                    title={t('Archive (remove from Vision Board & keep history)')}
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Explore More Invitation Banner */}
                  <div className="p-5 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-display font-bold text-sm text-[var(--fg)] flex items-center justify-center sm:justify-start gap-1.5">
                        <Compass className="w-4 h-4 text-[var(--color-sage)]" />
                        <span>{t('Discover More Luxury Homes, Supercars & Experiences')}</span>
                      </h4>
                      <p className="text-xs text-[var(--fg-muted)]">
                        {t('Lakeside villas, racing machines and polar expeditions await in our curated gallery.')}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Compass}
                      onClick={() => setVisionSubTab('explore')}
                      className="whitespace-nowrap"
                    >
                      {t('Go to Explore')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : activeTab === 'journal' ? (
        <DreamJournal />
      ) : activeTab === 'archive' ? (
        <ArchivedMarketHistory
          onExploreMore={() => {
            setActiveTab('vision');
            setVisionSubTab('explore');
          }}
        />
      ) : (
        <>
          {/* Category Sections */}
      {data.purchases.length > 0 ? (
        <div className="space-y-8">
          {categories.map((cat) => {
            const itemsInCat = data.purchases.filter(
              (p) => p.itemSnapshot.category === cat.key
            );
            if (!itemsInCat.length) return null;

            return (
              <div key={cat.key} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <h2 className="font-display font-bold text-lg text-[var(--fg)]">
                    {t(cat.label)}
                  </h2>
                  <Badge variant="subtle">{itemsInCat.length}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itemsInCat.map((purchase) => {
                    const bridge = data.realityBridges.find(
                      (b) => b.purchaseId === purchase.id
                    );

                    return (
                      <Card
                        key={purchase.id}
                        padding="sm"
                        className="flex flex-col justify-between overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] transition-all group"
                      >
                        <div>
                          <div className="w-full h-48 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] relative bg-[#121415]">
                            <DreamArt
                              type={purchase.itemSnapshot.illustrationKey}
                              imageUrl={purchase.itemSnapshot.customImageUrl}
                              alt={t(purchase.itemSnapshot.name)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                              <Badge variant="sage" className="backdrop-blur-md bg-[#2d4033]/85 text-emerald-200 border-0">
                                {t('100% Owned')}
                              </Badge>
                              <button
                                onClick={() => setArchivingItem({ item: purchase.itemSnapshot, purchase })}
                                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-amber-400 hover:bg-black/90 transition-colors cursor-pointer"
                                title={t('Archive (move to history)')}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono text-white/90">
                              {t('${n} USD', { n: purchase.itemSnapshot.realPriceUsd.toLocaleString() })}
                            </div>
                          </div>

                          <div className="p-3.5 space-y-3">
                            <div>
                              <h3 className="font-display font-bold text-base text-[var(--fg)]">
                                {t(purchase.itemSnapshot.name)}
                              </h3>
                              <p className="text-xs text-[var(--fg-muted)] line-clamp-2 mt-0.5">
                                {t(purchase.itemSnapshot.description)}
                              </p>
                            </div>

                            {/* Dual Progress Bars */}
                            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] space-y-2.5 text-xs">
                              {/* 1. Virtual Progress */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-medium text-[var(--fg-muted)]">
                                  <span>{t('Virtual Ownership')}</span>
                                  <span className="text-[var(--color-sage)] font-bold">100%</span>
                                </div>
                                <Progress value={100} variant="sage" />
                              </div>

                              {/* 2. Real-World Progress */}
                              <div className="space-y-1 pt-1 border-t border-[var(--border)]">
                                <div className="flex justify-between text-[11px] font-medium text-[var(--fg-muted)]">
                                  <span>{t('Real-World Progress')}</span>
                                  <span className="font-bold text-[var(--fg)]">
                                    {bridge ? `${bridge.realProgressPct}%` : t('Not Connected')}
                                  </span>
                                </div>
                                {bridge ? (
                                  <Progress value={bridge.realProgressPct} variant="coral" />
                                ) : (
                                  <div className="text-[10px] text-[var(--fg-subtle)]">
                                    {t('Connect to Reality Bridge to track real savings.')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Controls */}
                        <div className="p-3.5 pt-0 space-y-2">
                          <div className="flex items-center gap-2">
                            {bridge ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => setLoggingSavingsBridge(bridge)}
                              >
                                {t('Log Savings (${n})', { n: bridge.currentSavingsUsd.toLocaleString() })}
                              </Button>
                            ) : (
                              <Button
                                variant="accent"
                                size="sm"
                                className="flex-1 text-xs"
                                icon={Layers}
                                onClick={() => handleOpenCreateBridge(purchase)}
                              >
                                {t('Reality Bridge')}
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              icon={FileText}
                              onClick={() => setReceiptPurchase(purchase)}
                              title={t('View Dream Receipt')}
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Archive}
                              onClick={() => setArchivingItem({ item: purchase.itemSnapshot, purchase })}
                              title={t('Archive (move to history)')}
                              className="px-2 text-[var(--fg-muted)] hover:text-amber-500"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          icon={Sparkles}
          title={t('Your Future Life Gallery is Empty')}
          description={t('Complete daily quests, earn Dream Dollars into your ledger, and buy your first symbolic asset in the Dream Market.')}
          actionLabel={t('Explore Dream Market')}
          onAction={() => setActiveRoute('/app/market')}
        />
      )}

      <Disclaimer text={t('Assets in My Future Life are symbolic visual anchors. The Reality Bridge connects these dreams to tangible savings schedules and real habits.')} />

        </>
      )}

      {/* Dream Receipt Modal */}
      <DreamReceiptModal
        purchase={receiptPurchase}
        completedMissionsCount={data.completions.length}
        isOpen={Boolean(receiptPurchase)}
        onClose={() => setReceiptPurchase(null)}
      />

      {/* Connect to Reality Bridge Modal */}
      <Modal
        isOpen={Boolean(bridgeTargetPurchase)}
        onClose={() => setBridgeTargetPurchase(null)}
        title={t('Connect to Reality Bridge')}
        subtitle={t('Bridge "{name}" to a real savings and execution plan.', { name: t(bridgeTargetPurchase?.itemSnapshot.name ?? '') })}
        maxWidth="lg"
      >
        {bridgeTargetPurchase && (
          <form onSubmit={handleSaveBridge} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="bridge-real-cost" label={t('Real-World Target Cost ($ USD)')} required>
                <Input
                  id="bridge-real-cost"
                  type="number"
                  min={1}
                  value={realCostUsd}
                  onChange={(e) => setRealCostUsd(parseInt(e.target.value) || 0)}
                />
              </Field>

              <Field id="bridge-current-savings" label={t('Current Real Savings ($ USD)')} required>
                <Input
                  id="bridge-current-savings"
                  type="number"
                  min={0}
                  value={currentSavingsUsd}
                  onChange={(e) => setCurrentSavingsUsd(parseInt(e.target.value) || 0)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="bridge-target-date" label={t('Target Date in Physical Reality')} required>
                <Input
                  id="bridge-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </Field>

              <Field id="bridge-income-project" label={t('Income / Action Project')} helper={t('How will you generate this capital?')}>
                <Input
                  id="bridge-income-project"
                  value={incomeProject}
                  onChange={(e) => setIncomeProject(e.target.value)}
                  placeholder={t('e.g. Freelance Consulting Retainer')}
                />
              </Field>
            </div>

            <Field
              id="bridge-first-action"
              label={t('First Real Action (Will create a Mission)')}
              required
              helper={t('A concrete physical action you can take this week.')}
            >
              <Input
                id="bridge-first-action"
                value={firstRealAction}
                onChange={(e) => setFirstRealAction(e.target.value)}
                placeholder={t('e.g. Open high-yield savings sub-account and automate $250 transfer')}
              />
            </Field>

            <Field id="bridge-milestone" label={t('Next Milestone')}>
              <Input
                id="bridge-milestone"
                value={nextMilestone}
                onChange={(e) => setNextMilestone(e.target.value)}
                placeholder={t('e.g. First $2,500 deposited')}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <Button variant="ghost" type="button" onClick={() => setBridgeTargetPurchase(null)}>
                {t('Cancel')}
              </Button>
              <Button variant="accent" type="submit">
                {t('Establish Reality Bridge')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Log Real Savings Modal */}
      <Modal
        isOpen={Boolean(loggingSavingsBridge)}
        onClose={() => setLoggingSavingsBridge(null)}
        title={t('Log Real Savings Progress')}
        subtitle={t('Record money you have actively saved or invested in physical reality.')}
      >
        {loggingSavingsBridge && (
          <form onSubmit={handleLogSavings} className="space-y-4">
            <Field id="savings-amount" label={t('Amount Added ($ USD)')} required>
              <Input
                id="savings-amount"
                type="number"
                min={1}
                value={addedSavingsAmount}
                onChange={(e) => setAddedSavingsAmount(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field id="savings-note" label={t('Optional Note')}>
              <Input
                id="savings-note"
                value={savingsNote}
                onChange={(e) => setSavingsNote(e.target.value)}
                placeholder={t('e.g. Client deposit, monthly automatic savings')}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setLoggingSavingsBridge(null)}>
                {t('Cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={addedSavingsAmount <= 0}>
                {t('Record Savings')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
      {/* Add Vision Dream Modal */}
      <AddVisionDreamModal
        isOpen={isAddVisionModalOpen}
        onClose={() => setIsAddVisionModalOpen(false)}
        defaultPinToVision={true}
        onSuccess={(createdItem) => {
          setRecentlyAddedIds((prev) => new Set([...prev, createdItem.id]));
        }}
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
