# Proposal

## Why

Seit v0.5.2 kann pika-own viel, wirkt aber noch wie ein Werkstattstand: Das Programmsymbol ist ein einfarbiger Kreis, der Kopf zeigt zehn gemischte Unicode-Zeichen, Menüs gehen nur mit der Maus, und manche Einstellungen gibt es nur im Code (`pagebar.quick`, Hinweis-Abstand). Für einen Nutzer mit ADHS zählen ein ruhiger, eindeutiger Kopf, wiedererkennbare Symbole und Tastenkürzel mehr als neue Funktionen.

## What Changes

- **Symbole:** eigenes Programmsymbol (Leiste mit Lesezeichen-Motiv, eigener Entwurf) in 16/32/48/128 px, auch als Symbol des Werkzeugleisten-Knopfs. Ein einheitlicher Satz Inline-SVG-Symbole für Kopf, Leiste und Menüs ersetzt die gemischten Unicode-Zeichen; jedes Symbol hat einen lesbaren Namen für Screenreader.
- **Kopf:** Häufiges bleibt sichtbar (Suche, Auswahl, Ansicht, Tabs speichern, KI, Einstellungen); Seltenes (Workspace anlegen/bearbeiten, Widget, Sitzungen) wandert in ein „Mehr“-Menü.
- **Menüs:** Alle Kontextmenüs (Board, Leiste) sind mit Tastatur bedienbar (Pfeile, Enter, Esc, Fokus zurück). Menüeinträge zeigen Symbol und Tastenkürzel. Neue Einträge im Lesezeichen-Menü: „In Live-Ordner legen ▸“, „Link kopieren“, „Als Markdown kopieren“, „In neuem Fenster öffnen“.
- **Browser-Kontextmenü:** ein Eintrag „pika-own“ mit Untermenü: Seite speichern, In Live-Ordner ▸ (eigene Ordner), Alle Tabs als Ordner, Alle Tabs als Sitzung.
- **Tastenkürzel:** `commands` im Manifest (Seite speichern, Seitenleiste öffnen, Leiste ein-/ausklappen), im Browser änderbar. `?` öffnet eine Übersicht aller Kürzel statt eines Toasts.
- **Einstellungen:** ein Dialog mit Abschnitten (Aussehen, Leiste, Schnellwahl, Board, Erinnerungen & Timer, Sicherung, KI, Datenschutz) und Suche über alle Optionen (Taste `/` im Dialog).
- **Neue Optionen:** Leiste im Neuen Tab an/aus; Anzahl Schnellwahl-Einträge in der Leiste; Links im Board im selben oder neuen Tab öffnen; Löschen bestätigen an/aus; Sicherungs-Hinweis an/aus und Abstand (7/14/30 Tage); Pomodoro-Standardlängen; Symbol-Auswahl für Live-Ordner als Emoji-Raster statt Texteingabe.

Nicht enthalten (bleibt in `v06-paritaet-rest`): Galerie-Vollbild, Werkzeugleisten-Dock, Foto-Widget, Sicherungsordner, Tour, weitere Sprachen. Die Einstellungssuche aus `v06-paritaet-rest` 6.1 wird hier umgesetzt und dort beim Umsetzen abgehakt.

## Capabilities

### New Capabilities
- `app-icons`: Programmsymbol und einheitlicher Symbolsatz der Oberfläche.
- `menus`: Kopf, Kontextmenüs im Board und in der Leiste, Browser-Kontextmenü, Tastenkürzel.
- `settings-options`: Einstellungsdialog mit Abschnitten und Suche sowie die neuen Optionen.

### Modified Capabilities
<!-- keine: openspec/specs/ ist leer -->

## Impact

- Code: `lib/icons.js` (neu, SVG-Symbole), `lib/ui.js` (`menu` mit Tastatur, Symbol und Kürzel; `ask` mit Abschnitten), `newtab.js` (Kopf, Menüs, Einstellungen, Kürzel-Hilfe), `lib/bar.js` (Symbole, Tastatur im Menü, Emoji-Raster), `background.js` (Kontextmenü-Untermenü, `commands`), `lib/store.js` (neue Einstellungen mit Standardwerten), `style.css`.
- Dateien: `icons/icon-16.png`, `-32`, `-48`, `-128` und `icons/icon.svg` (Quelle); `manifest.json` (`icons`, `action.default_icon`, `commands`).
- Berechtigungen: keine neuen.
- Datenschutz: unverändert. Symbole sind lokal, nichts wird nachgeladen.
- Version 0.6.0. Branch `agent/claude/v06-feinschliff` von `main` (v0.5.2).
