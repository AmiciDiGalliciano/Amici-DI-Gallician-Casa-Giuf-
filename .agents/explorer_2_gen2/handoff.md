# Handoff Report

## Observation
I investigated `sw.js` and confirmed the issues reported:
1. Line 30: `.then(self.skipWaiting())` executes immediately instead of passing a function reference.
2. Line 45-57: The `fetch` handler does not account for `*.tile.openstreetmap.org/*` runtime caching.
3. Line 47: `caches.match(event.request)` does not use `{ ignoreSearch: true }`, which breaks caching when URLs have query strings.
4. Line 52-54: `fetch(event.request).catch(() => {})` suppresses errors and returns `undefined`, which breaks the promise chain. It also lacks a `cache.put()` call to dynamically cache responses.

## Logic Chain
1. To fix the installation phase, `self.skipWaiting()` must be wrapped in an arrow function so it's called after caching is complete.
2. For OSM Leaflet tiles, we need to intercept requests where the URL hostname includes `tile.openstreetmap.org`. We should apply a Cache-First strategy: serve from cache if available; otherwise, fetch from network, clone the response, store it via `cache.put()`, and return it.
3. For query parameters on HTML files causing cache misses, we can detect HTML requests (using `request.mode === 'navigate'` or `Accept` headers) and pass `{ ignoreSearch: true }` to `caches.match()`.
4. To fix the unhandled `.catch()` and missing dynamic caching, we need to add `.then()` to network fetches, clone the response, and use `cache.put()`. Errors in `.catch()` should be re-thrown or handled properly rather than returning `undefined`.

## Caveats
- Dynamically caching every unknown resource could eventually bloat the cache size. If storage limits become an issue, a cache cleanup mechanism or limits should be implemented in the future.
- Opaque responses (e.g., cross-origin requests without CORS) will consume more perceived storage quota.

## Conclusion
The `sw.js` file needs to be updated to implement runtime caching for map tiles, fix the `ignoreSearch` issue for HTML, properly handle fetch errors, and fix the `skipWaiting` promise chain.

### Proposed Exact Logic for `sw.js`

Replace the current `install` and `fetch` event listeners in `sw.js` with the following:

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// The activate event remains unchanged

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Runtime caching for OSM Leaflet tiles
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(error => {
          console.error('Tile fetch failed:', error);
          throw error;
        });
      })
    );
    return;
  }

  // 2. Default fetch handler for HTML and other assets
  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));
  const matchOptions = isHtml ? { ignoreSearch: true } : {};

  event.respondWith(
    caches.match(event.request, matchOptions)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Implement missing cache.put() for dynamic caching
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(error => {
          console.error('Fetch failed:', error);
          throw error; // Fixes .catch() returning undefined
        });
      })
  );
});
```

## Verification Method
To verify these changes:
1. Apply the proposed code to `sw.js`.
2. Open the application in Chrome Developer Tools, navigate to the Application tab, and clear the site data to register the new Service Worker.
3. Ensure the PWA installs correctly (verify that `skipWaiting` is successfully called).
4. Browse the app and view the map to trigger tile downloads. Check the Cache Storage in DevTools to ensure `tile.openstreetmap.org` assets are being saved.
5. Go offline (via Network tab) and verify the map still renders the cached tiles.
6. Append a query parameter to a cached HTML page (e.g., `/?foo=bar`) and verify it loads successfully offline instead of failing.
