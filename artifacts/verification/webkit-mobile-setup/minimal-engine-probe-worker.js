self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(new Response('<!doctype html><h1>Engine synthetic offline response</h1>',{headers:{'Content-Type':'text/html'}})));
