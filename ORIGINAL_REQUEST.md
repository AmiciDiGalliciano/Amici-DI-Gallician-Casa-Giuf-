# Original User Request

## Initial Request — 2026-06-11T12:05:30Z

# Teamwork Project Prompt — Draft

**Descrizione:** Sviluppo di un sistema mappa offline (PWA/Javascript) integrato in `map.js` per permettere ai turisti di scaricare preventivamente i percorsi sul telefono e tracciare la propria posizione via GPS anche in totale assenza di rete cellulare a Gallicianò.

Working directory: /Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages
Integrity mode: development

## Requirements

### R1. Architettura Offline (PWA)
Il sito deve essere aggiornato con un Service Worker (`sw.js`) e un Web App Manifest (`manifest.json`) in modo che la mappa Leaflet, i file CSS/JS e le coordinate dei percorsi vengano messi in cache e siano accessibili offline.

### R2. Navigatore GPS Integrato
Modificare la mappa per includere un tracciamento della posizione GPS locale in tempo reale che indichi il percorso dal punto A al punto B, usando il GPS del dispositivo e confrontando la posizione del pallino utente con il tracciato.

## Acceptance Criteria

### Architettura
- [ ] Il sito passa i controlli base di "Installabilità" di Chrome/Safari (è una PWA valida).
- [ ] Staccando internet sul telefono (Modalità Aereo), aprendo la pagina `percorsi.html` la mappa e i percorsi si caricano correttamente dalla cache.
### GPS
- [ ] Cliccando "Avvia navigazione offline", il browser chiede il permesso al GPS e aggiorna la posizione sulla mappa Leaflet senza chiamare server esterni.
