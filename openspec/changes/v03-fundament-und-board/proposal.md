# Proposal

## Why

Der gespeicherte Zustand (`storage.local`, Schlüssel `pika`) wird bei jedem `save()` komplett überschrieben und von mehreren Stellen gleichzeitig geschrieben (Hintergrund, Neuer Tab, Seitenleiste). Dabei gehen Änderungen verloren. `newtab.js` hat 642 Zeilen und trägt weitere Funktionen nicht. Das Board weicht außerdem vom gewünschten Pikamark-Vorbild ab (Werkzeugleiste, getönte Spalten, Workspace-Menü, Sitzungs-Popover, Widgets). Das Dev-Team (PM, Architekt, Entwickler, QA) ist sich einig: erst das Fundament, dann die Oberfläche.

## What Changes

- Einziger Schreiber: `background.js` serialisiert alle Änderungen über eine Warteschlange. Andere Seiten senden Patch-Nachrichten statt den ganzen Zustand zu speichern.
- Schema-Version 2 mit verlustfreier Migration von v1 und Sicherung davor.
- `newtab.js` wird in ES-Module aufgeteilt; `newtab.js` selbst bleibt nur Verdrahtung.
- Board-Parität zum Vorbild (eigener Code, kein Code, Name oder Material von Pikamark): Werkzeugleiste, getönte Spalten mit Emoji und Farbpunkt, verschachtelte Ordner, Workspace-Menü, Sitzungs-Popover, Widgets inklusive Foto-Widget.
- Alle Pro-Funktionen sind frei und ohne Lizenzprüfung. Sicherung zusätzlich als Datei im Download-Ordner (Unterordner `pika-own`).
- Keine Breaking Changes: vorhandene Daten werden migriert.

## Capabilities

### New Capabilities
- `state-store`: Einziger Schreiber, Patch-Nachrichten, Schema v2, Migration.
- `board-layout`: Werkzeugleiste, Spalten, Ordner, Workspaces, Sitzungs-Popover, Widgets, freie Pro-Funktionen, Dateisicherung.

### Modified Capabilities
<!-- keine: openspec/specs ist noch leer -->

## Impact

- `background.js`, `newtab.js`, `sidebar.js`, `lib/store.js`; neu `lib/bus.js`, `lib/board.js`, `lib/toolbar.js`, `lib/widgets.js`, `lib/sessions-ui.js`.
- `manifest.json`: Berechtigung `downloads`.
- Version: v0.3. Branch `agent/claude/v03-fundament-board`, PR als Draft.
