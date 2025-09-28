const CACHE_NAME = 'pelanggaran-v8';

// File statis yang akan di-cache
const urlsToCache = [
  '/pelanggaran-sekolah/',
  '/pelanggaran-sekolah/index.html',
  '/pelanggaran-sekolah/list.html',
  '/pelanggaran-sekolah/manifest.json',
  '/pelanggaran-sekolah/icons/spentrik-192.png',
  '/pelanggaran-sekolah/icons/spentrik-512.png',

  // Fonts dan dependencies eksternal
  "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs",
  "https://fonts.googleapis.com/css2?family=Anton&display=swap",
  "https://fonts.gstatic.com/s/anton/v25/1Ptqg8rHtHwzKjCrwA.woff2",

  // Firebase SDK
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
];

// Install SW → cache semua asset statis
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('⚠️ Beberapa resource gagal di-cache:', err);
      });
    })
  );
});

// Aktivasi SW → hapus cache lama
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

// Fetch handler → cari di cache dulu, kalau tidak ada ambil dari network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/pelanggaran-sekolah/index.html');
        }
      });
    })
  );
});
