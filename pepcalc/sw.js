const CACHE_NAME = 'pepcalc-v1';

const PRECACHE = [
  '/pepcalc/',
  '/pepcalc/assets/index.js',
  '/pepcalc/assets/index.css',
  '/pepcalc/manifest.json',
  '/pepcalc/icons/icon-192.png',
  '/pepcalc/icons/icon-512.png',
  '/pepcalc/icons/icon.svg',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: remove stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fall back to network and cache the response
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Only handle requests within our scope
  if (!event.request.url.includes('/pepcalc/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
