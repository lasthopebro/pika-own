# Design

## Context

Zustand liegt in `storage.local` unter `pika` (`lib/store.js`: `load()` und `save()` ersetzen den ganzen Schlüssel). Schreiber heute: `newtab.js`, `sidebar.js`, `background.js` (`fire()`, `syncReminders`). Der Hintergrund läuft in Chromium als Service Worker (schläft), in Firefox als Event-Page. Siehe proposal.md für Motivation.

## Goals / Non-Goals

**Goals:**
- Kein Datenverlust bei gleichzeitigen Änderungen.
- Module, die sich einzeln testen und von Agenten getrennt bearbeiten lassen.
- Board sieht aus und bedient sich wie das Vorbild (Screenshot im Issue).

**Non-Goals:**
- Kein Build-Schritt, kein Framework.
- Keine Sync-Funktion zwischen Geräten.
- Leiste und Live-Tab-Ordner (v0.4), Leiste auf Webseiten (v0.5).

## Decisions

- **Single Writer im Hintergrund.** `lib/bus.js` bietet `patch(path, op, value)` per `runtime.sendMessage`; `background.js` hängt jede Nachricht in eine Promise-Warteschlange, lädt den Zustand frisch, wendet die Änderung an, speichert. Alternative (Sperre mit Versionsnummer in jeder Seite) verworfen: mehr Code in jedem Schreiber.
- **Lesen** per `storage.onChanged` plus `get`; der Hintergrund hält nichts im Speicher.
- **Schema v2:** Feld `v: 2`; `migrate(state)` ist rein und wiederholbar, vor dem ersten Lauf `makeBackup()`.
- **Moduleschnitt:** `lib/board.js` (Spalten, Ordner, Drag), `lib/toolbar.js`, `lib/widgets.js`, `lib/sessions-ui.js`; `newtab.js` nur Verdrahtung (Ziel unter 150 Zeilen).
- **Dateisicherung** über `downloads.download` mit Blob-URL (Unterordner `pika-own`); freie Ordnerwahl geht in Firefox nicht.
- **Sortierung** wirkt nur auf die Anzeige; die manuelle Reihenfolge bleibt gespeichert.

## Risks / Trade-offs

- Jede Änderung ist eine Nachricht: kleiner Mehraufwand, dafür kein Verlust. Messen: Änderung bis Anzeige unter 100 ms.
- Migration ist riskant für echte Daten: Sicherung davor ist Pflicht, Test mit der echten Seed-Datei.
- Firefox-Event-Page kann zwischen Nachrichten enden: deshalb kein Zustand im Speicher des Hintergrunds.
