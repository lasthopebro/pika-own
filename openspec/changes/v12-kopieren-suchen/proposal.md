# Proposal

## Why

Zwei kleine Lücken kosten Klicks: Einen Ordner als Liste weiterzugeben (Chat, Notiz, Mail) geht nur Link für Link; und eine Suche ohne Treffer endet in der Sackgasse statt in der Websuche. Beides ist klein, hat aber im Alltag eines Nutzers, der viel zwischen Werkzeugen springt, echten Nutzen.

## What Changes

- **Ordner kopieren als …** (Ordner-Menü): Klartext (eine URL je Zeile), Markdown (`- [Titel](URL)`, Unterordner als Überschriften), HTML (`<ul>`), CSV (`Ordner,Titel,URL`), Baum (eingerückt). Dasselbe für eine Auswahl („Als Markdown“ neben dem vorhandenen „Links kopieren“).
- **„Im Web suchen“** als letzter Eintrag der Palette (und einziger bei null Treffern): öffnet die Suche in der Standardsuchmaschine des Browsers. Dafür eine **optionale** Berechtigung `search`, erst beim ersten Einsatz angefragt.
- **Gestrichen:** „Alle Treffer auf dem Board zeigen“ (Tag-Filter, Taste F und Ordner-Fokus decken das ab, mehr Zustand ohne Gewinn), „Kopie speichern“ und „Gespeichert in …“ im Popup (gehören zum Toolbar-Popup in `v03-fundament-und-board` 4.8, nicht hierher).

## Capabilities

### New Capabilities
- `copy-formats-and-web-search`: Kopierformate und Websuche aus der Palette.

### Modified Capabilities
<!-- keine -->

## Impact

- Code: `lib/clipboard-formats.js` (reine Formatfunktionen), `newtab.js` (Menü, Palette), `manifest.json` (`optional_permissions: ["search"]`), `docs/BERECHTIGUNGEN.md`.
- **Neue Berechtigung `search` (optional).** Eintrag in `docs/BERECHTIGUNGEN.md` (Wortlaut siehe tasks.md 3.1). Der Wächter `tools/check-permissions.mjs` verlangt ihn; Firefox kennt `search` ebenfalls.
- Datenschutz: der Suchtext geht nur an die vom Nutzer gewählte Standardsuchmaschine, nie an KI-Anbieter.
- Voraussetzung: v0.8.0 (`main`). Unabhängig von v09 bis v11. Version 0.12.0.
