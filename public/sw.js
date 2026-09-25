/* One Decision Away — each deployment owns its own offline shell and caches. */
const BASE = new URL(self.registration.scope);
const CACHE_PREFIX = `oda:${encodeURIComponent(BASE.pathname)}:`;
const SHELL_CACHE = `${CACHE_PREFIX}v3`;
const MEDIA_CACHE = `${SHELL_CACHE}:media`;
const INDEX_URL = new URL('index.html', BASE).href;
const MANIFEST_URL = new URL('manifest.webmanifest', BASE).href;
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'brand/oda-c4.png', 'brand/v3/oda-app-v3-192.png', 'brand/v3/oda-app-v3-512.png', 'brand/v3/oda-app-v3-maskable-192.png', 'brand/v3/oda-app-v3-maskable-512.png', 'brand/v3/oda-apple-v3-180.png', 'brand/v3/oda-favicon-v3-32.png'].map(path => new URL(path, BASE).href);
const inScope = url => url.origin === BASE.origin && url.pathname.startsWith(BASE.pathname);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => {
      const obsoleteScopedCache = key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== MEDIA_CACHE;
      const legacyRootCache = BASE.pathname === '/' && (key === 'oda-v1' || key === 'oda-v1-media');
      return obsoleteScopedCache || legacyRootCache;
    }).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // A hash route never goes to the host. Root history deployments still use
  // the same network-first shell fallback, without caching a host's 404 page.
  if (request.mode === 'navigate' && inScope(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          await cache.put(INDEX_URL, response.clone());
          return response;
        }
        return (await cache.match(INDEX_URL)) || response;
      } catch {
        return (await cache.match(INDEX_URL)) || Response.error();
      }
    })());
    return;
  }

  // Installed app metadata must refresh even when a previous shell is cached.
  if (url.href === MANIFEST_URL) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) { await cache.put(request, response.clone()); return response; }
        return (await cache.match(request)) || response;
      } catch { return (await cache.match(request)) || Response.error(); }
    })());
    return;
  }

  if ((inScope(url) && url.pathname.startsWith(`${BASE.pathname}assets/`)) || SHELL.includes(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  const mediaHost = url.hostname === 'unsplash.com' || url.hostname.endsWith('.unsplash.com') || url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com';
  if (mediaHost) {
    const refresh = caches.open(MEDIA_CACHE).then(async cache => {
      try {
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
        return response;
      } catch { return undefined; }
    });
    event.waitUntil(refresh.then(() => undefined));
    event.respondWith(caches.open(MEDIA_CACHE).then(async cache => (await cache.match(request)) || (await refresh) || Response.error()));
  }
});

self.addEventListener('push', event => {
  // The browser invokes this event even when no ODA tab is open.
  // A deployed VAPID sender and an opted-in subscription are still required.
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Use a visible safe default. */ }
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 120) : 'ODA';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 2000) : 'Yeni sözün hazır. Bugün kendine küçük bir alan aç.';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: new URL('brand/v3/oda-app-v3-192.png', BASE).href,
    badge: new URL('brand/v3/oda-app-v3-192.png', BASE).href,
    tag: typeof payload.tag === 'string' ? payload.tag.slice(0, 120) : 'oda-daily-inspiration',
    data: { url: typeof payload.url === 'string' ? payload.url : '/app' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const defaultTarget = new URL(BASE.pathname === '/' ? 'app' : '#/app', BASE);
  const requested = event.notification.data?.url;
  let target = defaultTarget;
  if (typeof requested === 'string') {
    try {
      // Also handle notifications created by older versions before the base
      // path fix, which stored the canonical /app route directly.
      const candidate = BASE.pathname !== '/' && requested.startsWith('/app')
        ? new URL(`#${requested}`, BASE)
        : new URL(requested, BASE);
      if (inScope(candidate)) target = candidate;
    } catch { /* Keep the deployment-local home route. */ }
  }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    const client = clients.find(item => inScope(new URL(item.url)));
    if (client) {
      if ('navigate' in client) await client.navigate(target.href);
      return client.focus();
    }
    return self.clients.openWindow(target.href);
  }));
});
