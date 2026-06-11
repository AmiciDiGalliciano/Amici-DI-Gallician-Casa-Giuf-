const fs = require('fs');

function testMapJs() {
    console.log("Mocking DOM and Leaflet for map.js testing...");
    const mockMap = { setView: () => {}, removeLayer: () => {}, fitBounds: () => {} };
    const mockPolyline = {
        addTo: () => mockPolyline, bindTooltip: () => mockPolyline,
        bindPopup: () => mockPolyline, setStyle: () => mockPolyline,
        getBounds: () => ({}), openPopup: () => mockPolyline
    };
    const mockMarker = { addTo: () => mockMarker, bindPopup: () => mockMarker, setLatLng: () => mockMarker };
    
    global.L = {
        map: () => mockMap, tileLayer: () => ({ addTo: () => {} }),
        divIcon: (opts) => opts, polyline: () => mockPolyline,
        marker: () => mockMarker, featureGroup: () => ({ getBounds: () => ({}) })
    };
    
    global.window = {
        GALLICIANO_ROUTES: [
            { id: "test-route", nome: "Test Route", track: [[38.0, 15.8], [38.1, 15.9]], coordinate_start: [38.0, 15.8], coordinate_end: [38.1, 15.9] }
        ]
    };
    
    let btnGeoClickCb = null;
    global.document = {
        addEventListener: (event, cb) => { if (event === 'DOMContentLoaded') cb(); },
        getElementById: (id) => {
            if (id === 'map') return {};
            if (id === 'btn-geolocate') return {
                addEventListener: (event, cb) => { if (event === 'click') btnGeoClickCb = cb; },
                classList: { remove: () => {}, add: () => {} }, textContent: ''
            };
            if (id === 'map-status-message') return { innerHTML: '' };
            return null;
        },
        querySelectorAll: () => []
    };
    
    let watchSuccess = null;
    global.navigator = {
        geolocation: {
            watchPosition: (success, error, opts) => { watchSuccess = success; return 1; },
            clearWatch: () => {}
        }
    };
    global.alert = () => {};
    global.location = { search: '' };
    global.URLSearchParams = class { get() { return null; } };

    try {
        const mapJsPath = '../../assets/js/map.js';
        const code = fs.readFileSync(mapJsPath, 'utf8');
        eval(code);
        
        console.log("1. Testing btn-geolocate click behavior...");
        btnGeoClickCb(); // Toggle on
        console.log("   -> Start geolocate clicked, no exceptions.");
        btnGeoClickCb(); // Toggle off
        console.log("   -> Stop geolocate clicked, no exceptions.");
        
        console.log("2. Testing updateStatus and userIcon behavior with coordinates...");
        btnGeoClickCb(); // Toggle on again
        // Provide mock coordinates which will trigger userIcon() and updateStatus(pt, accuracy)
        watchSuccess({ coords: { latitude: 38.05, longitude: 15.85, accuracy: 15 } });
        console.log("   -> updateStatus executed without breaking. userIcon executed without exceptions.");
        
        console.log("All tests PASSED.");
    } catch (err) {
        console.error("Test FAILED: ", err);
    }
}

testMapJs();
