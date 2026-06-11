# Observation
- **`PROJECT.md` & `ORIGINAL_REQUEST.md`** define Milestone 1: updating the site to a PWA with offline capabilities (Service Worker, Web App Manifest) and implementing an offline GPS navigation feature on the Leaflet map without calling external servers.
- **`percorsi.html`**: The HTML currently includes a map container (`<div id="map">`) but lacks the specific "Avvia navigazione offline" button and a dedicated status message container (`<div id="map-status-message"></div>`).
- **`assets/js/map.js`**: 
  - Contains an `updateStatus(point, accuracy)` function designed to calculate distance to the track and show a status message via `map-status-message`.
  - Defines an `userIcon` for the GPS marker.
  - Currently, clicking `#btn-geolocate` opens an external Google Maps link instead of tracking the user's position locally.
- **`assets/js/routes.js`**: Contains the full track coordinates and waypoints for all routes as a JSON array (`window.GALLICIANO_ROUTES`).

# Logic Chain
1. **Caching Strategy**: 
   - Since `routes.js` contains all the coordinates, caching this file ensures route data is available offline.
   - For the Leaflet map to work offline, `sw.js` must precache `leaflet.js` and `leaflet.css`.
   - Map tiles (`*.tile.openstreetmap.org`) cannot be fully precached for the whole world. The strategy should be to dynamically cache tiles as they are requested (Runtime Caching with Cache-First strategy). Alternatively, to guarantee specific offline availability, an explicit tile prefetching logic for the route bounding boxes (zoom levels 13-16) can be added.
2. **UX and DOM Elements**:
   - `percorsi.html` needs a new button `<button id="btn-geolocate" class="btn btn-gold">Avvia navigazione offline</button>` and a `<div id="map-status-message"></div>` placed above the map container.
3. **GPS Logic**:
   - `map.js` must be modified. The current Google Maps redirect inside `btn-geolocate`'s click listener should be replaced with `navigator.geolocation.watchPosition`.
   - The watch callback should instantiate/update `L.marker` using `userIcon()`, call `map.setView()`, and trigger the existing `updateStatus(point, accuracy)` to inform the user.

# Caveats
- Relying purely on runtime caching for OpenStreetMap tiles means users must pan across the map while online to cache tiles. For a true offline experience, pre-fetching specific tile URLs for the Gallicianò bounding box might be necessary but could hit OSM usage limits if not handled carefully.
- GPS precision in the mountains (Aspromonte) can fluctuate; `watchPosition` should be configured with `enableHighAccuracy: true`.

# Conclusion
To achieve Milestone 1:
1. **Offline Map Caching**: Create `sw.js` to precache `percorsi.html`, CSS, JS (especially `routes.js`), and Leaflet CDN assets. Implement a Cache-First runtime strategy for `*.tile.openstreetmap.org/*`.
2. **UX Elements**: Insert `<button id="btn-geolocate" class="btn btn-gold" style="margin-bottom:1rem;">Avvia navigazione offline</button>` and `<div id="map-status-message" style="margin-bottom:1rem; padding:1rem; background:#fff; border-radius:8px;"></div>` in `percorsi.html` right before the `#map` div.
3. **GPS Navigation**: Rewrite the `#btn-geolocate` click handler in `map.js` to use `navigator.geolocation.watchPosition()`, updating the `userMarker` position on the map and invoking `updateStatus()`.

# Verification Method
1. Modify the files as proposed.
2. Serve the site locally (e.g., via `python -m http.server`).
3. Load `percorsi.html` in Chrome and verify the PWA is installable.
4. Click "Avvia navigazione offline" and confirm the browser prompts for location permission, a GPS marker appears on the map, and the status message updates.
5. Simulate Offline mode in Chrome DevTools (Network tab -> Offline), reload the page, and ensure the map, routes, and UI still load correctly.
