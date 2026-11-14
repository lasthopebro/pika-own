# Tasks

Regeln wie in `v08-widgets`: höchstens 2 Dateien und etwa 80 Zeilen je Task, am Ende `npm test` und `npm run lint` grün plus der genannte Prüfbefehl. **[stark]** nur starkes Modell mit getrenntem Prüfer, **[günstig]** darf ein günstiges Modell allein. Voraussetzung: v0.8.0 auf `main`; Branch `agent/<anbieter>/v10-galerie` von `origin/main`, Draft-PR.

## 1. Reine Logik

- [x] 1.1 [günstig] `lib/gallery.js`: `crumbs(path, byId)`, `children(node)`, `filterChildren(nodes, q)`, `up(path)` plus `test/gallery.test.js` (Pfad mit gelöschtem Ordner bricht nicht, Filter ignoriert Groß/Klein, `up([])` ist `null`). Prüfen: `npm test`.

## 2. Ansicht

- [x] 2.1 [günstig] `newtab.js` + `style.css`: Galerie-Vollbild mit Home-Kacheln und Brotkrumen (`nav`, anklickbar), Klick auf Ordner geht hinein; Esc geht mit `up(path)` hoch, von Home zurück zum Board (Fokus kehrt auf die zuletzt geöffnete Kachel zurück); Taste V und Kopf-Knopf öffnen sie; die alte `.gallery`-Raster-Klasse im Board bleibt unverändert. Prüfen: Handprüfung in Chromium (hinein, Brotkrume zurück, Esc).
- [x] 2.2 [günstig] `newtab.js` + `style.css`: Suchfeld je Ordner mit `filterChildren`, Pfeiltasten/Enter; Palette-Treffer `/Name` setzt in der Galerie den Pfad. Prüfen: Handprüfung („git“ filtert, `/` springt).

## 3. Einstellungen

- [x] 3.1 [stark] `lib/store.js`: `settings.galleryMode` (`grid`), `settings.galleryDensity` (`m`) mit `merge` und Test in `test/store.test.js` (alte Stände). Prüfen: `npm test`.
- [x] 3.2 [günstig] `newtab.js` + `style.css`: Schalter Raster/Liste und Dichte in der Galerie-Leiste und in den Einstellungen (Abschnitt Board), über `update()`. Prüfen: Neu laden behält Wahl.

## 4. Ablageziele

- [x] 4.1 [günstig] `newtab.js`: Seitenleiste mit den Ordnern des Workspace; `drop` ruft `dropOn(parentId)` auf (keine neue Schreiblogik), Meldung mit Rückgängig. Prüfen: Handprüfung (Kachel ziehen, Rückgängig).

## 5. Abschluss

- [x] 5.1 [günstig] `tools/e2e/gallery.mjs` (V öffnet, Ordner hinein, Esc hoch, Filter, Raster/Liste nach Neuladen) und Eintrag in `tools/e2e/run.mjs`. Prüfen: `node tools/e2e-chromium.mjs <Ordner ohne Leerzeichen>`.
- [x] 5.2 [günstig] `README.md` (Galerie), `CHANGELOG.md` 0.10.0, Version in `manifest.json`/`package.json`, `docs/FUNKTIONSLISTE.md` (Zeile Galerie auf „vorhanden“). Prüfen: `npm run lint`, `node tools/check-permissions.mjs`, `openspec validate v10-galerie`.
- [x] 5.3 [stark] Review durch getrennten Prüfer (Tastatur, Screenreader-Namen); Befunde behoben.
- [ ] 5.4 Handprüfung Brave und Firefox, CI grün, PR auf „Ready“.

## Handprüfpunkte

- **Brave und Firefox:** V öffnet die Galerie; Brotkrumen, Esc hoch, Esc auf Home zurück zum Board; Suchfeld filtert; Liste/Raster und Dichte nach Neuladen erhalten; Kachel auf Seitenleisten-Ordner ziehen verschiebt (Lesezeichen im Browser-Manager prüfen) und Rückgängig stellt zurück.
- **Tastatur:** komplette Bedienung ohne Maus; Tab-Reihenfolge Suchfeld → Pfad → Kacheln.
- **Berechtigungen:** keine neue; `docs/BERECHTIGUNGEN.md` unverändert.
