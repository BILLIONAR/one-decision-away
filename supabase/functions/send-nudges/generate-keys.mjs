// Run from the repository root. Private material is written to an ignored .env file.
import { webcrypto, randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const keys = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const exported = {
  publicKey: await webcrypto.subtle.exportKey('jwk', keys.publicKey),
  privateKey: await webcrypto.subtle.exportKey('jwk', keys.privateKey),
};
const publicKey = Buffer.from(await webcrypto.subtle.exportKey('raw', keys.publicKey)).toString('base64url');
await writeFile('.env.push', `VAPID_KEYS_JSON=${JSON.stringify(exported)}\nPUSH_CRON_SECRET=${randomBytes(32).toString('hex')}\nVAPID_SUBJECT=mailto:REPLACE_WITH_YOUR_EMAIL\nPUSH_SITE_URL=https://billionar.github.io/one-decision-away/\n`, { mode: 0o600, flag: 'wx' });
console.log(`VITE_VAPID_PUBLIC_KEY=${publicKey}`);
console.log('Private credentials saved to ignored .env.push. Keep this file private and back it up securely.');
