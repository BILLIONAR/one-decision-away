import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { QUOTE_COLLECTION } from '../src/data/quoteCollection';
assert.equal(QUOTE_COLLECTION.length, 600);
const snapshot = QUOTE_COLLECTION.map(({ id, text, tr, source, sourceTr, kind }) => ({ id, text, tr, source, sourceTr, kind }));
writeFileSync(new URL('../supabase/functions/send-nudges/quotes.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
console.log('Exported 600 matching client/server passages.');
