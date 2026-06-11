# Technical Strategy: Fixes for sw.js

## 1. Observation
- The `sw.js` file contains a syntax error in the `install` event listener at line 30: `.then(self.skipWaiting())` instead of `.then(() => self.skipWaiting())`.
- The `fetch` event listener at lines 47-56 fails to handle query parameters correctly, which breaks offline compatibility when query strings are appended to HTML paths.
- The `fetch` event listener lacks runtime caching for OSM leaflet map tiles (`*.tile.openstreetmap.org/*`).
- The `.catch()` block in the `fetch` event listener (line 52) swallows the error and returns `undefined`, which breaks the fetching process instead of explicitly propagating the error or returning an offline fallback.

## 2. Logic Chain
1. **Fixing the Install Event**: `self.skipWaiting()` is being called immediately because it is passed as a value rather than a callback to `.then()`. Changing it to `.then(() => self.skipWaiting())` resolves this.
2. **Ignoring Search Params for HTML**: When fetching from `caches.match()`, requests with query parameters (e.g., `/?utm_source=pwa`) will miss the cache if not configured. Using `{ ignoreSearch: true }` specifically for navigation/HTML requests ensures cache hits for the root or page paths regardless of URL parameters.
3. **Runtime Caching for Map Tiles**: Leaflet tiles from `tile.openstreetmap.org` are loaded dynamically depending on user interaction and map location. These cannot be precached, so they must be added to the cache during the `fetch` event (runtime caching) after successfully retrieving them from the network.
4. **Fixing Catch Block**: By throwing the error inside `.catch()`, or simply returning the network failure, the application will handle the offline status gracefully instead of crashing with an undefined response object.

## 3. Caveats
- Map tiles may consume significant storage over time if a user browses a large area. Since there is no cache-limiting logic currently implemented in the activate phase, older map tiles will stay in the cache until the cache name changes.
- Opaque responses (CORS) might be cached without visibility into their status, which is standard for map tiles but worth noting.

## 4. Conclusion
We must replace the `install` and `fetch` event listeners in `sw.js` to implement the fixes. 

**Proposed replacements for `/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages/sw.js`:**

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Fixed: added arrow function
  );
});
```

```javascript
self.addEventListener('fetch', event => {
  // Determine if the request is for an HTML document
  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));
  
  // Use ignoreSearch only for HTML requests to avoid breaking API query params (if any)
  const matchOptions = isHtml ? { ignoreSearch: true } : {};

  event.respondWith(
    caches.match(event.request, matchOptions)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Fetch from network if not in cache
        return fetch(event.request).then(networkResponse => {
          const url = new URL(event.request.url);
          
          // Runtime caching for OSM map tiles
          if (url.hostname.includes('tile.openstreetmap.org')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        }).catch(error => {
          console.error('Fetch failed:', error);
          // Explicitly throw the error instead of returning undefined
          throw error; 
        });
      })
  );
});
```

## 5. Verification Method
1. Replace the respective event listeners in `sw.js` with the snippets above.
2. Serve the app locally (e.g. `npx serve .`).
3. Open Chrome DevTools, go to Application -> Service Workers, check "Update on reload", and refresh the page.
4. Verify that the install completes successfully without immediate errors.
5. In Network tab, append a query parameter to the URL (e.g., `/?source=pwa`) while simulating Offline mode; verify the page still loads via service worker.
6. Browse the map while online, then switch to Offline mode and reload/pan the map; verify that previously viewed OSM map tiles load correctly from the cache.
