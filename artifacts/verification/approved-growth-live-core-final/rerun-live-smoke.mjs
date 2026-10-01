// The saved cloud executor's Node APIRequestContext cannot resolve the public host.
// Keep every assertion and strict TLS setting; fetch the C4 bytes through the same
// WebKit page transport already used by the live UI. The workbook has a nested
// sources summary; select its own direct summary. No application code changes.
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const original = readFileSync('scripts/qa-webkit-live.mjs', 'utf8');
const from = 'const brand = await context.request.get(`${BASE}brand/oda-c4.png`);';
const to = `const brandData = await page.evaluate(async url => {
    const response = await fetch(url);
    return { url: response.url, status: response.status, bytes: Array.from(new Uint8Array(await response.arrayBuffer())) };
  }, \`\${BASE}brand/oda-c4.png\`);
  const brand = { url: () => brandData.url, status: () => brandData.status, body: async () => Buffer.from(brandData.bytes) };`;
if (!original.includes(from)) throw new Error('Original C4 assertion changed; inspect before adapting.');
const temporary = 'scripts/.qa-webkit-live-browser-transport.mjs';
const allowedFrom = "const allowed = read && url.protocol === 'https:' && (url.origin === ORIGIN || ['images.unsplash.com', 'plus.unsplash.com'].includes(url.hostname));";
const allowedTo = "const allowed = read && ((url.protocol === 'blob:' && url.origin === ORIGIN) || (url.protocol === 'https:' && (url.origin === ORIGIN || ['images.unsplash.com', 'plus.unsplash.com'].includes(url.hostname))));";
if (!original.includes(allowedFrom)) throw new Error('Original request guard changed.');
const source = original.replace(from, to).replace(allowedFrom, allowedTo).replace("workbook.locator('summary').tap()", "workbook.locator(':scope > summary').tap()").replace("checks: [], assets: [],", "transportAdapter: 'C4 byte fetch through WebKit page; workbook outer summary selected directly; same-origin local Blob exports allowed; all assertions and TLS settings retained', checks: [], assets: [],");
writeFileSync(temporary, source);
try {
  const result = spawnSync(process.execPath, ['--import', 'tsx', temporary], { env: process.env, stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { unlinkSync(temporary); }
