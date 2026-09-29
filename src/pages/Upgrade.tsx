import React, { useEffect, useMemo, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useT, formatDate, formatNumber } from '../i18n';
import { COURSES } from '../data/courses';
import {
  MANAGE_SUBSCRIPTIONS_URL, annualSavingPercent, productIdFor, purchases, usePro,
  type PlanId,
} from '../services/purchases';
import { AI_MONTHLY_MESSAGES, ESSENTIAL_COURSES, tierRank, type PaidTier } from '../services/entitlements';
import { haptic, openExternal } from '../services/native';
import { LEGAL_COMPANY } from '../data/legal';

const LEVELS: readonly PaidTier[] = ['essentials', 'pro', 'coach'];

/**
 * ODA levels. An honest paywall: three paid levels that differ by course depth
 * and coach use, a plain comparison, the trial timeline before any charge,
 * restore and Apple's renewal terms. Prices come from the App Store; nothing
 * here is a demo.
 */
export const Upgrade: React.FC = () => {
  const t = useT();
  const { setActiveRoute, showToast } = useApp();
  const sub = usePro();
  const [period, setPeriod] = useState<PlanId>('annual');
  const [chosen, setChosen] = useState<PaidTier>('pro');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  useEffect(() => { void purchases.init(); }, []);

  const levelName = (tier: PaidTier) => (tier === 'essentials' ? t('Essentials') : tier === 'pro' ? t('Pro') : t('Pro Coach'));
  const fullName = (tier: PaidTier) => `ODA ${levelName(tier)}`;
  const msgs = (tier: PaidTier | 'free') => formatNumber(AI_MONTHLY_MESSAGES[tier]);

  const current = sub.tier === 'free' ? null : sub.tier;
  const products = sub.products;
  const has = (plan: PlanId) => LEVELS.some(l => products[productIdFor(l, plan)]);
  // Only offer a period toggle for periods the store actually returned.
  const periods: PlanId[] = sub.ready && sub.available ? (['monthly', 'annual'] as const).filter(has) : ['monthly', 'annual'];
  useEffect(() => { if (periods.length && !periods.includes(period)) setPeriod(periods[0]); });

  const saving = useMemo(() => {
    for (const l of ['pro', 'essentials', 'coach'] as const) {
      const pct = annualSavingPercent(products[productIdFor(l, 'monthly')]?.amount, products[productIdFor(l, 'annual')]?.amount);
      if (pct) return pct;
    }
    return null;
  }, [products]);

  const product = products[productIdFor(chosen, period)];
  const trial = !current && chosen === 'pro' && period === 'annual' ? product?.trialDays ?? null : null;

  const lessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const benefits: Record<PaidTier, string[]> = {
    essentials: [
      t('Six core courses in full: procrastination, focus, sleep, calm, confidence, motivation'),
      t('The whole Sound Room and every meditation'),
      t('{n} coach messages a month', { n: msgs('essentials') }),
    ],
    pro: [
      t('All {courses} courses, {lessons} lessons', { courses: COURSES.length, lessons }),
      t('The whole Sound Room and every meditation'),
      t('{n} coach messages a month', { n: msgs('pro') }),
      t('New courses and sounds as they arrive'),
    ],
    coach: [
      t('Everything in Pro'),
      t('{n} coach messages a month (fair use)', { n: msgs('coach') }),
      t('A personal plan from your coach every week'),
      t('Your coach reads your journal and decisions, only with your consent'),
      t('Voice replies'),
    ],
  };
  const tagline: Record<PaidTier, string> = {
    essentials: t('The core practice'),
    pro: t('The whole library'),
    coach: t('A coach who knows you'),
  };

  const buy = async () => {
    if (busy || !product) return;
    setBusy('buy');
    const result = await purchases.purchase(product.id);
    setBusy(null);
    if (result === 'purchased') { void haptic('success'); showToast(t('Welcome to {level}.', { level: fullName(product.tier) }), 'success'); }
    else if (result === 'failed') showToast(t('The purchase didn’t go through. You were not charged.'), 'error');
  };
  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    const ok = await purchases.restore();
    setBusy(null);
    showToast(ok ? t('Your ODA subscription was restored.') : t('No active ODA subscription was found for this Apple ID.'), ok ? 'success' : 'info');
  };

  const legal = (
    <p className="text-[12px] leading-relaxed text-center text-[var(--fg-muted)]">
      <button type="button" onClick={() => setActiveRoute('/terms')} className="underline underline-offset-2 min-h-11 px-1">{t('Terms of use')}</button>
      {' · '}
      <button type="button" onClick={() => setActiveRoute('/privacy')} className="underline underline-offset-2 min-h-11 px-1">{t('Privacy policy')}</button>
      <br />© {new Date().getFullYear()} {LEGAL_COMPANY}
    </p>
  );

  const yes = (label: string) => <><Check size={16} strokeWidth={1.8} className="inline text-[var(--accent)]" aria-hidden="true" /><span className="sr-only">{label}</span></>;
  const no = (label: string) => <><Minus size={16} strokeWidth={1.8} className="inline text-[var(--fg-subtle)]" aria-hidden="true" /><span className="sr-only">{label}</span></>;
  const cols: { id: 'free' | PaidTier; name: string }[] = [
    { id: 'free', name: t('Free') }, { id: 'essentials', name: t('Essentials') }, { id: 'pro', name: t('Pro') }, { id: 'coach', name: t('Pro Coach') },
  ];
  const rows: { label: string; cells: React.ReactNode[] }[] = [
    { label: t('Courses'), cells: [t('Intro'), t('Core {n}', { n: ESSENTIAL_COURSES.size }), t('All {n}', { n: COURSES.length }), t('All {n}', { n: COURSES.length })] },
    { label: t('Sound Room'), cells: [t('Some'), t('Full'), t('Full'), t('Full')] },
    { label: t('Coach messages a month'), cells: [msgs('free'), msgs('essentials'), msgs('pro'), msgs('coach')] },
    { label: t('Weekly personal plan'), cells: [no(t('Not included')), no(t('Not included')), no(t('Not included')), yes(t('Included'))] },
    { label: t('Coach knows your journal'), cells: [no(t('Not included')), no(t('Not included')), no(t('Not included')), yes(t('Included'))] },
  ];

  const comparison = (
    <section aria-labelledby="levels-compare" className="space-y-3">
      <h2 id="levels-compare" className="oda-kicker text-[var(--brand-burgundy)]">{t('Side by side')}</h2>
      <div className="oda-card rounded-[var(--radius-lg)] px-3 py-2">
        <table className="w-full table-fixed border-collapse text-center">
          <caption className="sr-only">{t('What each level includes')}</caption>
          <colgroup><col style={{ width: '30%' }} /><col /><col /><col /><col /></colgroup>
          <thead>
            <tr>
              <td className="py-2" />
              {cols.map(c => (
                <th key={c.id} scope="col" className={`py-2 px-0.5 text-[11px] font-semibold leading-tight break-words ${c.id === sub.tier ? 'text-[var(--accent)]' : c.id === 'pro' ? 'text-[var(--brand-burgundy)]' : 'text-[var(--fg-muted)]'}`}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-t border-[var(--border)]">
                <th scope="row" className="py-2.5 pr-1 text-left text-[12px] font-medium leading-tight text-[var(--fg)] break-words">{r.label}</th>
                {r.cells.map((cell, i) => <td key={i} className={`py-2.5 px-0.5 text-[12px] leading-tight text-[var(--fg)] ${cols[i].id === 'pro' ? 'font-semibold' : ''}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">{t('Free includes the whole Turning Point Day, the first two lessons of every course and the first two sounds of each Sound Room category. Essentials opens the six core courses in full.')}</p>
    </section>
  );

  const alwaysFree = <p className="text-[13px] leading-relaxed text-[var(--fg-muted)] text-center">{t('Always free: today’s decision, the evidence tree, the notebook, your backup and {n} coach messages a month.', { n: msgs('free') })}</p>;

  const openCourses = () => setActiveRoute('/app/courses');

  // ---- Web: no purchases here, but the levels are still explained. ----
  const purchasesHere = sub.available;
  const failed = purchasesHere && sub.ready && !Object.keys(products).length;

  const primary = (() => {
    if (!purchasesHere) return null;
    const rankDelta = current ? tierRank(chosen) - tierRank(current) : 1;
    if (current && rankDelta === 0) return { label: t('Manage subscription'), action: () => openExternal(MANAGE_SUBSCRIPTIONS_URL), disabled: false };
    const label = busy === 'buy' ? t('One moment…')
      : trial ? t('Start {n} days free', { n: trial })
      : current ? (rankDelta > 0 ? t('Upgrade to {level}', { level: levelName(chosen) }) : t('Switch to {level}', { level: levelName(chosen) }))
      : t('Subscribe to {level}', { level: levelName(chosen) });
    return { label, action: () => void buy(), disabled: busy !== null || !product };
  })();

  return (
    <div className="space-y-7 max-w-[560px]">
      {purchasesHere && (
        <div className="flex justify-end -mx-2 -mb-4">
          <button type="button" onClick={() => void restore()} disabled={busy !== null} className="min-h-11 px-2 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-md">{busy === 'restore' ? t('Restoring…') : t('Restore purchases')}</button>
        </div>
      )}

      <header className="space-y-1.5">
        <p className="oda-kicker text-[var(--brand-burgundy)]">ODA</p>
        <h1 className="oda-display text-[36px] sm:text-[42px] leading-[1.08]">
          {current ? t('You’re on {level}. Thank you.', { level: fullName(current) }) : t('A little deeper, every day.')}
        </h1>
        {current ? (
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            {sub.renewsAt ? t('Your plan renews or ends on {date}.', { date: formatDate(sub.renewsAt, { day: 'numeric', month: 'long', year: 'numeric' }) }) : t('Everything in your level is open to you.')}
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">{t('Three levels. Pick how deep you want the courses to go and how much you want to talk with your coach.')}</p>
        )}
      </header>

      {!purchasesHere && (
        <section className="oda-card rounded-[var(--radius-lg)] p-5 space-y-2">
          <p className="text-[15px] font-semibold">{t('ODA subscriptions come with the iPhone app.')}</p>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{t('Here on the web every course and sound is open to you, free.')}</p>
          <button type="button" onClick={openCourses} className="min-h-11 text-[14px] font-semibold text-[var(--accent)] underline underline-offset-4">{t('Open the courses')}</button>
        </section>
      )}

      {purchasesHere && !sub.ready ? (
        <div className="space-y-3" aria-busy="true" aria-label={t('Loading plans…')}>
          {[0, 1, 2].map(i => <div key={i} className="h-40 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] animate-pulse" />)}
        </div>
      ) : (
        <>
          {purchasesHere && !failed && (
            <div role="radiogroup" aria-label={t('Billing period')} className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border)]">
              {(['monthly', 'annual'] as const).map(p => {
                const on = p === period;
                const disabled = !periods.includes(p);
                return (
                  <button key={p} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => { setPeriod(p); void haptic('select'); }}
                    className={`min-h-11 px-2 rounded-full text-[14px] font-semibold flex items-center justify-center gap-1.5 flex-wrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-40 ${on ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-[var(--shadow-sm)]' : 'text-[var(--fg-muted)]'}`}>
                    {p === 'annual' ? t('Yearly') : t('Monthly')}
                    {p === 'annual' && saving ? <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded-full">{t('Save {n}%', { n: saving })}</span> : null}
                  </button>
                );
              })}
            </div>
          )}

          {failed && (
            <section className="oda-card rounded-[var(--radius-lg)] p-5 space-y-1" role="alert">
              <p className="text-[15px] font-semibold">{t('Plans couldn’t load.')}</p>
              <p className="text-[14px] text-[var(--fg-muted)]">{t('Check your connection and open this page again.')}</p>
            </section>
          )}

          {trial && (
            <ol aria-label={t('How the free trial works')} className="space-y-2">
              {[
                [t('Today'), t('All of Pro opens.')],
                [t('Day {n}', { n: Math.max(1, trial - 2) }), t('We remind you before the trial ends.')],
                [t('Day {n}', { n: trial }), t('Your subscription starts. Cancel before then if you like.')],
              ].map(([when, what]) => (
                <li key={when} className="flex gap-3 text-[14px] leading-snug"><span className="w-16 shrink-0 font-[family-name:var(--font-editorial)] italic text-[var(--brand-burgundy)]">{when}</span><span>{what}</span></li>
              ))}
            </ol>
          )}

          <div role={purchasesHere ? 'radiogroup' : 'list'} aria-label={t('Levels')} className="space-y-3">
            {LEVELS.map(level => {
              const item = products[productIdFor(level, period)];
              const on = purchasesHere && level === chosen;
              const isCurrent = level === current;
              const badges = (
                <div className="flex flex-wrap items-center gap-1.5 empty:hidden">
                  {level === 'pro' && <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--forest)] text-[var(--on-forest)] dark:bg-[var(--accent)] dark:text-[var(--on-accent)]">{t('Most chosen')}</span>}
                  {isCurrent && <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{t('Your level')}</span>}
                </div>
              );
              const heading = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block oda-kicker text-[var(--brand-burgundy)]">{tagline[level]}</span>
                    <span className="block oda-display text-[26px] leading-tight">{levelName(level)}</span>
                  </span>
                  {purchasesHere && <span aria-hidden="true" className={`mt-1.5 w-5 h-5 rounded-full shrink-0 box-border ${on ? 'border-[6px] border-[var(--forest)] dark:border-[var(--accent)]' : 'border-[1.5px] border-[var(--border-strong)]'}`} />}
                </>
              );
              const priceRow = purchasesHere && (
                <div>
                  {item ? (
                    <>
                      <span className="oda-numeral text-[30px] leading-none">{item.price}</span>
                      <span className="text-[14px] text-[var(--fg-muted)]"> {period === 'annual' ? t('/ year') : t('/ month')}</span>
                      {item.perMonth && <span className="block text-[13px] text-[var(--fg-muted)] mt-1">{t('about {price} a month', { price: item.perMonth })}</span>}
                      {level === 'pro' && period === 'annual' && item.trialDays && !current && <span className="inline-block mt-2 text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded-full">{t('{n} days free', { n: item.trialDays })}</span>}
                    </>
                  ) : (
                    <span className="text-[14px] text-[var(--fg-muted)]">{t('Price shown by the App Store')}</span>
                  )}
                </div>
              );
              const list = (
                <ul className="space-y-2">
                  {benefits[level].map(line => (
                    <li key={line} className="flex gap-2.5 text-[14px] leading-snug"><Check size={16} strokeWidth={1.8} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" /><span>{line}</span></li>
                  ))}
                </ul>
              );
              const base = 'oda-card relative flex flex-col gap-3 rounded-[var(--radius-lg)] p-5';
              return purchasesHere ? (
                <div key={level} className={`${base} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--accent)] ${on ? 'outline-[1.5px] -outline-offset-1 outline-[color:var(--forest)] dark:outline-[color:var(--accent)]' : ''}`}>
                  <input id={`oda-level-${level}`} type="radio" name="oda-level" className="sr-only" checked={on} onChange={() => { setChosen(level); void haptic('select'); }} />
                  {badges}
                  <label htmlFor={`oda-level-${level}`} className="flex items-start justify-between gap-3 cursor-pointer after:absolute after:inset-0 after:content-['']">{heading}</label>
                  {priceRow}
                  {list}
                </div>
              ) : (
                <div key={level} role="listitem" className={base}>
                  {badges}
                  <div className="flex items-start justify-between gap-3">{heading}</div>
                  {list}
                </div>
              );
            })}
          </div>

          {primary && !failed && (
            <div className="space-y-3">
              <button type="button" onClick={primary.action} disabled={primary.disabled}
                className="w-full min-h-[54px] rounded-[14px] bg-[var(--forest)] text-[var(--on-forest)] dark:bg-[var(--accent)] dark:text-[var(--on-accent)] font-semibold text-[16px] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                {primary.label}
              </button>
              {current && tierRank(chosen) < tierRank(current) && <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('A lower level starts at your next renewal. You keep your current level until then.')}</p>}
              <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">
                {trial && product ? t('Free for {n} days, then {price} per {period}. ', { n: trial, price: product.price, period: t('year') }) : ''}
                {t('Payment is charged to your Apple ID. The subscription renews automatically unless cancelled at least 24 hours before the end of the period; manage or cancel it any time in your Apple ID settings.')}
              </p>
            </div>
          )}
        </>
      )}

      {comparison}
      {alwaysFree}
      {legal}
    </div>
  );
};
