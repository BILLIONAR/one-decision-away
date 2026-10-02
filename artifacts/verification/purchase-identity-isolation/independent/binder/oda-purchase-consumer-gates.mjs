import fs from 'node:fs';
import crypto from 'node:crypto';
import { PurchasesService } from '/workspace/oda-purchase-identity-fix/src/services/purchases.ts';
import { isLessonLocked, isSoundLocked } from '/workspace/oda-purchase-identity-fix/src/services/entitlements.ts';
let sdkCalls = 0;
const cases = [];
for (const [name, native, key, expectedGate] of [
  ['configured-native', true, 'synthetic-public-key', true],
  ['web', false, 'synthetic-public-key', false],
  ['unconfigured-native', true, '', false],
]) {
  const service = new PurchasesService({ native: () => native, key: () => key, sdk: async () => { sdkCalls++; throw new Error('SDK prohibited in capability-only probe'); } });
  const before = service.getState();
  service.deferIdentity();
  const state = service.getState(), gates = { gating: state.available, tier: state.tier };
  const paidLessonLocked = isLessonLocked('procrastination', 2, gates), paidSoundLocked = isSoundLocked(2, gates);
  cases.push({ name, availableBeforeDefer: before.available, availableAfterDefer: state.available, identityConfirmed: state.identityConfirmed, tier: state.tier, paidLessonLocked, paidSoundLocked,
    passed: before.available === expectedGate && state.available === expectedGate && !state.identityConfirmed && state.tier === 'free' && paidLessonLocked === expectedGate && paidSoundLocked === expectedGate });
}
const files = ['src/services/purchases.ts', 'src/services/entitlements.ts', 'src/pages/Upgrade.tsx'];
console.log(JSON.stringify({ evidence: 'Actual service and entitlement predicates; synthetic native/key capability only; SDK loader prohibited.', sourceSha256: Object.fromEntries(files.map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(`/workspace/oda-purchase-identity-fix/${path}`)).digest('hex')])), sdkCalls, cases, failures: cases.filter(item => !item.passed).map(item => item.name) }, null, 2));
process.exitCode = cases.every(item => item.passed) && sdkCalls === 0 ? 0 : 1;
