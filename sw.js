const CACHE_NAME = 'casa-giufa-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/camere.html',
  '/contatti.html',
  '/guida.html',
  '/percorsi.html',
  '/privacy.html',
  '/rallentare.html',
  '/storia.html',
  '/trattoria.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/animations.js',
  '/assets/js/map.js',
  '/assets/js/routes.js',
  '/assets/js/lightbox.js',
  '/assets/js/nav-arrows.js',
  '/assets/img/casa giufà.png',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 2. Implement Runtime Caching for Tiles
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(err => {
          // 4. Fix Catch block
          throw err;
        });
      })
    );
    return;
  }

  // 3. Fix ignoreSearch and offline fallback
  const isNavigate = event.request.mode === 'navigate' || event.request.url.endsWith('.html');
  const matchOptions = isNavigate ? { ignoreSearch: true } : {};

  event.respondWith(
    caches.match(event.request, matchOptions).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(err => {
        // 4. Fix Catch block
        if (isNavigate) {
          return caches.match('/', { ignoreSearch: true }).then(fallback => {
            return fallback || Promise.reject(err);
          });
        }
        throw err;
      });
    })
  );
});
