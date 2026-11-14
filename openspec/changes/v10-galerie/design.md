# Design

## Entscheidungen

- **Zustand nur im Speicher:** `galleryPath` (Liste von Ordner-IDs, leer = Home). Kein Schreiben in `storage.local` beim Navigieren; gespeichert werden nur `galleryMode` (`grid|list`) und `galleryDensity` (`s|m|l`).
- **Reine Funktionen** in `lib/gallery.js`: `crumbs(path, byId)` → `[{ id, title }]`, `children(node)` (Ordner zuerst, dann Lesezeichen, Reihenfolge des Baums), `filterChildren(nodes, q)` (Teilstring, Groß/Klein egal), `up(path)` → neuer Pfad oder `null` bei Home (Esc verlässt dann die Galerie). Testbar ohne Browser.
- **Home** = `columnsFor(ws())` (gleiche Spalten wie das Board, auch virtuelle). Dadurch gilt Workspace-Auswahl, Verbergen und „Zuletzt hinzugefügt“ automatisch.
- **Esc-Reihenfolge** bleibt bestehend (Auswahl → Fokus → Tag-Filter), die Galerie hängt sich davor, wenn offen: Suchfeld leeren, sonst eine Ebene hoch, sonst Board.
- **Ordner-Sprung** nutzt die Palette (`/`-Präfix, `newtab.js` `focus = …`): in der Galerie setzt das Ergebnis `galleryPath` statt `focus`.
- **Ablageziele:** Seitenleiste listet Ordner des Workspace; `drop` ruft die bestehende `dropOn(parentId)`-Verschiebung. Keine neue Schreiblogik.
- **Barrierefreiheit:** Brotkrumen als `nav aria-label="Pfad"`, Kacheln sind Knöpfe/Links, Suchfeld mit Label, Pfeiltasten wie in `lib/ui.js` `menu()`.

## Arbeitsweise

Branch `agent/<anbieter>/v10-galerie` von `origin/main`, ein Worktree, ein PR. Verdrahtung nur in `newtab.js`, damit Konflikte mit v09/v11 klein bleiben (andere Funktionen, andere Zeilen; Merge-Reihenfolge egal, bei Konflikt später gemergter PR rebased).

## Risiken

- `newtab.js` hat 822 Zeilen und ist der Engpass für alle vier Pläne. Jede Verdrahtung bleibt klein (je Task höchstens 80 Zeilen), neue Logik liegt in `lib/`.
- Sehr große Ordner (tausende Kacheln): Raster ohne Virtualisierung kann ruckeln; Grenze: zuerst 300 Kacheln zeigen, „Mehr zeigen“ (`shortcut`-Kommentar im Code).
