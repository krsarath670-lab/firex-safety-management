// FIREX Fire & Safety Service Management - Production Service Worker
// Version: 2026.09.29-prod
const CACHE_NAME = 'firex-safety-v2026-prod';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/letterhead.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install: Immediately skip waiting to ensure immediate adoption of latest version
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[FIREX SW] Precache notice:', err);
      });
    })
  );
});

// Activate: Immediately claim clients and purge all obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[FIREX SW] Purging obsolete cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strict Network-First Strategy with safe offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation / HTML requests: Network-First ALWAYS, fallback to cached index if completely offline
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // 2. API requests: Strictly network-only (with offline JSON fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, error: 'Offline - server unreachable' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Static Assets: Network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(event.request))
  );
});
