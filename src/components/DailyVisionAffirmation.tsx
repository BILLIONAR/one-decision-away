import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Button } from './ui';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Star,
  Quote,
  Zap,
  Shield,
  Feather,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DreamArt } from './DreamArt';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { MarketItem } from '../types/models';

type AffirmationTone = 'execution' | 'sovereignty' | 'calm';

interface GeneratedQuote {
  quote: string;
  subtext: string;
  themePillar: string;
  actionPrompt: string;
}

export const DailyVisionAffirmation: React.FC = () => {
  const { data, setActiveRoute, showToast } = useApp();

  const [tone, setTone] = useState<AffirmationTone>('sovereignty');
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!data) return null;

  // 1. Determine highest priority dream from inVisionItemIds or fallback (excluding archived)
  const allItems: MarketItem[] = useMemo(
    () => [...SEED_MARKET_ITEMS, ...data.customMarketItems],
    [data.customMarketItems]
  );

  const archivedItemIds = useMemo(
    () => new Set(data.archivedMarketItemIds || []),
    [data.archivedMarketItemIds]
  );

  const priorityDream: MarketItem = useMemo(() => {
    if (data.inVisionItemIds && data.inVisionItemIds.length > 0) {
      const activeVisionIds = data.inVisionItemIds.filter((id) => !archivedItemIds.has(id));
      if (activeVisionIds.length > 0) {
        const found = allItems.find((item) => item.id === activeVisionIds[0]);
        if (found) return found;
      }
    }
    // Fallback to first non-archived custom dream or first seed dream
    const activeCustom = data.customMarketItems.find((item) => !archivedItemIds.has(item.id));
    if (activeCustom) return activeCustom;
    return allItems.find((item) => !archivedItemIds.has(item.id)) || allItems[0];
  }, [data.inVisionItemIds, data.customMarketItems, allItems, archivedItemIds]);

  const futureRole = data.futureSelf?.title || 'The Finisher';
  const identityStmt = data.futureSelf?.identityStatement || 'I act before I feel ready.';

  // 2. Generate customized inspiring affirmation
  const currentAffirmation: GeneratedQuote = useMemo(() => {
    const dName = priorityDream.name;
    const dCat = priorityDream.category;
    const whyWanted = priorityDream.whyWanted || 'Uncompromising personal sovereignty and focus.';

    // Deterministic date + tone + seed index
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const variantIndex = (dayOfYear + seedOffset) % 4;

    const toneMatrices: Record<AffirmationTone, GeneratedQuote[]> = {
      sovereignty: [
        {
          quote: `You are not merely wishing for ${dName}; you are cultivating the caliber of mind and standard of execution that makes it inevitable.`,
          subtext: `Every disciplined decision today anchors ${dName} from an abstract dream into an impending reality.`,
          themePillar: 'Standard of Sovereignty',
          actionPrompt: `Embody ${futureRole} today. Walk, decide, and create as the person who already commands this level of excellence.`,
        },
        {
          quote: `True luxury is alignment with your highest vision. The existence of ${dName} on your horizon is a compass, not a fantasy.`,
          subtext: `Hold your boundaries firm against distraction. Your future life is listening to today's habits.`,
          themePillar: 'Unyielding Alignment',
          actionPrompt: `Execute your signature decision today with absolute precision.`,
        },
        {
          quote: `Do not shrink your standards to fit current circumstances. Grow your daily capacity until ${dName} is simply your natural baseline.`,
          subtext: `"${whyWanted}"`,
          themePillar: 'Identity Expansion',
          actionPrompt: `Reject old-self excuses. Protect your peak focus blocks without compromise.`,
        },
        {
          quote: `The highest form of respect you can pay to ${dName} is honoring the hours between now and its arrival with deep, undistracted craft.`,
          subtext: `Your Future Self (${futureRole}) has already overcome today's micro-resistances.`,
          themePillar: 'Honor The Vision',
          actionPrompt: `Take one concrete physical step toward this milestone before the day concludes.`,
        },
      ],
      execution: [
        {
          quote: `The speed of your transition to ${dName} is strictly determined by the velocity of your daily decisions.`,
          subtext: `Hesitation is the only distance between who you are and the reality that holds ${dName}.`,
          themePillar: 'Velocity & Momentum',
          actionPrompt: `Eliminate friction. Complete today's signature One Decision without delay.`,
        },
        {
          quote: `Mastery is compounded repetition. When you push through resistance today, you are literally funding the reality of ${dName}.`,
          subtext: `Compounding works in silence before it roars in physical manifest.`,
          themePillar: 'Compounded Force',
          actionPrompt: `Lock into a 45-minute sprint right now. Leave nothing on the table.`,
        },
        {
          quote: `Amateurs wait for motivation; architects of ${dName} build systems that perform regardless of emotion.`,
          subtext: `Discipline is choosing between what you want now and what you want most.`,
          themePillar: 'Architectural Drive',
          actionPrompt: `Treat today's work as the cornerstone of your entire physical empire.`,
        },
        {
          quote: `Every completed mission is a non-negotiable vote cast directly for the reality of ${dName}.`,
          subtext: `Refuse to let the default future win a single hour today.`,
          themePillar: 'Unstoppable Execution',
          actionPrompt: `Execute your active queue with unwavering sharpness.`,
        },
      ],
      calm: [
        {
          quote: `Move with quiet certainty. The path to ${dName} requires neither frantic anxiety nor frantic rushing—only serene, daily consistency.`,
          subtext: `Rest in the clarity of knowing your trajectory is set and unbroken.`,
          themePillar: 'Quiet Certainty',
          actionPrompt: `Breathe deeply. Approach your next task with calm, centered poise.`,
        },
        {
          quote: `When your inner identity is anchored in ${futureRole}, the physical manifestation of ${dName} is merely a matter of time and calm persistence.`,
          subtext: `"${identityStmt}"`,
          themePillar: 'Grounded Presence',
          actionPrompt: `Honor your daily standards with peaceful focus and quiet grace.`,
        },
        {
          quote: `You do not have to conquer the entire mountain today—only take the next deliberate step with the presence of one who knows they will arrive at ${dName}.`,
          subtext: `Peace of mind is the greatest multiplier of high-leverage execution.`,
          themePillar: 'Deliberate Flow',
          actionPrompt: `Clear your immediate workspace and focus on the singular task in front of you.`,
        },
        {
          quote: `Allow ${dName} to inspire your joy today rather than create longing. You are already on the bridge.`,
          subtext: `Gratitude for the journey fuels the stamina for the summit.`,
          themePillar: 'Serene Sovereignty',
          actionPrompt: `Acknowledge your progress so far and proceed with steady clarity.`,
        },
      ],
    };

    const pool = toneMatrices[tone];
    return pool[variantIndex % pool.length];
  }, [priorityDream, futureRole, identityStmt, tone, seedOffset]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSeedOffset((prev) => prev + 1);
      setIsGenerating(false);
      showToast('Generated fresh daily perspective for your priority dream', 'info');
    }, 350);
  };

  const handleCopy = () => {
    const fullText = `"${currentAffirmation.quote}"\n— Daily Vision Affirmation for ${priorityDream.name} (${currentAffirmation.themePillar})`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('Affirmation copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      padding="lg"
      className="border-2 border-[var(--color-sage)]/50 bg-[var(--bg-elevated)] relative overflow-hidden shadow-xs space-y-4"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-sage)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--color-sage)]/15 border border-[var(--color-sage)]/30 flex items-center justify-center text-[var(--color-sage)] shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-sage)]">
                Daily Vision Affirmation
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--fg-subtle)] font-mono border border-[var(--border)]">
                AI Synthesis
              </span>
            </div>
            <h3 className="text-xs text-[var(--fg-muted)]">
              Anchored to Priority Dream: <span className="font-semibold text-[var(--fg)]">{priorityDream.name}</span>
            </h3>
          </div>
        </div>

        {/* Tone Toggles & Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-[var(--bg-muted)] p-0.5 rounded-[var(--radius-xs)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setTone('sovereignty')}
              className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[var(--radius-xs)] transition-all flex items-center gap-1 cursor-pointer ${
                tone === 'sovereignty'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="Sovereignty & Identity Tone"
            >
              <Shield className="w-2.5 h-2.5" />
              <span>Sovereign</span>
            </button>
            <button
              type="button"
              onClick={() => setTone('execution')}
              className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[var(--radius-xs)] transition-all flex items-center gap-1 cursor-pointer ${
                tone === 'execution'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="Relentless Drive & Execution Tone"
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Drive</span>
            </button>
            <button
              type="button"
              onClick={() => setTone('calm')}
              className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[var(--radius-xs)] transition-all flex items-center gap-1 cursor-pointer ${
                tone === 'calm'
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="Quiet Certainty & Calm Tone"
            >
              <Feather className="w-2.5 h-2.5" />
              <span>Calm</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-2 h-7"
            title="Generate Fresh Affirmation Perspective"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-[var(--color-sage)]' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="px-2 h-7"
            title="Copy Mantra to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-sage)]" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Affirmation Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* Left / Center Quote Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="sage">{currentAffirmation.themePillar}</Badge>
            <span className="text-[11px] text-[var(--fg-subtle)]">
              Target Valuation: ${priorityDream.realPriceUsd.toLocaleString()} USD
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8">
            <Quote className="w-5 h-5 text-[var(--color-sage)]/40 absolute left-0 top-0.5" />
            <blockquote className="text-base sm:text-lg font-serif italic text-[var(--fg)] leading-relaxed tracking-wide">
              "{currentAffirmation.quote}"
            </blockquote>
          </div>

          <div className="pl-6 sm:pl-8 space-y-1.5">
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {currentAffirmation.subtext}
            </p>
            <div className="p-2.5 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-sm)] flex items-center justify-between gap-3 text-xs">
              <span className="text-[var(--fg)] font-medium text-[11px] leading-snug">
                <span className="font-bold text-[var(--color-sage)] uppercase tracking-wider text-[10px] mr-1.5">
                  Today's Call to Action:
                </span>
                {currentAffirmation.actionPrompt}
              </span>
            </div>
          </div>
        </div>

        {/* Right Dream Visual Card */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="p-3 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-2.5 group">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--fg-muted)] flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-[var(--color-coral)] fill-current" />
                Vision Anchor
              </span>
              <button
                onClick={() => setActiveRoute('/app/market')}
                className="text-[10px] text-[var(--color-sage)] hover:underline flex items-center gap-0.5"
              >
                Change <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="w-full h-28 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] relative bg-black">
              <DreamArt
                type={priorityDream.illustrationKey}
                imageUrl={priorityDream.customImageUrl}
                alt={priorityDream.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-white/90">
                D$ {priorityDream.dreamDollarPrice.toLocaleString()}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold font-display text-[var(--fg)] truncate">
                {priorityDream.name}
              </h4>
              <span className="text-[10px] text-[var(--fg-muted)] block truncate">
                {priorityDream.category}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-[10px]"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setActiveRoute('/app/life')}
            >
              View in Future Life
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
