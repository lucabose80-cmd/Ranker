const CACHE_NAME = 'ranking-game-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './theme-starwars.css',
  './theme-sith.css',
  './favicon.svg',
  './main.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event (Network first, falling back to cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
