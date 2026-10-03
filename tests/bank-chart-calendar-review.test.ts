import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DreamDollarChart } from '../src/components/DreamDollarChart';
import { SavingsMomentumChart } from '../src/components/SavingsMomentumChart';
import type { WalletTransaction } from '../src/types/models';
import { ensureLocaleLoaded, getLocale, setLocale, type Locale } from '../src/i18n';

// Oct 1 at 18:00 in New York. The established reward ledger uses the UTC
// calendar, so its current day is Oct 1 even though local day-end is Oct 2 UTC.
const NOW = '2026-10-01T22:00:00Z';

function reviewClock(t: TestContext) {
  const originalDate = Object.getOwnPropertyDescriptor(globalThis, 'Date')!;
  const RealDate = Date;
  const stamp = new RealDate(NOW).getTime();
  const originalTZ = process.env.TZ;
  const originalLocale = getLocale();
  const FixedDate = new Proxy(RealDate, {
    construct(target, args, newTarget) {
      return Reflect.construct(target, args.length ? args : [stamp], newTarget);
    },
    get(target, property, receiver) {
      return property === 'now' ? () => stamp : Reflect.get(target, property, receiver);
    },
  });
  process.env.TZ = 'America/New_York';
  Object.defineProperty(globalThis, 'Date', { ...originalDate, value: FixedDate });
  setLocale('en');
  t.after(() => {
    Object.defineProperty(globalThis, 'Date', originalDate);
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
    setLocale(originalLocale);
  });
}

function transaction(dayKey: string, amount: number, kind: WalletTransaction['kind'] = 'one_decision_reward'): WalletTransaction {
  return {
    id: `review:${dayKey}:${amount}:${kind}`, userId: 'synthetic-review', walletId: 'synthetic-wallet',
    amount, kind, dayKey, createdAt: `${dayKey}T12:00:00Z`, memo: 'Synthetic chart review',
  };
}

function visibleText(markup: string) {
  return markup.replace(/<[^>]*>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();
}

function earnings(transactions: WalletTransaction[]) {
  return visibleText(renderToStaticMarkup(React.createElement(DreamDollarChart, { transactions, missions: [] })));
}

function savings(transactions: WalletTransaction[]) {
  return visibleText(renderToStaticMarkup(React.createElement(SavingsMomentumChart, { transactions, missions: [] })));
}

test('Bank chart keeps UTC ledger Today and date labels aligned at New York evening', (t) => {
  reviewClock(t);
  const text = earnings([transaction('2026-10-01', 500, 'welcome_grant')]);
  assert.ok(text.includes("+D$ 500 Today's deposits 1 deposit today"), text);
  assert.ok(text.includes('Best Day Thu (Oct 1)'), text);
  assert.ok(text.includes('0 / 7 Days Days with a kept decision'), text);
});

test('Bank seven-day earnings window is Sep 25 through Oct 1 for the UTC ledger day', (t) => {
  reviewClock(t);
  const text = earnings([
    transaction('2026-09-24', 900), // Outside the seven-day UTC window.
    transaction('2026-09-25', 100),
    transaction('2026-10-01', 500),
    transaction('2026-10-02', 800), // A future day must not be counted.
  ]);
  assert.ok(text.includes('+D$ 600 7-Day Total'), text);
  assert.ok(text.includes("+D$ 500 Today's deposits 1 deposit today"), text);
});

test('Savings includes the first displayed UTC day in net and pace, excluding opening history', (t) => {
  reviewClock(t);
  const text = savings([
    transaction('2026-09-01', 200, 'welcome_grant'), // Opening balance before the 30-day window.
    transaction('2026-09-02', 300), // First of 30 days: Sep 2 through Oct 1 inclusive.
  ]);
  assert.ok(text.includes('+D$ 10 Per day, last 30 days'), text);
  assert.ok(text.includes('Total Net: +D$ 300'), text);
  assert.ok(text.includes('D$ 500 reached'), text);
});

test('Savings net includes mixed first-day credits, spending and the current UTC day', (t) => {
  reviewClock(t);
  const text = savings([
    transaction('2026-09-01', 200, 'welcome_grant'),
    transaction('2026-09-02', 300),
    transaction('2026-09-10', -70, 'purchase'),
    transaction('2026-10-01', 50, 'micro_habit_reward'),
  ]);
  assert.ok(text.includes('+D$ 9 Per day, last 30 days'), text);
  assert.ok(text.includes('Total Net: +D$ 280'), text);
  assert.ok(text.includes('D$ 480 reached'), text);
});

for (const [locale, language] of [['tr', 'tr-TR'], ['es', 'es-ES']] as const) {
  test(`Bank chart formats ledger dates in selected ${locale} UI locale`, async (t) => {
    reviewClock(t);
    setLocale(locale as Locale);
    await ensureLocaleLoaded(locale);
    const instant = new Date(NOW);
    const weekday = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' }).format(instant);
    const date = new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(instant);
    const text = earnings([transaction('2026-10-01', 500, 'welcome_grant')]);
    assert.ok(text.includes(`${weekday} (${date})`), text);
    assert.ok(!text.includes('Thu (Oct 1)'), text);
  });
}
