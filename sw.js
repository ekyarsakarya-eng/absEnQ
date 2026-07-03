// Service Worker - DISABLED untuk troubleshooting
// File ini sengaja dikosongkan

const CACHE_NAME = 'absensi-absEnQ-v1;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Jangan intercept request apapun
self.addEventListener('fetch', event => {
  // Biarkan semua request langsung ke network
  return;
});
