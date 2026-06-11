# Handoff Report: `sw.js` Fixes

## 1. Observation
I reviewed `/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/sw.js` and observed the following:
- Line 30 executes `.then(self.skipWaiting())` instead of `.then(() => self.skipWaiting())` during the `install` event, which executes it immediately instead of returning a callback function.
- Line 47 calls `caches.match(event.request)`. There is no configuration option passed for `{ ignoreSearch: true }`, which means any query parameter like `/?source=pwa` won't match the cache entries.
- Line 52 contains `.catch(() => { // Fallback if needed, nothing specific requested here })` inside the fetch handler. Since the arrow function does not return a response, it effectively evaluates to `undefined`, breaking the PWA offline capability.
- The `sw.js` has no custom handling for external domain requests such as OpenStreetMap Leaflet tiles (`*.tile.openstreetmap.org/*`).

## 2. Logic Chain
- **Syntax Bug**: Fixing `.then(self.skipWaiting())` to `.then(() => self.skipWaiting())` ensures the promise chain successfully resolves the function signature without firing prematurely.
- **Fetch Logic**: Because many PWA manifest or browser triggers append query params (e.g. tracking sources) to the app URL, adding `{ ignoreSearch: true }` ensures that `/` or `/index.html` matches successfully from the main cache even if opened as `/index.html?source=pwa`.
- **Runtime OSM Caching**: Because map tiles are not predefined in the app repository, we cannot pre-cache them during the `install` event. We must intercept requests targeting the `tile.openstreetmap.org` domain, serve them from a specific map cache if available (Cache First), and if not, retrieve them from the network and dynamically place them into the cache (`cache.put()`) for future offline use.
- **Fetch Error Handling**: Returning `undefined` in a `.catch()` inside `respondWith()` causes a network error for the browser. A `.catch()` block should at minimum either `throw` the error, or return an offline fallback response (e.g., an empty response) so it handles failures gracefully.

## 3. Caveats
- Map tiles can consume significant storage. We are caching them without an eviction policy (e.g., max age or max items). This is sufficient to get offline mode working correctly for Iteration 2, but a full Workbox implementation might be preferred later for complex expiration strategies if storage limits are a concern.
- The default `fetch()` fallback uses `throw error` if the main network request fails, as there is no specific offline HTML page defined yet in the `PRECACHE_URLS`.
- The main cache version was bumped from `v1` to `v2` to ensure clients immediately receive the updated `PRECACHE_URLS` and structure when this fix is applied.

## 4. Conclusion
The current `sw.js` file needs to be rewritten to incorporate a dynamic map tile strategy, fix the syntactical errors in the install and fetch lifecycles, and ignore URL parameters to successfully serve cached files.

**Proposed Corrected `sw.js` Code:**

```javascript
const CACHE_NAME = 'casa-giufa-cache-v2';
const MAP_CACHE_NAME = 'casa-giufa-map-tiles-v1';
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
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== MAP_CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Dynamic caching for OSM Map Tiles (Cache First, then Network)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(MAP_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If offline and tile not cached, return empty response to prevent map breakage
          return new Response(''); 
        });
      })
    );
    return;
  }

  // 2. Default fetch behavior for HTML and static assets
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          // Properly throw error or handle fallback instead of returning undefined
          console.error('Fetch failed for:', event.request.url, error);
          throw error;
        });
      })
  );
});
```

## 5. Verification Method
- **Implementation check**: Replace the contents of `/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/sw.js` with the code above.
- **Browser validation**: 
  1. Open Chrome DevTools -> Application -> Service Workers, click "Update" and "Skip Waiting" to apply the new v2 cache.
  2. Visit the app via a URL with query params like `/?source=pwa` and verify it loads from cache.
  3. Browse to the map view, then go offline via Network tab, reload, and verify that the map tiles still render rather than showing a grey box.
