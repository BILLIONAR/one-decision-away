import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SUPPORT, SUPPORT_EMAIL, SUPPORT_URL, supportEmailHref } from '../src/data/support';
import { renderSupportPage } from '../scripts/build-support';

test('public support is generated from the same localized help as the app', () => {
  const html = readFileSync('public/support.html', 'utf8');
  assert.equal(html, renderSupportPage());
  assert.ok(!html.includes('<script'), 'contact and help work without JavaScript');
  for (const locale of ['en', 'tr', 'es'] as const) {
    assert.ok(html.includes(`lang="${locale}"`));
    const ids = SUPPORT[locale].topics.map(topic => topic.id);
    assert.deepEqual(ids, ['backup', 'courses', 'reminders', 'purchases', 'account', 'care']);
    assert.ok(SUPPORT[locale].topics.every(topic => topic.paragraphs.length >= 2));
    assert.ok(html.includes(`legal/privacy.html#${locale}`));
    const email = new URL(supportEmailHref(locale));
    assert.equal(email.protocol, 'mailto:');
    assert.equal(email.pathname, SUPPORT_EMAIL);
    assert.equal(email.searchParams.get('subject'), SUPPORT[locale].subject);
    assert.equal([...email.searchParams.keys()].length, 1, 'email contains no user data');
  }
});

test('each store locale links to the shipped public support artifact', () => {
  for (const locale of ['en-US', 'tr', 'es-ES', 'es-MX']) {
    assert.equal(readFileSync(`store/metadata/${locale}/support_url.txt`, 'utf8').trim(), SUPPORT_URL);
  }
  assert.equal(new URL(SUPPORT_URL).pathname, '/one-decision-away/support.html');
});
