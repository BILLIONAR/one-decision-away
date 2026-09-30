import assert from 'node:assert/strict';
import test from 'node:test';
import { createRepository, getInitialDemoState } from '../src/services/repository';
import { ECONOMY_CONSTANTS } from '../src/services/economy';

test('concurrent retries of a kept daily decision record evidence and reward exactly once', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const saved = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
    removeItem: (key: string) => saved.delete(key),
  } });
  try {
    const repository = createRepository();
    const initial = getInitialDemoState();
    initial.missions = [{ id: 'one-repeat-check', userId: initial.profile.id, title: 'Open my outline', type: 'daily_quest', area: 'Work', difficulty: 'easy', estimatedMinutes: 2, isOneDecision: true, status: 'active', createdAt: new Date().toISOString() }];
    await repository.save(initial);
    const params = { missionId: 'one-repeat-check', method: 'self' as const, focusMinutes: 2 };
    const results = await Promise.all([repository.completeMission(params), createRepository().completeMission(params)]);
    assert.equal(results.reduce((total, item) => total + item.rewardAmount, 0), ECONOMY_CONSTANTS.ONE_DECISION_REWARD);
    const after = await repository.load();
    assert.equal(after.completions.filter(item => item.missionId === params.missionId).length, 1);
    assert.equal(after.missions[0].focusMinutesSpent, 2);
    assert.equal(after.transactions.filter(item => item.kind === 'one_decision_reward').length, 1);
    const retry = await repository.completeMission(params);
    assert.equal(retry.rewardAmount, 0);
    assert.equal((await repository.load()).completions.length, after.completions.length);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
