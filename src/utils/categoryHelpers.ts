import React from 'react';
import {
  Heart,
  BookOpen,
  Target,
  Brain,
  Sparkles,
  Wrench,
  Home,
  TrendingUp,
  Folder,
  Zap,
  Flame,
  Palette,
  Dumbbell,
  Coffee,
  Code,
  Music,
  Moon,
  Compass,
  Feather,
  Briefcase,
  Shield,
  Sun,
  Smile,
  Droplets,
  Trophy,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { CustomHabitCategory, MicroHabitCategory } from '../types/models';

export interface CategoryPaletteOption {
  id: string;
  label: string;
  hex: string;
  glow: string;
  secondary: string;
}

export const CURATED_CATEGORY_COLORS: CategoryPaletteOption[] = [
  { id: 'indigo', label: 'Deep Indigo', hex: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', secondary: '#818cf8' },
  { id: 'emerald', label: 'Emerald', hex: '#059669', glow: 'rgba(5, 150, 105, 0.4)', secondary: '#34d399' },
  { id: 'amber', label: 'Amber Gold', hex: '#d97706', glow: 'rgba(217, 119, 6, 0.4)', secondary: '#fbbf24' },
  { id: 'rose', label: 'Rose Blush', hex: '#e11d48', glow: 'rgba(225, 29, 72, 0.4)', secondary: '#fb7185' },
  { id: 'sage', label: 'Quiet Sage', hex: '#708879', glow: 'rgba(112, 136, 121, 0.4)', secondary: '#95b3a0' },
  { id: 'terracotta', label: 'Terracotta', hex: '#b8533c', glow: 'rgba(184, 83, 60, 0.4)', secondary: '#e07a60' },
  { id: 'violet', label: 'Amethyst', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', secondary: '#a78bfa' },
  { id: 'sky', label: 'Sky Cerulean', hex: '#0284c7', glow: 'rgba(2, 132, 199, 0.4)', secondary: '#38bdf8' },
  { id: 'teal', label: 'Teal Momentum', hex: '#0d9488', glow: 'rgba(13, 148, 136, 0.4)', secondary: '#2dd4bf' },
  { id: 'bronze', label: 'Warm Bronze', hex: '#a16207', glow: 'rgba(161, 98, 7, 0.4)', secondary: '#d4a373' },
  { id: 'slate', label: 'Charcoal Slate', hex: '#475569', glow: 'rgba(71, 85, 105, 0.35)', secondary: '#94a3b8' },
  { id: 'berry', label: 'Vivid Berry', hex: '#be185d', glow: 'rgba(190, 24, 93, 0.4)', secondary: '#f472b6' },
];

export const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Sparkles,
  Brain,
  Flame,
  Palette,
  Dumbbell,
  BookOpen,
  Coffee,
  Code,
  Music,
  Moon,
  Heart,
  Compass,
  Feather,
  Briefcase,
  Shield,
  TrendingUp,
  Home,
  Target,
  Sun,
  Smile,
  Droplets,
  Trophy,
  Activity,
  Wrench,
  Folder,
};

export const CURATED_CATEGORY_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'Zap', label: 'Focus & Energy', icon: Zap },
  { id: 'Sparkles', label: 'Clarity & Insight', icon: Sparkles },
  { id: 'Brain', label: 'Cognition & Mindset', icon: Brain },
  { id: 'Flame', label: 'Discipline & Fire', icon: Flame },
  { id: 'Palette', label: 'Creativity & Design', icon: Palette },
  { id: 'Dumbbell', label: 'Fitness & Physical', icon: Dumbbell },
  { id: 'BookOpen', label: 'Learning & Wisdom', icon: BookOpen },
  { id: 'Coffee', label: 'Ritual & Momentum', icon: Coffee },
  { id: 'Code', label: 'Engineering & Craft', icon: Code },
  { id: 'Music', label: 'Aesthetics & Audio', icon: Music },
  { id: 'Moon', label: 'Rest & Recovery', icon: Moon },
  { id: 'Heart', label: 'Health & Vitality', icon: Heart },
  { id: 'Compass', label: 'Strategy & Direction', icon: Compass },
  { id: 'Feather', label: 'Writing & Reflection', icon: Feather },
  { id: 'Briefcase', label: 'Career & Leverage', icon: Briefcase },
  { id: 'Shield', label: 'Boundaries & Standards', icon: Shield },
  { id: 'TrendingUp', label: 'Wealth & Assets', icon: TrendingUp },
  { id: 'Home', label: 'Environment & Space', icon: Home },
  { id: 'Target', label: 'Execution & Goals', icon: Target },
  { id: 'Sun', label: 'Morning & Energy', icon: Sun },
  { id: 'Smile', label: 'Wellbeing & Joy', icon: Smile },
  { id: 'Droplets', label: 'Hydration & Nutrition', icon: Droplets },
];

export const SEED_CUSTOM_CATEGORIES: CustomHabitCategory[] = [
  {
    id: 'custom-cat-deep-focus',
    name: 'Deep Focus',
    icon: 'Zap',
    color: '#6366f1',
    description: 'Uninterrupted deep work sprint blocks & distraction defense',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'custom-cat-creativity',
    name: 'Creativity',
    icon: 'Palette',
    color: '#e11d48',
    description: 'Generative thinking, design ideation, writing & rapid prototyping',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export interface ResolvedCategoryConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  iconName: string;
  color: string;
  glowColor: string;
  secondaryColor: string;
  badgeVariant: 'sage' | 'coral' | 'slate' | 'default';
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  soundCueName?: string;
  soundCueDetail?: string;
  hapticDetail?: string;
  isCustom: boolean;
  customCategory?: CustomHabitCategory;
}

export const PREDEFINED_CATEGORIES_RECORD: Record<string, Omit<ResolvedCategoryConfig, 'isCustom'>> = {
  Health: {
    id: 'Health',
    label: 'Health',
    icon: Heart,
    iconName: 'Heart',
    color: '#708879',
    glowColor: 'rgba(112, 136, 121, 0.4)',
    secondaryColor: '#95b3a0',
    badgeVariant: 'sage',
    description: 'Physical vitality, hydration, nutrition & daily movement',
    colorClass: 'text-[var(--color-sage)]',
    bgClass: 'bg-[var(--color-sage)]/10',
    borderClass: 'border-[var(--color-sage)]/30',
    soundCueName: '528Hz Vitality Bloom',
    soundCueDetail: 'Warm Solfeggio vitality bloom (528Hz + 660Hz)',
    hapticDetail: 'Heartbeat pulse [35ms, 40ms]',
  },
  Learning: {
    id: 'Learning',
    label: 'Learning',
    icon: BookOpen,
    iconName: 'BookOpen',
    color: '#263238',
    glowColor: 'rgba(38, 50, 56, 0.35)',
    secondaryColor: '#607d8b',
    badgeVariant: 'default',
    description: 'Knowledge acquisition, reading, study & intellectual craft',
    colorClass: 'text-[var(--color-navy)]',
    bgClass: 'bg-[var(--color-navy)]/10',
    borderClass: 'border-[var(--color-navy)]/30',
    soundCueName: 'Crystal Glissando',
    soundCueDetail: 'Ascending 4-note insight chime (E5 → G#5 → B5 → E6)',
    hapticDetail: 'Crisp double-tap [15ms, 25ms]',
  },
  Discipline: {
    id: 'Discipline',
    label: 'Discipline',
    icon: Target,
    iconName: 'Target',
    color: '#b8533c',
    glowColor: 'rgba(184, 83, 60, 0.4)',
    secondaryColor: '#e07a60',
    badgeVariant: 'coral',
    description: 'Friction reduction, impulse control, standards & consistency',
    colorClass: 'text-[var(--color-coral)]',
    bgClass: 'bg-[var(--color-coral)]/10',
    borderClass: 'border-[var(--color-coral)]/30',
    soundCueName: 'Bedrock Anchor',
    soundCueDetail: 'Resolute 330Hz strike with 165Hz sub-weight & 495Hz fifth',
    hapticDetail: 'Firm anchor pulse [65ms]',
  },
  Mindset: {
    id: 'Mindset',
    label: 'Mindset',
    icon: Brain,
    iconName: 'Brain',
    color: '#b8533c',
    glowColor: 'rgba(184, 83, 60, 0.35)',
    secondaryColor: '#d4a373',
    badgeVariant: 'coral',
    description: 'Cognitive reframing, future self identity & gratitude',
    colorClass: 'text-[var(--color-coral)]',
    bgClass: 'bg-[var(--color-coral)]/10',
    borderClass: 'border-[var(--color-coral)]/30',
    soundCueName: '432Hz Zen Bowl',
    soundCueDetail: 'Harmonic singing bowl resonance (432Hz + 864Hz)',
    hapticDetail: 'Smooth meditative wave [25ms, 20ms]',
  },
  Clarity: {
    id: 'Clarity',
    label: 'Clarity',
    icon: Sparkles,
    iconName: 'Sparkles',
    color: '#708879',
    glowColor: 'rgba(112, 136, 121, 0.4)',
    secondaryColor: '#a3c4b1',
    badgeVariant: 'sage',
    description: 'Breathing, meditation & mental space decluttering',
    colorClass: 'text-[var(--color-sage)]',
    bgClass: 'bg-[var(--color-sage)]/10',
    borderClass: 'border-[var(--color-sage)]/30',
    soundCueName: 'Harmonic Dual Bell',
    soundCueDetail: 'Uplifting clarity chime [1046Hz → 1568Hz]',
    hapticDetail: 'Confirmation tap [30ms]',
  },
  Craft: {
    id: 'Craft',
    label: 'Craft',
    icon: Wrench,
    iconName: 'Wrench',
    color: '#475569',
    glowColor: 'rgba(71, 85, 105, 0.35)',
    secondaryColor: '#94a3b8',
    badgeVariant: 'default',
    description: 'Technical execution, deliberate practice & creative output',
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border-strong)]',
    soundCueName: 'Precision Bell',
    soundCueDetail: 'Resonant execution chime',
    hapticDetail: 'Tactile tap [30ms]',
  },
  Environment: {
    id: 'Environment',
    label: 'Environment',
    icon: Home,
    iconName: 'Home',
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.35)',
    secondaryColor: '#cbd5e1',
    badgeVariant: 'slate',
    description: 'Physical desk workspace, browser tabs & staged surroundings',
    colorClass: 'text-[var(--fg-muted)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: 'Spacious Tone',
    soundCueDetail: 'Open ambient tone',
    hapticDetail: 'Tactile tap [30ms]',
  },
  Wealth: {
    id: 'Wealth',
    label: 'Wealth',
    icon: TrendingUp,
    iconName: 'TrendingUp',
    color: '#d4a373',
    glowColor: 'rgba(212, 163, 115, 0.45)',
    secondaryColor: '#f3c99f',
    badgeVariant: 'coral',
    description: 'Resource management, value creation & leverage tracking',
    colorClass: 'text-[var(--color-sand)]',
    bgClass: 'bg-[var(--color-sand)]/20',
    borderClass: 'border-[var(--color-sand)]/40',
    soundCueName: 'Prosperity Chime',
    soundCueDetail: 'Harmonic abundance tone',
    hapticDetail: 'Tactile tap [30ms]',
  },
};

/**
 * Resolves full visual configuration for any category string,
 * checking predefined definitions first, then user-created custom categories.
 */
export function resolveCategoryConfig(
  categoryIdOrName: MicroHabitCategory | string,
  customCategories: CustomHabitCategory[] = []
): ResolvedCategoryConfig {
  const catKey = (categoryIdOrName || '').trim();

  // 1. Check predefined categories
  if (PREDEFINED_CATEGORIES_RECORD[catKey]) {
    return {
      ...PREDEFINED_CATEGORIES_RECORD[catKey],
      isCustom: false,
    };
  }

  // 2. Check custom categories by id or name
  const foundCustom = customCategories.find(
    (c) => c.id === catKey || c.name.toLowerCase() === catKey.toLowerCase()
  );

  if (foundCustom) {
    const IconComponent = ICON_MAP[foundCustom.icon] || Folder;
    const hex = foundCustom.color || '#6366f1';
    const glow = `${hex}50`;
    const secondary = hex;

    return {
      id: foundCustom.id,
      label: foundCustom.name,
      icon: IconComponent,
      iconName: foundCustom.icon,
      color: hex,
      glowColor: glow,
      secondaryColor: secondary,
      badgeVariant: 'default',
      description: foundCustom.description || 'Custom user category',
      colorClass: '',
      bgClass: '',
      borderClass: '',
      soundCueName: `${foundCustom.name} Harmonic Chime`,
      soundCueDetail: 'Dynamic resonance tailored to your custom category',
      hapticDetail: 'Custom tactile pulse [25ms]',
      isCustom: true,
      customCategory: foundCustom,
    };
  }

  // 3. Fallback for ad-hoc strings
  return {
    id: catKey || 'Other',
    label: catKey || 'Other',
    icon: Folder,
    iconName: 'Folder',
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.35)',
    secondaryColor: '#94a3b8',
    badgeVariant: 'slate',
    description: 'Custom micro-habit category',
    colorClass: 'text-[var(--fg-muted)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: 'Standard Chime',
    soundCueDetail: 'Clean completion tone',
    hapticDetail: 'Confirmation tap [30ms]',
    isCustom: false,
  };
}
