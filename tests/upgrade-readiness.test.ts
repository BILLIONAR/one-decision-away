import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Upgrade } from '../src/pages/Upgrade';
import { AppContext } from '../src/store/AppContext';
import { purchases, type PurchasesState, type TrialEligibility } from '../src/services/purchases';

const stateFor = (eligibility: TrialEligibility): PurchasesState => ({
  available: true, ready: true, tier: 'free', isPro: false, renewsAt: null, error: null, identityConfirmed: true, identityRevision: 1,
  products: { oda_pro_annual: { id: 'oda_pro_annual', tier: 'pro', plan: 'annual', price: '$49.99', amount: 49.99, perMonth: '$4.17', trialDays: 7, trialEligibility: eligibility } },
});

function render(state: PurchasesState): string {
  const previous = purchases.getState;
  purchases.getState = () => state;
  try {
    const context = { setActiveRoute: () => undefined, showToast: () => undefined } as unknown as React.ContextType<typeof AppContext>;
    return renderToStaticMarkup(React.createElement(AppContext.Provider, { value: context }, React.createElement(Upgrade)));
  } finally { purchases.getState = previous; }
}

test('rendered paywall claims a free trial only for confirmed eligibility', () => {
  const eligible = render(stateFor('eligible'));
  assert.match(eligible, /Start 7 days free/); assert.match(eligible, /7 days free/); assert.match(eligible, /On confirmation/);
  assert.doesNotMatch(eligible, /We remind you before the trial ends/);
  for (const eligibility of ['ineligible', 'unknown'] as const) {
    const html = render(stateFor(eligibility));
    assert.doesNotMatch(html, /Start 7 days free|7 days free|How the free trial works/);
    assert.match(html, /Subscribe to Pro/); assert.match(html, /\$49\.99/);
    assert.match(html, eligibility === 'unknown' ? /whether an introductory offer applies/ : /standard subscription price applies/);
  }
});

test('rendered failed offerings include an explicit retry action', () => {
  const html = render({ ...stateFor('unknown'), products: {}, error: 'unavailable' });
  assert.match(html, /Plans couldn’t load/); assert.match(html, /Try loading plans again/);
  assert.doesNotMatch(html, /Start 7 days free|You were not charged/);
});

test('web paywall keeps free access and does not offer a purchase CTA', () => {
  const html = render({ ...stateFor('unknown'), available: false, products: {} });
  assert.match(html, /Here on the web every course and sound is open to you, free/);
  assert.match(html, /Open the courses/);
  assert.doesNotMatch(html, /Subscribe to Pro|Start 7 days free|Try loading plans again/);
});

test('unconfirmed identity shows truthful verification retry and disables buy and restore even with cached prices', () => {
  const html = render({ ...stateFor('eligible'), identityConfirmed: false, error: 'identity-unconfirmed' });
  assert.match(html, /subscription for this account couldn’t be verified/);
  assert.match(html, /Retry account verification/);
  assert.doesNotMatch(html, /Start 7 days free|7 days free|How the free trial works/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Restore purchases<\/button>/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Subscribe to Pro<\/button>/);
});

test('pending identity verification does not render a trial or an enabled restore action', () => {
  const html = render({ ...stateFor('eligible'), ready: false, identityConfirmed: false });
  assert.match(html, /Checking the subscription for this account/);
  assert.doesNotMatch(html, /Start 7 days free|7 days free|How the free trial works/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Restore purchases<\/button>/);
});
