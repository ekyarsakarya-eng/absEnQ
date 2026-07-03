const CACHE_NAME = 'absensi-blkt-v1';
const urlsToCache = [
  '/absensi-absEnQ/',
  '/absensi-absEnQ/app.js',
  '/absensi-absEnQ/icon-192.png',
  '/absensi-absEnQ/icon-512.png',
  '/absensi-absEnQ/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key!== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
