const CACHE_NAME = 'pelanggaran-v5'; // Versi Cache Baru untuk memastikan update
const urlsToCache = [
  '/', // Penting untuk root domain
  '/list.html',
  '/index.html',
  '/manifest.json',
  
  // Aset Ikon (Pastikan nama file ini 100% sama dengan yang ada di folder /icons/)
  '/icons/spentik-192.png',
  '/icons/spentrik-512.png',
  
  // Dependencies Eksternal (Wajib di-cache agar fitur ekspor dan tampilan bekerja offline)
  "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs",
  "https://fonts.googleapis.com/css2?family=Anton&display=swap",
  "https://fonts.gstatic.com/s/anton/v25/1Ptqg8rHtHwzKjCrwA.woff2", 
  
  // Dependencies Firebase (PENTING! Ganti versi jika Anda menggunakan versi berbeda dari 10.12.2)
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
];

// 1. Instalasi Service Worker: Caching aset statis
self.addEventListener('install', (event) => {
  console.log('SW: Installing and caching static assets...');
  // Force Service Worker untuk menunggu hingga semua aset di-cache
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Mencoba cache semua URL, menangkap error jika beberapa URL eksternal gagal
        return cache.addAll(urlsToCache).catch((error) => {
            console.error('SW: Cache AddAll failed, some resources might not be available offline:', error);
        });
      })
  );
});

// 2. Mengaktifkan Service Worker: Membersihkan cache lama
self.addEventListener('activate', (event) => {
  console.log('SW: Activated and cleaning old caches...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Mengambil kontrol segera setelah aktivasi
  return self.clients.claim();
});

// 3. Mengambil Aset: Cache falling back to network
self.addEventListener('fetch', (event) => {
  // Hanya proses GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika aset ada di cache, langsung kembalikan
        if (response) {
          return response;
        }
        // Jika tidak di cache, fetch dari network
        return fetch(event.request);
      })
  );
});
