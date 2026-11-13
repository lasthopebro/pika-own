# Proposal

## Why

Der Kern des Produkts ist eine horizontale Leiste wie die Lesezeichenleiste, nur besser: Schnellwahl aus dem echten Verlauf, Lesezeichen und offene Tabs in eigenen Ordnern. Heute gibt es nur eine vertikale Seitenleiste mit Listen (Screenshot im Issue). Die Leiste darf nicht mehr Klicks kosten als die Standard-Lesezeichenleiste.

## What Changes

- Horizontale Leiste oben im Neuen Tab mit drei Zonen: Schnellwahl (Verlauf), Lesezeichen, Live-Tab-Ordner. Überlauf über ein „»“-Menü.
- Live-Tab-Ordner: benennbar, mit Symbol, zeigen offene Tabs, überleben Browser-Neustart und arbeiten mit Sitzungen zusammen.
- Schnellwahl nutzt den echten Verlauf des laufenden Browsers; Verlauf anderer Browser nur über den lokalen Seed-Import.
- Die Seitenleiste bleibt, zeigt aber dieselben Daten über das gemeinsame Modul `lib/bar.js`.

## Capabilities

### New Capabilities
- `quick-bar`: Horizontale Leiste mit Klick-Budget und Leistungsgrenze.
- `live-tab-folders`: Benennbare Ordner für offene Tabs mit Symbol, Neustart-fest, Sitzungs-kompatibel.
- `history-source`: Woher die Schnellwahl ihre Daten bekommt.

### Modified Capabilities
<!-- keine -->

## Impact

- Neu: `lib/bar.js` (Rendering ohne `B.*`-Aufrufe, geteilt), `lib/folders.js`; Nachrichten `getBar` und `getTabs` in `lib/bus.js`.
- Geändert: `newtab.js`, `sidebar.js`, `background.js`, `lib/store.js` (Feld `liveFolders`).
- Version: v0.4. Branch `agent/claude/v04-leiste-live-ordner`, aufbauend auf v0.3 (gestapelter PR ist in Ordnung).
