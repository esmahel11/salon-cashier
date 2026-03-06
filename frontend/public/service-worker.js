// Service Worker بۆ کارکردنی ئۆفلاین
const CACHE_NAME = 'salon-cashier-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// دامەزراندن
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache کرایەوە');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// چالاککردن
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache کۆنەکە سڕایەوە:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// وەرگرتنی داتا
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // ئەگەر لە cache دا هەبوو، بیگەڕێنەوە
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // ئەگەر وەڵامێکی دروست نەبوو، بیگەڕێنەوە
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // کۆپی بکە بۆ cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // ئەگەر ئۆفلاین بوو، پەڕەی ئۆفلاین پیشان بدە
          return caches.match('/index.html');
        });
      })
  );
});
