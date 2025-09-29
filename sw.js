const CACHE_NAME = 'pelanggaran-v9';
const urlsToCache = [
  '/pelanggaran-sekolah/',
  '/pelanggaran-sekolah/index.html',
  '/pelanggaran-sekolah/list.html',
  '/pelanggaran-sekolah/manifest.json',
  '/pelanggaran-sekolah/icons/spentrik-192.png',
  '/pelanggaran-sekolah/icons/spentrik-512.png'
];

// Install SW → cache file lokal saja
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate SW → hapus cache lama
self.addEventListener('activate', (event) => {
  console.log('SW: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('SW: Hapus cache lama:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // kalau ada di cache → pakai cache
      if (response) return response;

      // kalau nggak ada → ambil dari network
      return fetch(event.request).catch(() => {
        // fallback ke index.html kalau offline
        if (event.request.destination === 'document') {
          return caches.match('/pelanggaran-sekolah/index.html');
        }
      });
    })
  );
});
