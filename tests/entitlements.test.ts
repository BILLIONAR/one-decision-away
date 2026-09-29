import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_MONTHLY_MESSAGES, ESSENTIAL_COURSES, FREE_LESSONS_PER_COURSE, TIER_ORDER, courseUnlockTier,
  isLessonLocked, isSoundLocked, tierAtLeast, type Tier,
} from '../src/services/entitlements';
import { ENTITLEMENT_IDS, PRODUCT_IDS, annualSavingPercent, describeProduct, productIdFor, resolveTier } from '../src/services/purchases';
import { COURSES } from '../src/data/courses';

const off = (tier: Tier) => ({ gating: false, tier });
const on = (tier: Tier) => ({ gating: true, tier });

test('levels are ordered free < essentials < pro < coach', () => {
  assert.deepEqual([...TIER_ORDER], ['free', 'essentials', 'pro', 'coach']);
  assert.equal(tierAtLeast('coach', 'pro'), true);
  assert.equal(tierAtLeast('pro', 'pro'), true);
  assert.equal(tierAtLeast('essentials', 'pro'), false);
  assert.equal(tierAtLeast('free', 'essentials'), false);
  assert.equal(tierAtLeast('free', 'free'), true);
});

test('coach message allowances follow the product spec', () => {
  assert.deepEqual(AI_MONTHLY_MESSAGES, { free: 30, essentials: 150, pro: 600, coach: 3000 });
});

test('essential courses exist, and Turning Day is not one of them (it is free for all)', () => {
  const ids = new Set(COURSES.map(c => c.id));
  assert.equal(ESSENTIAL_COURSES.size, 6);
  for (const id of ['procrastination', 'focus', 'sleep', 'calm', 'confidence', 'motivation']) {
    assert.ok(ESSENTIAL_COURSES.has(id), id);
    assert.ok(ids.has(id), `${id} is a real course`);
  }
  assert.ok(ids.has('turning-day'));
  assert.equal(COURSES.length, 18);
  assert.equal(courseUnlockTier('turning-day'), 'free');
  assert.equal(courseUnlockTier('focus'), 'essentials');
  assert.equal(courseUnlockTier('stoic'), 'pro');
});

test('nothing is locked where subscriptions cannot be bought (web), at any level', () => {
  for (const tier of TIER_ORDER) {
    for (const course of COURSES) course.lessons.forEach((_, i) => assert.equal(isLessonLocked(course.id, i, off(tier)), false));
    assert.equal(isSoundLocked(9, off(tier)), false);
  }
});

test('free level: Turning Day in full, first lessons of the rest, first sounds of each category', () => {
  assert.equal(isLessonLocked('turning-day', 5, on('free')), false);
  for (const id of ['focus', 'stoic']) {
    assert.equal(isLessonLocked(id, FREE_LESSONS_PER_COURSE - 1, on('free')), false);
    assert.equal(isLessonLocked(id, FREE_LESSONS_PER_COURSE, on('free')), true);
  }
  assert.equal(isSoundLocked(0, on('free')), false);
  assert.equal(isSoundLocked(1, on('free')), false);
  assert.equal(isSoundLocked(2, on('free')), true);
});

test('essentials opens the six core courses and the whole Sound Room, not the rest', () => {
  for (const id of ESSENTIAL_COURSES) {
    const course = COURSES.find(c => c.id === id)!;
    course.lessons.forEach((_, i) => assert.equal(isLessonLocked(id, i, on('essentials')), false, `${id}:${i}`));
  }
  for (const course of COURSES.filter(c => c.id !== 'turning-day' && !ESSENTIAL_COURSES.has(c.id))) {
    assert.equal(isLessonLocked(course.id, 0, on('essentials')), false);
    assert.equal(isLessonLocked(course.id, FREE_LESSONS_PER_COURSE, on('essentials')), true, course.id);
  }
  assert.equal(isSoundLocked(9, on('essentials')), false);
});

test('pro and coach open every lesson and sound', () => {
  for (const tier of ['pro', 'coach'] as const) {
    for (const course of COURSES) course.lessons.forEach((_, i) => assert.equal(isLessonLocked(course.id, i, on(tier)), false));
    assert.equal(isSoundLocked(9, on(tier)), false);
  }
});

test('six products: two per paid level, ids match the App Store spec', () => {
  assert.deepEqual([...PRODUCT_IDS].sort(), [
    'oda_coach_annual', 'oda_coach_monthly', 'oda_essentials_annual', 'oda_essentials_monthly', 'oda_pro_annual', 'oda_pro_monthly',
  ]);
  assert.equal(productIdFor('coach', 'annual'), 'oda_coach_annual');
  assert.deepEqual(describeProduct('oda_essentials_monthly'), { tier: 'essentials', plan: 'monthly' });
  assert.equal(describeProduct('oda_gold_monthly'), null);
  assert.deepEqual(ENTITLEMENT_IDS, { essentials: 'essentials', pro: 'pro', coach: 'coach' });
});

test('RevenueCat entitlements resolve to the highest active level', () => {
  const e = (d: string | null = null) => ({ expirationDate: d });
  assert.equal(resolveTier({}).tier, 'free');
  assert.equal(resolveTier({ unrelated: e() }).tier, 'free');
  assert.equal(resolveTier({ essentials: e() }).tier, 'essentials');
  assert.equal(resolveTier({ essentials: e(), pro: e() }).tier, 'pro');
  assert.equal(resolveTier({ pro: e('2027-01-01'), coach: e('2027-02-02'), essentials: e() }).tier, 'coach');
  assert.equal(resolveTier({ pro: e('2027-01-01'), coach: e('2027-02-02') }).renewsAt, '2027-02-02');
  assert.equal(resolveTier({ pro: undefined }).tier, 'free');
});

test('annual saving is computed from real prices only', () => {
  assert.equal(annualSavingPercent(7.99, 49.99), 48);
  assert.equal(annualSavingPercent(3.99, 29.99), 37);
  assert.equal(annualSavingPercent(14.99, 99.99), 44);
  assert.equal(annualSavingPercent(null, 49.99), null);
  assert.equal(annualSavingPercent(7.99, undefined), null);
  assert.equal(annualSavingPercent(4, 60), null);
});
