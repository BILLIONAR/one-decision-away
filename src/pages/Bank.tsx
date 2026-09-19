import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Card,
  Stat,
  Badge,
  Input,
  Select,
  Disclaimer,
} from '../components/ui';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Search,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  computeLedgerBalance,
  computeLifetimeEarned,
  computeLifetimeSpent,
  computeTodayEarnings,
  calculateCurrentStreak,
  ECONOMY_CONSTANTS,
} from '../services/economy';
import { useT } from '../i18n';
import { DreamDollarChart } from '../components/DreamDollarChart';
import { SavingsMomentumChart } from '../components/SavingsMomentumChart';

export const Bank: React.FC = () => {
  const { data } = useApp();
  const t = useT();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const earned = computeLifetimeEarned(data.transactions);
  const spent = computeLifetimeSpent(data.transactions);
  const todayEarned = computeTodayEarnings(data.transactions);
  const streak = calculateCurrentStreak(data.completions.map((c) => c.completedAt));

  const filteredTransactions = data.transactions.filter((tx) => {
    if (filterType === 'earn' && tx.amount < 0) return false;
    if (filterType === 'spend' && tx.amount > 0) return false;
    if (
      searchTerm &&
      !tx.memo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !tx.kind.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Dream Bank')}
        subtitle={t('Your immutable ledger of symbolic earnings, marketplace expenditures, and savings momentum.')}
        issueNumber={t('Issue No. 03 — Ledger & Velocity')}
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={t('Current Balance')}
          value={`D$ ${balance.toLocaleString()}`}
          subtext={t('Available to allocate')}
          badge={t('Verified')}
        />
        <Stat
          label={t('Lifetime Earned')}
          value={`D$ ${earned.toLocaleString()}`}
          subtext={t('Through direct execution')}
          icon={ArrowUpRight}
        />
        <Stat
          label={t('Lifetime Spent')}
          value={`D$ ${spent.toLocaleString()}`}
          subtext={t('Furnished in My Life')}
          icon={ArrowDownLeft}
        />
        <Stat
          label={t("Today's Cap Usage")}
          value={`D$ ${todayEarned.toLocaleString()} / ${ECONOMY_CONSTANTS.DAILY_REWARD_CAP.toLocaleString()}`}
          subtext={t('Daily anti-binge guardrail')}
          icon={Calendar}
        />
      </div>

      {/* 7-Day Dream Dollar Earnings Visual Chart (Recharts) */}
      <DreamDollarChart transactions={data.transactions} />

      {/* Savings Momentum Visual Chart (D3) */}
      <SavingsMomentumChart
        transactions={data.transactions}
        inVisionItemIds={data.inVisionItemIds}
        customMarketItems={data.customMarketItems}
        userGoals={data.goals}
      />

      {/* Ledger Section */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
            <h3 className="font-display font-bold text-base text-[var(--fg)]">
              {t('Simulation Ledger ({n} entries)', { n: data.transactions.length })}
            </h3>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <Input
                id="search-tx"
                placeholder={t('Search ledger...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: t('All') },
                  { value: 'earn', label: t('Deposits') },
                  { value: 'spend', label: t('Spends') },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="divide-y divide-[var(--border)]">
          {filteredTransactions.map((tx) => {
            const isDeposit = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--bg-muted)]/50 px-2 rounded-[var(--radius-sm)] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isDeposit
                        ? 'bg-[var(--success-soft)] text-[var(--color-sage)]'
                        : 'bg-[var(--accent-soft)] text-[var(--color-coral)]'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--fg)]">
                      {tx.memo}
                    </div>
                    <div className="text-[11px] text-[var(--fg-subtle)] flex items-center gap-2">
                      <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="capitalize">{tx.kind.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isDeposit ? 'text-[var(--color-sage)]' : 'text-[var(--color-coral)]'
                    }`}
                  >
                    {isDeposit ? `+ D$ ${tx.amount.toLocaleString()}` : `- D$ ${Math.abs(tx.amount).toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-[var(--fg-subtle)] block">
                    {tx.dayKey}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Disclaimer text={t('Dream Dollars is a virtual simulation currency designed to anchor focus. It cannot be purchased, transferred, or exchanged for fiat currency.')} />
    </div>
  );
};
