# Original User Request

## Initial Request — 2026-06-12T18:35:13Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Tradurre l'intero sito web statico "Casa Giufà" (9-10 file HTML) in Inglese e Greco Moderno, creando le rispettive sottocartelle `/en/` e `/el/`.

Working directory: /Users/iMac21/Downloads/amici-di-galliciano-casa-giufa-v23-github-pages
Integrity mode: development

## Requirements

### R1. Duplicazione e Traduzione
- Copiare tutti i file `.html` della root nelle nuove cartelle `/en/` e `/el/`.
- Tradurre i testi visibili e SEO (title, meta description) in Inglese (nella cartella `en`) e in Greco Moderno (nella cartella `el`), mantenendo intatta la struttura HTML originale e le classi CSS.

### R2. Aggiornamento Percorsi (Paths) e Link Interni
- Aggiornare tutti i percorsi degli asset (`assets/css/...`, `assets/img/...`) nei file duplicati in modo che puntino alla cartella padre (es. `../assets/css/...`).
- Aggiornare i link di navigazione interna in modo che rimangano all'interno della stessa lingua (es. da `/en/index.html` il link "Camere" deve puntare a `camere.html` che risiede nella cartella `en`).

## Acceptance Criteria

### Architettura e Navigazione
- [ ] Le cartelle `en` ed `el` contengono tutti i file HTML presenti nella root.
- [ ] Aprendo `en/index.html` il sito viene visualizzato in inglese senza errori CSS o immagini mancanti (i path usano `../`).
- [ ] I link del menu all'interno della cartella `en` puntano ai rispettivi file tradotti (non tornano alla root italiana).
