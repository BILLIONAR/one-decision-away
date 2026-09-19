import assert from 'node:assert/strict';
import test from 'node:test';
import { appRouteHref, publicAssetPath, readAppRoute } from '../src/utils/routing';

const locationFor = (href: string) => new URL(href, 'https://example.github.io');

test('root hosting retains history paths, including direct reloads', () => {
  for (const route of ['/', '/two-futures', '/app', '/app/notebook', '/app/settings']) {
    assert.equal(appRouteHref(route, '/'), route);
    assert.equal(readAppRoute(locationFor(route), '/'), route);
  }
  assert.equal(readAppRoute(locationFor('/app/settings#section'), '/'), '/app/settings');
});

test('project hosting keeps every navigation on the same static document', () => {
  for (const base of ['/one-decision-away/', '/another-project/', '/nested/project/']) {
    for (const route of ['/', '/two-futures', '/app', '/app/notebook', '/app/settings']) {
      const href = appRouteHref(route, base);
      const location = locationFor(href);
      assert.equal(location.pathname, base, 'server must receive the project index URL on reload');
      assert.equal(location.hash, `#${route}`);
      assert.equal(readAppRoute(location, base), route);
    }
  }
});

test('landing URLs and non-route fragments do not become unknown routes', () => {
  assert.equal(readAppRoute(locationFor('/one-decision-away/'), '/one-decision-away/'), '/');
  assert.equal(readAppRoute(locationFor('/one-decision-away/#access_token=example'), '/one-decision-away/'), '/');
  assert.equal(readAppRoute(locationFor('/one-decision-away/#/app/notebook?view=journal'), '/one-decision-away/'), '/app/notebook');
  assert.equal(appRouteHref('//other.example/path', '/repo/'), '/repo/#/');
});

test('back/forward hash entries resolve to canonical route IDs', () => {
  const base = '/repo/';
  const history = ['/app', '/app/notebook', '/app/settings'].map(route => locationFor(appRouteHref(route, base)));
  assert.equal(readAppRoute(history[1], base), '/app/notebook');
  assert.equal(readAppRoute(history[0], base), '/app');
  assert.equal(readAppRoute(history[2], base), '/app/settings');
});

test('icons and service worker URLs stay under their deployment base', () => {
  assert.equal(publicAssetPath('sw.js', '/'), '/sw.js');
  assert.equal(publicAssetPath('/icon-192.png', '/repo/'), '/repo/icon-192.png');
  assert.equal(publicAssetPath('manifest.webmanifest', '/repo'), '/repo/manifest.webmanifest');
});
