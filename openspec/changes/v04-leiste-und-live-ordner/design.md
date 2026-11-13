# Design

## Context

Die Schnellwahl gibt es als Leisten im Board (`renderBars` in `newtab.js`, `groupHistory` in `lib/logic.js`, `lib/dials.js`). Die Seitenleiste (`sidebar.js`) zeigt Listen. Sitzungen liegen in `lib/sessions.js`. Tab-IDs überleben keinen Neustart, der Hintergrund schläft zeitweise. Siehe proposal.md für Motivation.

## Goals / Non-Goals

**Goals:**
- Eine Zeichenlogik für Leiste im Neuen Tab, Seitenleiste und später Content-Script.
- Live-Tab-Ordner als eigene Daten, unabhängig von Tab-IDs.

**Non-Goals:**
- Leiste auf Webseiten (v0.5).
- Tab-Gruppen des Browsers (optionales Extra in v0.5).

## Decisions

- **`lib/bar.js`** rendert aus einem reinen Datenobjekt (`{dials, bookmarks, folders}`), ohne `B.*`. Der Hintergrund liefert die Daten über `getBar`; so nutzt v0.5 dasselbe Modul im Content-Script.
- **Live-Ordner-Modell:** `{id, name, icon, items:[{url,title}], windowKey?}` in `liveFolders`; „live“ ist nur ein Abgleich mit `tabs.query` nach URL, nicht gespeichert. Alternative (Tab-IDs speichern) verworfen: bricht beim Neustart.
- **Öffnen ohne Duplikat:** erst `tabs.query({url})`, sonst `tabs.create`.
- **Überlauf** per ResizeObserver und „»“-Menü statt Scrollleiste.
- **Verlauf:** `history.search` plus optionale `data/seed-dials.json` (nur lokal), wie bisher in `lib/dials.js`.

## Risks / Trade-offs

- URL-Abgleich kann bei Weiterleitungen daneben liegen: dann gilt der Eintrag als „gespeichert“, nie als Fehler.
- 100 Einträge in 200 ms: Rendern per DocumentFragment, Favicons nur aus dem Cache laden.
