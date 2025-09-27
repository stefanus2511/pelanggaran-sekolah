const CACHE_NAME = 'pelanggaran-v2'; // Ubah versi cache jika ada update
const urlsToCache = [
  '/list.html',
  '/index.html',
  '/manifest.json',
  
  // Aset penting untuk tampilan offline
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  
  // Cache file font agar tampilan offline tidak berantakan
  'https://fonts.googleapis.com/css2?family=Anton&display=swap',
  'https://fonts.gstatic.com/s/anton/v25/1Ptqg8rHtHwzKjCrwA.woff2', 
  
  // Jika ada file CSS atau JS eksternal lain, tambahkan di sini
];

// Instalasi Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache terbuka. Aset disimpan.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Mengambil Aset dari Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika aset ada di cache, langsung kembalikan
        if (response) {
          return response;
        }
        // Jika tidak ada, ambil dari jaringan
        return fetch(event.request);
      })
  );
});

// Mengaktifkan Service Worker (membersihkan cache lama)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Hapus cache lama
          }
        })
      );
    })
  );
});
