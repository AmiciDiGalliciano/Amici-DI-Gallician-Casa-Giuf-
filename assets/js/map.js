/** map.js - mappa Leaflet con tracce GPX reali e controllo distanza GPS */
document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined' || !window.GALLICIANO_ROUTES) return;
  const routes = window.GALLICIANO_ROUTES;
  const center = [38.0166, 15.8864];
  const map = L.map('map', { center, zoom: 13, zoomControl: true, scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map);

  const colors = ['#6F7D4E','#B89B5E','#A65F3D','#1F4E79','#8B6B4F','#9A6D38'];
  const makeIcon = (color = '#243D30', label = '•') => L.divIcon({
    html: `<div style="background:${color};color:white;border-radius:999px;min-width:34px;height:34px;padding:0 9px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.25);border:3px solid white;font-size:14px;font-weight:800;">${label}</div>`,
    className:'', iconSize:[34,34], iconAnchor:[17,17], popupAnchor:[0,-18]
  });
  const userIcon = () => makeIcon('#25D366','GPS');
  const startIcon = () => makeIcon('#243D30','PART');
  const endIcon = () => makeIcon('#B89B5E','ARR');

  const polylines = {};
  const routeBounds = [];
  let activeRouteId = null;
  routes.forEach((r, idx) => {
    const line = r.track || r.waypoints;
    if (!line || line.length < 2) return;
    const color = colors[idx % colors.length];
    polylines[r.id] = L.polyline(line, {color, weight:4, opacity:.82}).addTo(map)
      .bindTooltip(r.short_nome || r.nome, {sticky:true})
      .bindPopup(`<strong>${r.nome}</strong><br>${r.distanza} · ${r.durata}<br><em>${r.difficolta}</em><br><a href="${r.gpx_url}" download>GPX</a> · <a href="${r.kml_url}" download>KML Google</a> · <a href="${r.maps_start_url}" target="_blank" rel="noopener noreferrer">Raggiungi partenza da dove sei</a>`);
    routeBounds.push(polylines[r.id]);
    L.marker(r.coordinate_start, {icon:startIcon()}).addTo(map).bindPopup(`<strong>Partenza</strong><br>${r.nome}`);
    L.marker(r.coordinate_end, {icon:endIcon()}).addTo(map).bindPopup(`<strong>Arrivo</strong><br>${r.nome}`);
  });

  function meters(a,b){
    const R=6371000, toRad=d=>d*Math.PI/180;
    const lat1=toRad(a[0]), lat2=toRad(b[0]); const dLat=toRad(b[0]-a[0]), dLon=toRad(b[1]-a[1]);
    const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }
  function nearestPointDistance(point, track){
    let best = {dist: Infinity, index: 0};
    for (let i=0;i<track.length;i++) {
      const d = meters(point, track[i]);
      if (d < best.dist) best = {dist:d, index:i};
    }
    return best;
  }
  function formatDistance(m){ return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(2).replace('.', ',')} km`; }
  function activeRoute(){ return routes.find(r => r.id === activeRouteId) || null; }
  function bestRouteFor(point){
    let best = null;
    routes.forEach(r => {
      const n = nearestPointDistance(point, r.track || r.waypoints || []);
      if (!best || n.dist < best.dist) best = {route:r, ...n};
    });
    return best;
  }
  function updateStatus(point, accuracy){
    const statusEl = document.getElementById('map-status-message');
    if (!statusEl) return;
    const selected = activeRoute();
    const res = selected ? {route:selected, ...nearestPointDistance(point, selected.track || selected.waypoints)} : bestRouteFor(point);
    if (!res || !res.route) return;
    const totalPts = (res.route.track || res.route.waypoints).length;
    const progress = totalPts > 1 ? Math.round((res.index/(totalPts-1))*100) : 0;
    const warning = res.dist > 120 ? ' Sei abbastanza fuori traccia: fermati e ricontrolla, non fare l’eroe con il GPS scarico.' : ' Sei vicino alla traccia.';
    statusEl.innerHTML = `<strong>${res.route.short_nome || res.route.nome}</strong>: distanza dalla traccia ${formatDistance(res.dist)} · avanzamento indicativo ${progress}% · precisione GPS circa ${formatDistance(accuracy || 0)}.${warning}`;
  }
  function highlightRoute(routeKey){
    activeRouteId = routeKey;
    Object.entries(polylines).forEach(([key, poly], idx) => poly.setStyle(key === routeKey ? {weight:7, opacity:1, color:colors[idx % colors.length]} : {weight:2, opacity:.18}));
    if (polylines[routeKey]) { map.fitBounds(polylines[routeKey].getBounds(), {padding:[50,50]}); polylines[routeKey].openPopup(); }
  }
  function resetMapHighlight(){
    activeRouteId = null;
    Object.entries(polylines).forEach(([key, poly], idx) => poly.setStyle({weight:4, opacity:.82, color:colors[idx % colors.length]}));
    const group = L.featureGroup(Object.values(polylines));
    if (Object.values(polylines).length) map.fitBounds(group.getBounds(), {padding:[30,30]});
  }

  document.getElementById('btn-reset-map')?.addEventListener('click', resetMapHighlight);
  document.querySelectorAll('.show-on-map-btn').forEach(btn => btn.addEventListener('click', () => setTimeout(() => highlightRoute(btn.dataset.route), 250)));

  const geoBtn = document.getElementById('btn-geolocate');
  let watchId = null, userMarker = null;
  geoBtn?.addEventListener('click', () => {
    const statusEl = document.getElementById('map-status-message');
    if (!navigator.geolocation) { if(statusEl) statusEl.textContent='Il browser non supporta la posizione. Usa GPX/KML con un’app GPS.'; return; }
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId=null; geoBtn.textContent='Usa la mia posizione'; if(statusEl) statusEl.textContent='GPS fermato. Puoi selezionare un altro percorso o scaricare GPX/KML.'; return; }
    geoBtn.textContent = 'Ricerca posizione...'; if(statusEl) statusEl.textContent='Autorizza il GPS. Da file locale può funzionare meglio aprendo il sito da localhost o online HTTPS.';
    watchId = navigator.geolocation.watchPosition(pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      if (!userMarker) { userMarker = L.marker(coords, {icon:userIcon()}).addTo(map).bindPopup('La tua posizione GPS').openPopup(); }
      else userMarker.setLatLng(coords);
      map.setView(coords, Math.max(map.getZoom(), 15));
      geoBtn.textContent = 'Ferma posizione';
      updateStatus(coords, pos.coords.accuracy);
    }, err => {
      geoBtn.textContent='Usa la mia posizione';
      if(statusEl) statusEl.textContent='Posizione non disponibile: controlla permessi GPS, connessione o apri la mappa da HTTPS/localhost. Nel frattempo scarica GPX/KML.';
      if(watchId!==null) navigator.geolocation.clearWatch(watchId); watchId=null;
    }, {enableHighAccuracy:true, maximumAge:5000, timeout:10000});
  });

  resetMapHighlight();
  const params = new URLSearchParams(location.search);
  const requested = params.get('route');
  if (requested && polylines[requested]) highlightRoute(requested);
});
