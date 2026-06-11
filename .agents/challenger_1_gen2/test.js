const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const path = require("path");

const basePath = "/Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages";
const routesContent = fs.readFileSync(path.join(basePath, "assets/js/routes.js"), "utf-8");
const mapContent = fs.readFileSync(path.join(basePath, "assets/js/map.js"), "utf-8");

const html = `
<!DOCTYPE html>
<html>
<head>
  <div id="map"></div>
  <button id="btn-geolocate">Geo</button>
  <div id="map-status-message"></div>
</head>
<body></body>
</html>
`;

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;
const document = window.document;

// Mock Leaflet
window.L = {
  map: () => ({
    fitBounds: () => {},
    setView: () => {},
    removeLayer: () => {}
  }),
  tileLayer: () => ({ addTo: () => {} }),
  polyline: () => ({ addTo: () => ({ bindTooltip: () => ({ bindPopup: () => ({}) }) }), setStyle: () => {}, getBounds: () => {}, openPopup: () => {} }),
  marker: () => ({ addTo: () => ({ bindPopup: () => {} }), setLatLng: () => {} }),
  divIcon: (opts) => opts,
  featureGroup: () => ({ getBounds: () => {} })
};

// Mock geolocation
window.navigator.geolocation = {
  watchPosition: (success, error, opts) => {
    success({ coords: { latitude: 38.0166, longitude: 15.8864, accuracy: 10 } });
    return 123;
  },
  clearWatch: () => {}
};

try {
  // Load routes
  const script1 = document.createElement("script");
  script1.textContent = routesContent;
  document.head.appendChild(script1);

  // Load map
  const script2 = document.createElement("script");
  script2.textContent = mapContent;
  document.head.appendChild(script2);

  // Trigger DOMContentLoaded
  const event = document.createEvent("Event");
  event.initEvent("DOMContentLoaded", true, true);
  document.dispatchEvent(event);

  // Click the geolocate button
  const btn = document.getElementById("btn-geolocate");
  if (btn) {
    btn.click();
    console.log("Clicked geolocate. Status HTML:", document.getElementById("map-status-message").innerHTML);
    btn.click(); // Stop
    console.log("Stopped. Watch ID cleared.");
  } else {
    console.log("Button not found.");
  }
} catch (e) {
  console.error("EXCEPTION CAUGHT:", e);
  process.exit(1);
}
