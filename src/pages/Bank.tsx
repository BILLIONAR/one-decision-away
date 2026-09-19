import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import {
  computeLedgerBalance,
  computeLifetimeEarned,
  computeLifetimeSpent,
  computeTodayEarnings,
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

  const filteredTransactions = data.transactions.filter((tx) => {
    if (filterType === 'earn' && tx.amount < 0) return false;
    if (filterType === 'spend' && tx.amount > 0) return false;
    if (
      searchTerm &&
      !tx.memo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !tx.kind.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !t(tx.memo).toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) &&
      !t(tx.kind.replace('_', ' ')).toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = [
    { label: t('Earned'), value: `D$ ${earned.toLocaleString()}` },
    { label: t('Spent'), value: `D$ ${spent.toLocaleString()}` },
    {
      label: t('Today'),
      value: `D$ ${todayEarned.toLocaleString()} / ${ECONOMY_CONSTANTS.DAILY_REWARD_CAP.toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Bank')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">{t('What you have earned and spent.')}</p>
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5">
        <div className="text-xs text-[var(--fg-muted)]">{t('Balance')}</div>
        <div className="text-3xl font-semibold tracking-tight text-[var(--accent)] mt-1">
          D$ {balance.toLocaleString()}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-[var(--border)]">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <div className="text-xs text-[var(--fg-muted)]">{s.label}</div>
              <div className="text-sm font-medium text-[var(--fg)] mt-0.5 truncate">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <DreamDollarChart transactions={data.transactions} />

      <SavingsMomentumChart
        transactions={data.transactions}
        inVisionItemIds={data.inVisionItemIds}
        customMarketItems={data.customMarketItems}
        userGoals={data.goals}
      />

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">
          {t('Activity')} <span className="text-[var(--fg-muted)] font-normal">({data.transactions.length})</span>
        </h2>

        <div className="flex gap-2">
          <input
            id="search-tx"
            placeholder={t('Search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none placeholder:text-[var(--fg-subtle)]"
          />
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-32 h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none"
          >
            <option value="all">{t('All')}</option>
            <option value="earn">{t('Earned')}</option>
            <option value="spend">{t('Spent')}</option>
          </select>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {filteredTransactions.map((tx) => {
              const isDeposit = tx.amount > 0;
              return (
                <div key={tx.id} className="px-4 min-h-[56px] py-2 flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 text-[var(--fg-muted)]">
                    {isDeposit ? (
                      <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    ) : (
                      <ArrowDownLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--fg)] truncate">{t(tx.memo)}</div>
                    <div className="text-xs text-[var(--fg-subtle)]">
                      {new Date(tx.createdAt).toLocaleDateString()} · {t(tx.kind.replace('_', ' '))}
                    </div>
                  </div>
                  <span className={`font-medium shrink-0 ${isDeposit ? 'text-[var(--accent)]' : 'text-[var(--fg)]'}`}>
                    {isDeposit ? `+${tx.amount.toLocaleString()}` : `−${Math.abs(tx.amount).toLocaleString()}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5">
            <p className="text-sm text-[var(--fg-muted)]">{t('Nothing here yet.')}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--fg-subtle)]">
        {t('D$ is a practice currency. It cannot be bought, transferred or exchanged for real money.')}
      </p>
    </div>
  );
};
