# Handoff Report: Milestone 1 PWA & GPS Strategy

### Observation
- **`PROJECT.md` & `ORIGINAL_REQUEST.md`**: Milestone 1 defines PWA caching for offline map use and GPS tracking. Requires modifications to `map.js`, HTML files, and the creation of `sw.js` and `manifest.json`.
- **`percorsi.html` (lines 236-248)**: Contains the map container `div#map` inside `section#sezione-mappa`. It lacks the "Avvia navigazione offline" button and the status text container referenced in JS (`map-status-message`).
- **`assets/js/map.js` (lines 58-68, 84-96)**: Contains route parsing, distance calculations (`nearestPointDistance`), and UI update stub (`updateStatus()`). Currently binds `btn-geolocate` to open Google Maps instead of tracking via the local offline Leaflet map.
- **`assets/js/main.js`**: Central script file, does not currently register a Service Worker.
- **Filesystem**: 9 main HTML files exist in the root directory that need to be linked to the manifest. `manifest.json` and `sw.js` are completely missing.

### Logic Chain
1. **PWA Architecture Setup**: To satisfy PWA installability and offline support, `manifest.json` must be created. All root `*.html` files need to link it (`<link rel="manifest" href="manifest.json">`).
2. **Service Worker Configuration**: `sw.js` needs to be created to intercept `fetch` requests and precache critical assets (root HTML files, `assets/css/*`, `assets/js/*`, images, and Leaflet CDN scripts/CSS). `assets/js/main.js` will be modified to register this `sw.js`.
3. **UI Updates (`percorsi.html`)**: The user needs a way to request GPS tracking. We must inject `<button id="btn-gps" class="btn btn-gold">Avvia navigazione offline</button>` and a status container `<div id="map-status-message"></div>` directly below the map header inside `section#sezione-mappa`.
4. **GPS Tracking Logic (`map.js`)**: The existing click event for `btn-geolocate` (which redirects to Google Maps) should be removed. We must attach a click listener to `btn-gps` that triggers `navigator.geolocation.watchPosition()`. The callback should create a Leaflet marker using the existing `userIcon()` function, update its lat/lon on each tick, and invoke the existing `updateStatus([lat, lon], accuracy)` function.

### Caveats
- No caveats found in the existing logic. However, the image `assets/img/casa giufa.png` has spaces; it is recommended to URI-encode it or use another icon in `manifest.json`.
- `navigator.geolocation.watchPosition` requires an HTTPS context or `localhost` to work properly in modern browsers. This should be kept in mind for local testing.

### Conclusion
**Actionable Steps:**
1. **Create `manifest.json`**: Define app metadata and point to app icons.
2. **Create `sw.js`**: Implement `install` (precache all), `activate` (cleanup old caches), and `fetch` (cache-first or stale-while-revalidate for local assets, network-first for others). Be sure to cache Leaflet CDN files.
3. **Modify `assets/js/main.js`**: Append `navigator.serviceWorker.register('sw.js')` inside the `DOMContentLoaded` block.
4. **Modify root `*.html`**: Inject `<link rel="manifest" href="manifest.json">` inside the `<head>` of all root HTML files.
5. **Modify `percorsi.html`**: Add the `btn-gps` button and `map-status-message` div above the `<div id="map">`.
6. **Modify `assets/js/map.js`**: Remove the `btn-geolocate` Google Maps redirect logic. Bind `btn-gps` to use `navigator.geolocation.watchPosition()`, track the user with a marker, pan the map on the first fix, and call `updateStatus()`.

### Verification Method
1. **Build and Test**: No build command needed (plain JS/HTML).
2. **PWA Check**: Serve via a local server (e.g., `python3 -m http.server`), open Chrome DevTools > Application tab. Verify `manifest.json` is loaded and `sw.js` is registered. Turn on "Offline" mode in Network tab and reload `percorsi.html`; the map and page should load without errors.
3. **GPS Check**: Click the "Avvia navigazione offline" button on `percorsi.html`. Ensure the browser asks for location permission. Grant it, and observe a marker appear on the map, alongside a status message showing distance to the nearest route.
