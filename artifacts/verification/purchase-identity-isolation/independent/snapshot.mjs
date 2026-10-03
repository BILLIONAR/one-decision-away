import { build } from '/workspace/oda-purchase-identity-fix/node_modules/esbuild/lib/main.js';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const workspace = '/workspace/oda-purchase-identity-fix';
const out = '/workspace/scratch/oda-purchase-identity-review';
const mode = process.argv[2] ?? 'baseline';
mkdirSync(out, { recursive: true });
const source = mode === 'baseline'
  ? execFileSync('git', ['show', 'e72724f382501a1178d6cf21d01a437f755a40ed:src/services/purchases.ts'], { cwd: workspace, encoding: 'utf8' })
  : readFileSync(`${workspace}/src/services/purchases.ts`, 'utf8');
writeFileSync(`${out}/${mode}-purchases.ts`, source);
await build({
  stdin: { contents: source, resolveDir: `${workspace}/src/services`, sourcefile: 'purchases.ts', loader: 'ts' },
  outfile: `${out}/${mode}.mjs`, bundle: true, platform: 'node', format: 'esm',
  define: { 'import.meta.env': '{}' },
  plugins: [{ name: 'prevent-real-sdk', setup(b) {
    b.onResolve({ filter: /^react$|^\.\/native$|^@revenuecat\/purchases-capacitor$/ }, args => ({ path: args.path, namespace: 'mock' }));
    b.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents:
      args.path === 'react' ? 'export const useSyncExternalStore = () => { throw new Error("Hook unavailable in synthetic review"); };' :
      args.path === './native' ? 'export const isNative = () => false;' :
      'export const Purchases = new Proxy({}, { get() { throw new Error("Real RevenueCat SDK prohibited in synthetic review"); } });', loader: 'js' }));
  } }],
});
await build({ entryPoints: [`${workspace}/src/services/entitlements.ts`], outfile: `${out}/entitlements.mjs`, bundle: true, platform: 'node', format: 'esm' });
writeFileSync(`${out}/${mode}-source.json`, JSON.stringify({ mode, sourceSHA256: createHash('sha256').update(source).digest('hex'), commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' }).trim() }, null, 2) + '\n');
console.log(`Saved isolated ${mode} source with synthetic-only SDK dependencies.`);
