// Nama cache (ubah versinya kalau update file)
const CACHE_NAME = 'pelanggaran-v6';

// File statis yang akan di-cache
const urlsToCache = [
  '/',
  '/index.html',
  '/list.html',
  '/manifest.json',
  '/icons/spentik-192.png',
  '/icons/spentrik-512.png',

  // Fonts dan dependencies eksternal
  "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs",
  "https://fonts.googleapis.com/css2?family=Anton&display=swap",
  "https://fonts.gstatic.com/s/anton/v25/1Ptqg8rHtHwzKjCrwA.woff2",

  // Firebase SDK (pastikan versinya sesuai dengan yang kamu pakai)
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

// Activate SW → hapus cache lama
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
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

// Fetch handler → ambil dari cache dulu, kalau gagal fetch dari network
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // ⚡ Untuk Firestore request, biarkan langsung ke network
  if (req.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(req).then((res) => {
      return (
        res ||
        fetch(req).catch(() => {
          // fallback kalau offline & tidak ada di cache
          if (req.mode === 'navigate') {
            return caches.match('/list.html');
          }
        })
      );
    })
  );
});
