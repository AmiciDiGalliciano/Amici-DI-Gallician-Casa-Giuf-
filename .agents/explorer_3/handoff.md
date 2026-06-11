# Handoff Report: GPS Tracking Integration in map.js

## Observation
1. In `assets/js/map.js` (lines 84-96), the element `btn-geolocate` is bound to a click event that currently opens a Google Maps direction link using the selected route's start and end coordinates.
2. The user requested: "Cliccando 'Avvia navigazione offline', il browser chiede il permesso al GPS e aggiorna la posizione sulla mappa Leaflet senza chiamare server esterni."
3. In `assets/js/map.js` (lines 58-68), a function `updateStatus(point, accuracy)` already exists. It calculates the distance to the track using `nearestPointDistance` and updates the text of `document.getElementById('map-status-message')`.
4. In `assets/js/map.js` (line 15), a `userIcon()` function is already defined, returning a green marker divIcon labeled 'GPS'.
5. In `percorsi.html`, the map container `<div id="map"></div>` exists at line 246, but the UI elements `#btn-geolocate` and `#map-status-message` are currently missing from the DOM near the map section.

## Logic Chain
1. To meet the offline GPS tracking requirement, we must remove the Google Maps redirect in `map.js` and implement local GPS tracking using `navigator.geolocation.watchPosition()`.
2. The UI requires two new elements in `percorsi.html`: a button to start/stop the tracking (`#btn-geolocate`) and a status display area (`#map-status-message`) to show the output of the existing `updateStatus` function.
3. The tracking state needs to be maintained in `map.js` using variables for `watchId`, `userMarker`, and `accuracyCircle`.
4. When a new position is received, `userMarker` can be rendered using the existing `userIcon()`. The existing `updateStatus([lat, lng], accuracy)` function will handle the distance-to-route calculations and status UI updates automatically if passed the new coordinates.

## Caveats
- Map centering behavior: We should only pan the map to the user's location on the *first* GPS fix. If we pan on every position update, the user won't be able to manually explore the map while tracking is active.
- `percorsi.html` requires HTML edits to provide the `#btn-geolocate` button and `#map-status-message` container before the JS will work as expected.
- Permissions: We must handle GPS permission denied errors gracefully, alerting the user to enable location services.

## Conclusion
The technical strategy for integrating GPS into `map.js` is:
1. **HTML Updates:** Add `<button id="btn-geolocate">Avvia navigazione offline</button>` and `<div id="map-status-message"></div>` above or below the map container in `percorsi.html`.
2. **State Variables:** Define `let watchId = null;`, `let userMarker = null;`, and `let accuracyCircle = null;` at the top level of the `DOMContentLoaded` callback in `map.js`.
3. **Toggle Logic:** Modify the `btn-geolocate` click listener in `map.js`. If `watchId` exists, clear it via `navigator.geolocation.clearWatch(watchId)`, remove markers, and reset button text. If it doesn't exist, start `watchPosition()`.
4. **Rendering:** In the `watchPosition` success callback:
   - Create or update `userMarker` using the pre-existing `userIcon()`.
   - Create or update `accuracyCircle` with the location accuracy.
   - Call the pre-existing `updateStatus([lat, lng], accuracy)` to process the distance-to-route calculations and update the UI.
   - Pan the map to the user's position only if it's the first fix.

## Verification Method
1. Modify `percorsi.html` to add the missing elements.
2. Apply the described JS changes to `map.js`.
3. Serve the site locally and visit `percorsi.html`.
4. Click "Avvia navigazione offline", allow location permissions, and verify that a green 'GPS' dot appears on the map and the status message displays the distance to the route.
