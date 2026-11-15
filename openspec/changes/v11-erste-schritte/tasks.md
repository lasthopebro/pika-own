# Tasks

Regeln wie in `v08-widgets`: höchstens 2 Dateien und etwa 80 Zeilen je Task, am Ende `npm test` und `npm run lint` grün plus der genannte Prüfbefehl. **[stark]** nur starkes Modell mit getrenntem Prüfer, **[günstig]** darf ein günstiges Modell allein. Voraussetzung: v0.8.0 auf `main`; Branch `agent/<anbieter>/v11-erste-schritte` von `origin/main`, Draft-PR.

## 1. Tour

- [x] 1.1 [günstig] `lib/tour.js`: `STEPS` (5 Schritte mit Selektor, Titel, Satz) und `next(i, steps, exists)` plus `test/tour.test.js` (fehlendes Ziel wird übersprungen, Ende liefert `null`, kein Schritt → sofort `null`). Prüfen: `npm test`.
- [x] 1.2 [günstig] `newtab.js` + `style.css`: Overlay mit Hervorhebung, „Weiter“, „Überspringen“, Esc; automatisch beim ersten Start (`settings.tourDone` fehlt), setzt den Merker über `update()`; Palette-Eintrag „Tour“ und Zeile in der `?`-Übersicht. Prüfen: Handprüfung (neues Profil: Tour erscheint; Esc: kommt nicht wieder; Palette: wieder da).

## 2. Berechtigungsseite

- [x] 2.1 [günstig] `lib/perms-info.js` (Name → ein Satz Klartext, alle Einträge aus `docs/BERECHTIGUNGEN.md`) plus `test/perms-info.test.js`, das Manifest und Tabelle gegen die Klartexte prüft. Prüfen: `npm test`.
- [x] 2.2 [stark] `newtab.js` Einstellungen → Datenschutz: Liste aus `runtime.getManifest()` + `permissions.getAll()` mit Klartext und Status; optionale mit „Widerrufen“ (`permissions.remove`, Fehler als Meldung), Pflicht-Berechtigungen ohne Knopf; nach Widerruf Leiste auf Webseiten sauber entfernt. Prüfen: Handprüfung in Chromium und Firefox, `node tools/check-permissions.mjs`.

## 3. Leere Ordner

- [x] 3.1 [günstig] `lib/folders.js`: `emptyFolders(tree)` (rekursiv leer, Wurzeln nie) plus Test in `test/folders.test.js` (verschachtelt leer, Ordner mit nur einem Lesezeichen nicht). Prüfen: `npm test`.
- [x] 3.2 [günstig] `newtab.js`: Einstellung „Spalte Leere Ordner“ (`settings.emptyCol`), virtuelle Spalte in `columnsFor`, Knopf „Alle aufräumen“ mit Anzahl-Rückfrage über `trashNodes` und Rückgängig. Prüfen: Handprüfung (3 leere Ordner anlegen, aufräumen, Rückgängig).

## 4. Abschluss

- [x] 4.1 [günstig] `tools/e2e/tour.mjs` (Tour beim ersten Start, Esc, nicht wieder; Leere Ordner aufräumen und zurück) und Eintrag in `tools/e2e/run.mjs`. Prüfen: `node tools/e2e-chromium.mjs <Ordner ohne Leerzeichen>`.
- [x] 4.2 [günstig] `README.md`, `CHANGELOG.md` 0.11.0, Version in `manifest.json`/`package.json`, `docs/FUNKTIONSLISTE.md` (Zeilen Tour, Berechtigungen, Leere Ordner auf „vorhanden“, Sprachen: „entfällt außer DE/EN in v03“). Prüfen: `npm run lint`, `openspec validate v11-erste-schritte`.
- [x] 4.3 [stark] Review durch getrennten Prüfer (Berechtigungsseite, Löschen leerer Ordner): 5 Befunde behoben und getestet. Offen: CI grün, PR auf „Ready“, Handprüfung.

## Handprüfpunkte

- **Firefox und Brave:** frisches Profil → Tour erscheint, Esc beendet, nächster Neuer Tab ohne Tour; Palette „Tour“ startet neu; Schritt mit fehlendem Ziel (z. B. Auswahl in Galerie) wird übersprungen.
- **Berechtigungsseite:** Liste entspricht `about:addons`/`chrome://extensions`; Webseiten-Berechtigung widerrufen → Leiste weg, neu erteilen im Einstellungsdialog möglich.
- **Leere Ordner:** nur echte leere Ordner gelistet; Papierkorb zeigt sie; Rückgängig stellt sie wieder her.
- **Berechtigungen:** keine neue; `docs/BERECHTIGUNGEN.md` unverändert (Wächter grün).
