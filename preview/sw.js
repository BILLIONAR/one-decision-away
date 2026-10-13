/* One Decision Away: each deployment owns its own offline shell and caches. */
const BASE = new URL(self.registration.scope);
const CACHE_PREFIX = `oda:${encodeURIComponent(BASE.pathname)}:`;
const BUILD_ID = "build-1d39b910-9894-49a8-9391-4230cee5cc9d";
const SHELL_CACHE = `${CACHE_PREFIX}${BUILD_ID}`;
const MEDIA_CACHE = `${SHELL_CACHE}:media`;
const ART_CACHE = `${SHELL_CACHE}:art`;
const ART_CACHE_LIMIT = 300;
const ART_PATHS = ['assets/oda/art/lessons/', 'assets/oda/art/covers/', 'assets/oda/course-covers/', 'assets/oda/delivery/course-covers/', 'assets/oda/delivery/quotes/'];
const INDEX_URL = new URL('index.html', BASE).href;
const MANIFEST_URL = new URL('manifest.webmanifest', BASE).href;
const SHELL = ['', 'index.html', 'support.html', 'theme-init.js', 'intro.js', 'intro.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'brand/domino8/oda-mark-domino8-v1-256.png', 'brand/domino8/oda-app-domino8-v1-192.png', 'brand/domino8/oda-app-domino8-v1-512.png', 'brand/domino8/oda-app-domino8-v1-maskable-192.png', 'brand/domino8/oda-app-domino8-v1-maskable-512.png', 'brand/domino8/oda-apple-domino8-v1-180.png', 'brand/domino8/oda-favicon-domino8-v1-32.png'].map(path => new URL(path, BASE).href);
const inScope = url => url.origin === BASE.origin && url.pathname.startsWith(BASE.pathname);

// Serialize mutations so simultaneous image requests cannot race eviction.
let artWrites = Promise.resolve();
function saveArt(cache, request, response) {
  const write = artWrites.then(async () => {
    // Reinsert hits and refreshed images at the newest end of Cache.keys().
    await cache.delete(request);
    await cache.put(request, response);
    const keys = await cache.keys();
    for (const oldest of keys.slice(0, Math.max(0, keys.length - ART_CACHE_LIMIT))) await cache.delete(oldest);
  });
  artWrites = write.catch(() => undefined);
  return write;
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => {
      const obsoleteScopedCache = key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== MEDIA_CACHE && key !== ART_CACHE;
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
      // Standalone support/legal documents must never replace the app shell.
      const documentUrl = url.pathname.endsWith('.html') && url.href !== INDEX_URL ? url.href : INDEX_URL;
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          await cache.put(documentUrl, response.clone());
          return response;
        }
        return (await cache.match(documentUrl)) || response;
      } catch {
        return (await cache.match(documentUrl)) || Response.error();
      }
    })());
    return;
  }

  const coursePhoto = url.hostname === 'images.unsplash.com' && url.pathname.startsWith('/photo-');
  const artAsset = coursePhoto || (inScope(url)
    && ART_PATHS.some(path => url.pathname.startsWith(`${BASE.pathname}${path}`))
    && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname));
  if (artAsset) {
    const cache = caches.open(ART_CACHE);
    const cached = cache.then(store => store.match(request));
    const refresh = (async () => {
      const store = await cache;
      const hit = await cached;
      // Touch even offline hits so recently visited lessons survive eviction.
      if (hit) await saveArt(store, request, hit.clone()).catch(() => undefined);
      try {
        // Revalidate the HTTP cache as well as the service worker cache.
        const response = await fetch(request, { cache: 'no-cache' });
        if ((response.ok || response.type === 'opaque') && response.status !== 206) {
          await saveArt(store, request, response.clone()).catch(() => undefined);
        }
        return response;
      } catch { return undefined; }
    })();
    event.waitUntil(refresh.then(() => undefined));
    event.respondWith(cached.then(async hit => hit || (await refresh) || Response.error()));
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

  // The narration adapter owns its bounded, checksum-verified on-demand cache.
  const narrationAsset = inScope(url) && url.pathname.startsWith(`${BASE.pathname}assets/oda/narration/`);
  if ((inScope(url) && url.pathname.startsWith(`${BASE.pathname}assets/`) && !narrationAsset) || SHELL.includes(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      // Video range requests return 206, which Cache.put rejects. Stream them uncached.
      if (response.ok && response.status !== 206) await cache.put(request, response.clone());
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
    icon: new URL('brand/domino8/oda-app-domino8-v1-192.png', BASE).href,
    badge: new URL('brand/domino8/oda-app-domino8-v1-192.png', BASE).href,
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
