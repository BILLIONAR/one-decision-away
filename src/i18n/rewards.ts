import type { Locale } from './index';
import type { TransactionKind } from '../types/models';
import { rewardUnlockStatus } from '../services/bankPractice';

interface RewardsCopy {
  explanation: string;
  startHere: string;
  depositsToday: string;
  depositCount: (n: number) => string;
  keptDays: string;
  keptDaysCount: (n: number) => string;
  practiceEvidence: string;
  currencyEstimate: string;
  symbolic: string;
  ready: string;
  estimate: (n: number) => string;
  unlock: (price: string) => string;
  filters: { all: string; now: string; week: string; month: string };
  kindLabels: Record<TransactionKind, string>;
}

const copy = {
  en: {
    explanation: 'D$ is symbolic practice currency. Unlocking a dream marks your effort; it does not buy real goods or predict when you will master a skill.',
    startHere: 'Small D$ goals to mark your practice. Real progress takes time.',
    depositsToday: "Today's deposits", depositCount: (n: number) => `${n} deposit${n === 1 ? '' : 's'} today`,
    keptDays: 'Days with a kept decision', keptDaysCount: (n: number) => `${n} kept-decision days in the last 7`,
    practiceEvidence: 'Completed One Decisions', currencyEstimate: 'D$ target estimate',
    symbolic: 'Symbolic reward', ready: 'Ready to unlock symbolically',
    estimate: (n: number) => `D$ target · ~${n} practice day${n === 1 ? '' : 's'}`,
    unlock: (price: string) => `Unlock for D$ ${price}`,
    filters: { all: 'All', now: 'D$ ready', week: 'D$ target · ≤7 days', month: 'D$ target · ≤30 days' },
    kindLabels: { mission_reward: 'Mission reward', one_decision_reward: 'Kept-decision reward', focus_reward: 'Focus reward', micro_habit_reward: 'Micro-habit reward', check_in_reward: 'Check-in reward', notebook_reward: 'Writing reward', streak_bonus: 'Streak bonus', welcome_grant: 'Welcome grant', purchase: 'Symbolic unlock', season_reward: 'Season reward', adjustment: 'Adjustment' },
  },
  tr: {
    explanation: 'D$, sembolik bir pratik para birimidir. Bir hayalin kilidini açmak çabanı simgeler; gerçek ürün satın almaz ve bir beceride ne zaman ustalaşacağını göstermez.',
    startHere: 'Pratiğini simgeleyen küçük D$ hedefleri. Gerçek ilerleme zaman alır.',
    depositsToday: 'Bugünkü yatırımlar', depositCount: (n: number) => `Bugün ${n} D$ yatırımı`,
    keptDays: 'Kararını tuttuğun günler', keptDaysCount: (n: number) => `Son 7 günde ${n} karar tutulan gün`,
    practiceEvidence: 'Tamamlanan Tek Kararlar', currencyEstimate: 'D$ hedefi tahmini',
    symbolic: 'Sembolik ödül', ready: 'Sembolik olarak açılmaya hazır',
    estimate: (n: number) => `D$ hedefi · yaklaşık ${n} pratik günü`,
    unlock: (price: string) => `D$ ${price} ile kilidini aç`,
    filters: { all: 'Tümü', now: 'D$ hazır', week: 'D$ hedefi · ≤7 gün', month: 'D$ hedefi · ≤30 gün' },
    kindLabels: { mission_reward: 'Görev ödülü', one_decision_reward: 'Tutulan karar ödülü', focus_reward: 'Odak ödülü', micro_habit_reward: 'Mikro alışkanlık ödülü', check_in_reward: 'Günlük değerlendirme ödülü', notebook_reward: 'Yazma ödülü', streak_bonus: 'Seri bonusu', welcome_grant: 'Başlangıç desteği', purchase: 'Sembolik kilit açma', season_reward: 'Sezon ödülü', adjustment: 'Düzeltme' },
  },
  es: {
    explanation: 'D$ es una moneda simbólica de práctica. Desbloquear un sueño reconoce tu esfuerzo; no compra bienes reales ni predice cuándo dominarás una habilidad.',
    startHere: 'Pequeños objetivos de D$ para reconocer tu práctica. El progreso real lleva tiempo.',
    depositsToday: 'Depósitos de hoy', depositCount: (n: number) => `${n} depósito${n === 1 ? '' : 's'} hoy`,
    keptDays: 'Días con una decisión cumplida', keptDaysCount: (n: number) => `${n} días con una decisión cumplida en los últimos 7`,
    practiceEvidence: 'Decisiones cumplidas', currencyEstimate: 'Estimación del objetivo de D$',
    symbolic: 'Recompensa simbólica', ready: 'Lista para desbloquear simbólicamente',
    estimate: (n: number) => `Objetivo de D$ · ~${n} día${n === 1 ? '' : 's'} de práctica`,
    unlock: (price: string) => `Desbloquear por D$ ${price}`,
    filters: { all: 'Todos', now: 'D$ disponibles', week: 'Objetivo de D$ · ≤7 días', month: 'Objetivo de D$ · ≤30 días' },
    kindLabels: { mission_reward: 'Recompensa por misión', one_decision_reward: 'Recompensa por decisión cumplida', focus_reward: 'Recompensa por concentración', micro_habit_reward: 'Recompensa por microhábito', check_in_reward: 'Recompensa por revisión diaria', notebook_reward: 'Recompensa por escribir', streak_bonus: 'Bonus por racha', welcome_grant: 'Crédito de bienvenida', purchase: 'Desbloqueo simbólico', season_reward: 'Recompensa de temporada', adjustment: 'Ajuste' },
  },
} satisfies Record<Locale, RewardsCopy>;

export const rewardsCopy = (locale: Locale): RewardsCopy => copy[locale];

export function rewardUnlockLabel(locale: Locale, price: number, balance: number, pace: { perDay: number; isBaseline: boolean }) {
  const status = rewardUnlockStatus(price, balance, pace);
  const text = rewardsCopy(locale);
  return status.kind === 'ready' ? text.ready : status.kind === 'symbolic' ? text.symbolic : text.estimate(status.days);
}
