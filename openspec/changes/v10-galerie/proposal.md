# Proposal

## Why

Die „Galerie“ ist heute nur ein Kachelraster aller Spalten (`.gallery` in `style.css`, Taste V). Bei vielen Ordnern verliert man den Faden: kein „wo bin ich“, kein Rückweg, keine Suche im Ordner. Das kostet Aufmerksamkeit und Klicks. Eine Vollbild-Ansicht mit Brotkrumen und Esc-geht-hoch macht Navigation vorhersagbar.

## What Changes

- **Galerie-Vollbild** (Taste V oder Kopf-Knopf): Startpunkt „Home“ (Lesezeichenleiste und Workspace-Ordner) als Kacheln; Klick auf einen Ordner geht hinein.
- **Brotkrumen** (Home › Ordner › Unterordner), jede Stufe klickbar; **Esc** geht eine Ebene hoch, von Home aus zurück zum Board.
- **Suche je Ordner:** Feld oben filtert die Kacheln des gezeigten Ordners (Titel, Adresse), mit Pfeiltasten und Enter.
- **Ordner-Sprung:** die vorhandene Palette (`/` + Name) springt auch in der Galerie in den Ordner.
- **Raster oder Liste** und **Dichte** (klein, mittel, groß) als Einstellung.
- **Seitenleiste mit Ordnern als Ablageziele:** Kachel auf einen Ordner links ziehen verschiebt das Lesezeichen (vorhandene Verschiebelogik).
- Gestrichen: Widgets in der Galerie-Seitenleiste (Widgets sind im Kopfbereich; doppelte Oberfläche, kein Klick gespart).

## Capabilities

### New Capabilities
- `gallery-view`: Galerie-Vollbild mit Navigation, Suche und Ablageziele.

### Modified Capabilities
<!-- keine -->

## Impact

- Code: `lib/gallery.js` (reine Navigation/Filter), `newtab.js` (Ansicht, Esc, Palette), `style.css`, `lib/store.js` (Einstellung `galleryMode`, `galleryDensity`).
- Berechtigungen: keine neuen. `docs/BERECHTIGUNGEN.md` unverändert.
- Voraussetzung: v0.8.0 (`main`). Unabhängig von v09, v11, v12. Version 0.10.0. Hinweis: `v03-fundament-und-board` 4.7 (Ansichten, Zentriert) bleibt davon getrennt.
