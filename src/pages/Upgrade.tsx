import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useT, formatDate } from '../i18n';
import { COURSES } from '../data/courses';
import { MANAGE_SUBSCRIPTIONS_URL, purchases, usePro, type PlanId } from '../services/purchases';
import { haptic, openExternal } from '../services/native';
import { LEGAL_COMPANY } from '../data/legal';

/**
 * ODA Pro. An honest paywall: what Pro adds, what is always free, the trial
 * timeline before any charge, restore and Apple's renewal terms. Prices come
 * from the App Store; nothing here is a demo.
 */
export const Upgrade: React.FC = () => {
  const t = useT();
  const { setActiveRoute, showToast } = useApp();
  const pro = usePro();
  const [plan, setPlan] = useState<PlanId>('annual');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  useEffect(() => { void purchases.init(); }, []);
  useEffect(() => { if (pro.plans.length && !pro.plans.some(p => p.id === plan)) setPlan(pro.plans[0].id); }, [pro.plans, plan]);

  const lessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const selected = pro.plans.find(p => p.id === plan);
  const trial = selected?.trialDays ?? null;

  const buy = async () => {
    if (busy || !selected) return;
    setBusy('buy');
    const result = await purchases.purchase(selected.id);
    setBusy(null);
    if (result === 'purchased') { void haptic('success'); showToast(t('Welcome to ODA Pro.'), 'success'); }
    else if (result === 'failed') showToast(t('The purchase didn’t go through. You were not charged.'), 'error');
  };
  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    const ok = await purchases.restore();
    setBusy(null);
    showToast(ok ? t('ODA Pro restored.') : t('No active ODA Pro purchase was found for this Apple ID.'), ok ? 'success' : 'info');
  };

  const features = [
    { title: t('All courses.'), body: t('{courses} courses, {lessons} lessons, meditation and self-suggestion included.', { courses: COURSES.length, lessons }) },
    { title: t('The whole Sound Room.'), body: t('Every sound for calm, sleep, focus and breath.') },
    { title: t('Everything new.'), body: t('New courses and sounds as they arrive.') },
    { title: t('A quiet app, kept quiet.'), body: t('No ads and no data sales. Your subscription keeps it that way.') },
  ];

  const legal = (
    <p className="text-[12px] leading-relaxed text-center text-[var(--fg-muted)]">
      <button type="button" onClick={() => setActiveRoute('/terms')} className="underline underline-offset-2">{t('Terms of use')}</button>
      {' · '}
      <button type="button" onClick={() => setActiveRoute('/privacy')} className="underline underline-offset-2">{t('Privacy policy')}</button>
      {' · '}© {new Date().getFullYear()} {LEGAL_COMPANY}
    </p>
  );

  if (pro.isPro) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="oda-kicker text-[var(--brand-burgundy)]">ODA Pro</p>
          <h1 className="oda-display text-[36px] leading-tight">{t('Pro is on. Thank you.')}</h1>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            {pro.renewsAt ? t('Your plan renews or ends on {date}.', { date: formatDate(pro.renewsAt, { day: 'numeric', month: 'long', year: 'numeric' }) }) : t('Every course and sound is open to you.')}
          </p>
        </header>
        <ul className="border-y border-[var(--border)] divide-y divide-[var(--border)]">
          {features.map(f => <li key={f.title} className="py-3 text-[15px] leading-snug flex gap-3"><Check size={18} className="text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" /><span><span className="font-semibold">{f.title}</span> <span className="text-[var(--fg-muted)]">{f.body}</span></span></li>)}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveRoute('/app/courses')} className="h-12 px-5 rounded-[var(--radius-sm)] bg-[var(--forest)] text-[var(--on-forest)] font-semibold text-[15px]">{t('Open the courses')}</button>
          {pro.available && <button type="button" onClick={() => openExternal(MANAGE_SUBSCRIPTIONS_URL)} className="h-12 px-5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[15px] font-medium">{t('Manage subscription')}</button>}
        </div>
        {legal}
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-[560px]">
      {pro.available && (
        <div className="flex justify-end -mx-2 -mb-4">
          <button type="button" onClick={() => void restore()} disabled={busy !== null} className="min-h-11 px-2 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)] disabled:opacity-50">{busy === 'restore' ? t('Restoring…') : t('Restore purchases')}</button>
        </div>
      )}

      <header className="space-y-1">
        <p className="oda-kicker text-[var(--brand-burgundy)]">ODA Pro</p>
        <h1 className="oda-display text-[36px] sm:text-[42px] leading-[1.08]">{t('A little deeper, every day.')}</h1>
      </header>

      <ul className="border-y border-[var(--border)] divide-y divide-[var(--border)]">
        {features.map(f => <li key={f.title} className="py-3 text-[15px] leading-snug"><span className="font-semibold">{f.title}</span> <span className="text-[var(--fg-muted)]">{f.body}</span></li>)}
      </ul>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{t('Always free: today’s decision, the evidence tree, the notebook, the coach and your backup.')}</p>

      {!pro.available ? (
        <section className="oda-card rounded-[var(--radius-lg)] p-5 space-y-2">
          <p className="text-[15px] font-semibold">{t('ODA Pro comes with the iPhone app.')}</p>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{t('Here on the web every course and sound is open to you, free.')}</p>
          <button type="button" onClick={() => setActiveRoute('/app/courses')} className="min-h-11 text-[14px] font-semibold text-[var(--accent)] underline underline-offset-4">{t('Open the courses')}</button>
        </section>
      ) : !pro.ready ? (
        <div className="space-y-2" aria-busy="true" aria-label={t('Loading plans…')}>
          <div className="h-16 rounded-[14px] bg-[var(--bg-muted)] animate-pulse" />
          <div className="h-16 rounded-[14px] bg-[var(--bg-muted)] animate-pulse" />
        </div>
      ) : !pro.plans.length ? (
        <section className="oda-card rounded-[var(--radius-lg)] p-5 space-y-2" role="alert">
          <p className="text-[15px] font-semibold">{t('Plans couldn’t load.')}</p>
          <p className="text-[14px] text-[var(--fg-muted)]">{t('Check your connection and open this page again.')}</p>
        </section>
      ) : (
        <>
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
          <div role="radiogroup" aria-label={t('Plan')} className="space-y-2">
            {pro.plans.map(p => {
              const on = p.id === plan;
              return (
                <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => { setPlan(p.id); void haptic('select'); }}
                  className={`w-full min-h-16 px-4 py-2.5 rounded-[14px] bg-[var(--bg-elevated)] flex items-center gap-3 text-left ${on ? 'border-[1.5px] border-[var(--forest)] dark:border-[var(--accent)]' : 'border border-[var(--border)]'}`}>
                  <span aria-hidden="true" className={`w-5 h-5 rounded-full shrink-0 box-border ${on ? 'border-[6px] border-[var(--forest)] dark:border-[var(--accent)]' : 'border-[1.5px] border-[var(--border-strong)]'}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15.5px] font-semibold">{p.id === 'annual' ? t('Yearly') : t('Monthly')}</span>
                    <span className="block text-[13px] text-[var(--fg-muted)]">
                      {p.id === 'annual' ? t('{price} / year', { price: p.price }) : t('{price} / month', { price: p.price })}
                      {p.perMonth ? ` · ${t('about {price} a month', { price: p.perMonth })}` : ''}
                    </span>
                  </span>
                  {p.trialDays && <span className="shrink-0 text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded-full">{t('{n} days free', { n: p.trialDays })}</span>}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => void buy()} disabled={busy !== null || !selected} className="w-full h-[54px] rounded-[14px] bg-[var(--forest)] text-[var(--on-forest)] dark:bg-[var(--accent)] dark:text-[var(--on-accent)] font-semibold text-[16px] disabled:opacity-60">
            {busy === 'buy' ? t('One moment…') : trial ? t('Start {n} days free', { n: trial }) : t('Subscribe')}
          </button>
          <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">
            {trial && selected
              ? t('Free for {n} days, then {price} per {period}. ', { n: trial, price: selected.price, period: selected.id === 'annual' ? t('year') : t('month') })
              : ''}
            {t('Payment is charged to your Apple ID. The subscription renews automatically unless cancelled at least 24 hours before the end of the period; manage or cancel it any time in your Apple ID settings.')}
          </p>
        </>
      )}
      {legal}
    </div>
  );
};
