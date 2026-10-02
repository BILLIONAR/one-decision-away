import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from '/workspace/oda-purchase-identity-fix/node_modules/typescript/lib/typescript.js';
import { bindPurchaseIdentity } from '/workspace/oda-purchase-identity-fix/src/services/purchaseIdentityBinding.ts';

const path = '/workspace/oda-purchase-identity-fix/src/main.tsx';
const source = fs.readFileSync(path, 'utf8');
const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const native = ast.statements.find(node => ts.isIfStatement(node) && node.expression.getText(ast) === 'isNative()');
if (!native || !ts.isBlock(native.thenStatement)) throw new Error('Cannot find native startup block; manual review required');
const body = native.thenStatement.statements.map(node => node.getText(ast)).join('\n');
const code = ts.transpileModule(body.replaceAll('import.meta', '__meta').replace(/\bimport\s*\(/g, '__load('), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const flush = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };

async function scenario(initial, holdCloud) {
  const events = [], subscriptions = new Set(), hotDisposals = [];
  const cloudGate = deferred(), initGate = deferred();
  let id = initial, desired = 'not-announced', hydrated = false;
  const cloudSync = {
    getState: () => ({ session: id === null ? null : { user: { id } } }),
    isSessionReady: () => hydrated,
    subscribe: callback => { events.push({ action: 'subscribe' }); subscriptions.add(callback); return () => subscriptions.delete(callback); },
    init: async () => { events.push({ action: 'cloud-init' }); hydrated = true; },
  };
  const purchases = {
    deferIdentity: () => { desired = 'not-announced'; events.push({ action: 'defer' }); },
    identify: next => { desired = next; events.push({ action: 'identify', id: next }); return Promise.resolve(); },
    init: () => { events.push({ action: 'purchase-init', desired }); return initGate.promise; },
  };
  const sandbox = {
    nativeReady: async () => {}, watchNativeResume: () => () => {}, syncStatusBar: async () => {},
    __meta: { hot: { dispose: callback => hotDisposals.push(callback) } },
    window: { dispatchEvent() {} }, Event: class {},
    document: { documentElement: { getAttribute: () => 'light' } },
    console: { error() {}, warn() {} },
    __load: async specifier => {
      events.push({ action: 'import', specifier });
      if (specifier.endsWith('/purchases')) return { purchases };
      if (specifier.endsWith('/cloudSync')) { if (holdCloud) await cloudGate.promise; return { cloudSync }; }
      if (specifier.endsWith('/purchaseIdentityBinding')) return { bindPurchaseIdentity };
      throw new Error(`Unexpected dynamic import: ${specifier}`);
    },
  };
  vm.runInNewContext(code, sandbox, { timeout: 1000 });
  await flush();
  const initBeforeCloudImportResolved = holdCloud && events.some(event => event.action === 'purchase-init');
  cloudGate.resolve(); await flush();
  const firstInit = events.findIndex(event => event.action === 'purchase-init');
  const firstIdentity = events.findIndex(event => event.action === 'identify');
  const firstDesired = events.find(event => event.action === 'purchase-init')?.desired;
  const subscribedWhileInitHeld = subscriptions.size > 0;
  const emit = async next => { id = next; for (const callback of subscriptions) callback(cloudSync.getState()); await flush(); };
  await emit('synthetic-A'); await emit('synthetic-B'); await emit('synthetic-B'); await emit(null);
  const callsWhileInitHeld = events.filter(event => event.action === 'identify').map(event => event.id);
  initGate.resolve(); await flush();
  await emit('synthetic-A'); await emit('synthetic-A');
  const allIdentify = events.filter(event => event.action === 'identify').map(event => event.id);
  return {
    initial, holdCloud, initBeforeCloudImportResolved,
    identityAnnouncedBeforeInit: firstIdentity >= 0 && firstInit > firstIdentity && firstDesired === initial,
    subscribedWhileInitHeld,
    tracksRapidSwitchWhileInitHeld: callsWhileInitHeld.includes('synthetic-A') && callsWhileInitHeld.includes('synthetic-B') && callsWhileInitHeld.at(-1) === null,
    sameIdNotSuppressed: allIdentify.slice(-2).every(next => next === 'synthetic-A'),
    callsWhileInitHeld, allIdentify, events,
  };
}

const report = {
  sourcePath: path,
  sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  evidenceType: 'Actual native startup block executed with synthetic cloud and purchases objects in a VM; no app/provider imports, credentials or native SDK calls.',
  scenarios: [await scenario('synthetic-A', false), await scenario(null, false), await scenario('synthetic-A', true)],
};
report.failures = report.scenarios.flatMap((item, index) => {
  const failures = [];
  if (item.initBeforeCloudImportResolved) failures.push('purchases initialized before cloud module resolved');
  if (!item.identityAnnouncedBeforeInit) failures.push('desired cloud identity was not announced before purchases.init');
  if (!item.subscribedWhileInitHeld) failures.push('cloud subscription missing while purchases.init is pending');
  if (!item.tracksRapidSwitchWhileInitHeld) failures.push('rapid account transitions were missed while init pending');
  if (!item.sameIdNotSuppressed) failures.push('same-ID notification was suppressed');
  return failures.map(failure => ({ scenario: index, failure }));
});
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.failures.length ? 1 : 0;
