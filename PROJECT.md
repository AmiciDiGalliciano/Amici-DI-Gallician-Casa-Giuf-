# Project: Offline PWA & GPS Tracking

## Architecture
- `manifest.json` for PWA metadata.
- `sw.js` for caching static assets and Leaflet resources for offline access.
- `assets/js/map.js` handles Leaflet GPS integration using `navigator.geolocation.watchPosition()`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | PWA & GPS | Create sw.js, manifest.json, inject manifest links, modify map.js GPS logic | none | DONE |

## Interface Contracts
### PWA ↔ Cache
- Service Worker must precache all crucial assets (`/`, `.html` files, `assets/css/`, `assets/js/`, Leaflet CDN files).
- Leaflet map must work entirely offline.

### UI ↔ GPS
- `map.js`: "Avvia navigazione offline" button requests GPS permission, watches position, updates user marker on map.
