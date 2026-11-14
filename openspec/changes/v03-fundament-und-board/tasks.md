# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v03-fundament-board` von `feature/pika-own-v0.1` anlegen (bis PR #9 gemergt ist), ein Worktree über Orca, Draft-PR mit Titel „v0.3 Fundament und Board“
  - Prozessschritt, nicht am Code prüfbar
- [ ] 1.2 Austausch nur per Issue-/PR-Kommentar im Format `von -> an | TYP | Change | Status | nächste Aktion`
  - Prozessschritt, nicht am Code prüfbar

## 2. Fundament

- [ ] 2.1 `lib/bus.js`: `patch(path, op, value)` und `get()` über `runtime.sendMessage` mit Antwort
  - Stand: nicht gebaut, ersetzt durch store.update() (kein lib/bus.js)
- [x] 2.2 `background.js`: Warteschlange, Zustand pro Nachricht frisch laden, Patch anwenden, speichern; `fire()` und `syncReminders` auf dieselbe Warteschlange umstellen
  - Stand: gebaut in lib/store.js update() (Web Lock + Warteschlange, Zustand frisch geladen), nicht in background.js
- [x] 2.3 `lib/store.js`: `migrate()` (rein, wiederholbar), Version 2, Sicherung vor Migration
- [x] 2.4 Alle `save()`-Aufrufe in `newtab.js` und `sidebar.js` auf `bus.patch` umstellen
  - Stand: alle Schreiber nutzen store.update() statt bus.patch
- [x] 2.5 Unit-Tests: zwei gleichzeitige Patches, Migration v1 auf v2, doppelte Migration unverändert
  - Stand: test/store.test.js

## 3. Module aufteilen

- [ ] 3.1 `lib/board.js`, `lib/toolbar.js`, `lib/widgets.js`, `lib/sessions-ui.js` aus `newtab.js` herauslösen, Verhalten unverändert (E2E bleibt grün)
  - Stand: nicht gebaut; nur lib/board.js (reine Logik) und widgets/*.js existieren
- [ ] 3.2 `newtab.js` auf Verdrahtung kürzen (unter 150 Zeilen)
  - Stand: nicht gebaut, newtab.js hat über 800 Zeilen

## 4. Board wie das Vorbild

- [ ] 4.1 Werkzeugleiste mit allen Schaltern aus der Spezifikation, Suche mit Taste F
  - Stand: teils (Suche F, Auswahl S, Ansicht V); Filter- und Sortierschalter fehlen
- [ ] 4.2 Getönte Spalten mit Emoji-Überschrift und Farbpunkt; verschachtelte Ordner, Drag-and-drop mit Zyklus-Schutz
  - Stand: teils (Spalten mit Farbe, Unterordner); Zyklus-Schutz beim Ziehen nicht gefunden
- [ ] 4.3 Sortierung (Manuell, A–Z, Zuletzt) nur für die Anzeige
  - Stand: nicht gebaut
- [x] 4.4 Workspace-Menü (wechseln, anlegen, umbenennen, löschen)
  - Stand: Auswahl, anlegen, umbenennen, löschen im Kopf
- [x] 4.5 Sitzungs-Popover (Name mit Datum, Liste mit Alter und Tab-Anzahl, öffnen, löschen)
  - Stand: als Dialog statt Popover, Datum statt Alter
- [ ] 4.6 Widgets: Countdown, Zähler mit Ziel-Balken, Notiz/Checkliste (Taste N), Foto-Widget (neben Uhr, Timer, Textbausteinen)
  - Stand: teils (Countdown, Notiz, Todo, Fotorahmen); Zähler ohne Ziel-Balken, Taste N legt einen Workspace an
- [ ] 4.7 Ansichten Spalten, Galerie (Raster/Liste), Kompakte Zeilen, Zentriert mit großer Uhr; Taste V; Ansicht pro Workspace
  - Stand: teils (Board, Galerie, Kompakt); Zentriert mit großer Uhr fehlt, Ansicht nicht pro Workspace
- [ ] 4.8 Toolbar-Popup: Suche und „Diesen Tab speichern“ mit Ordnerauswahl
  - Stand: nicht gebaut (kein Toolbar-Popup); lebt in v06-paritaet-rest 3.4
- [x] 4.9 Papierkorb (7 Tage, höchstens 20 Einträge) und Rückgängig; Wiederherstellung bei fehlendem Elternordner in die Lesezeichenleiste
- [ ] 4.10 Dubletten-Finder mit „Je eines behalten“, Tags und Favoriten übernehmen, Rückgängig
  - Stand: teils (Finder, „Je eines behalten“ mit Papierkorb); Tags/Favoriten übernehmen fehlt
- [x] 4.11 Entdeckungs-Ordner „Zuletzt hinzugefügt“ und „Meistbesucht“ als Spalten
- [ ] 4.12 Auswahlmodus (S, Umschalt-Klick, Ziehen) mit Massenaktionen, „Alle öffnen“, „In Ordner verschieben“
  - Stand: teils (Auswahlmodus, Alle öffnen); „In Ordner verschieben“ fehlt
- [ ] 4.13 Aussehen: fünf Akzente plus frei, Schriftart Sans/Mono/Serif, Look pro Workspace
  - Stand: teils (Schriftart, freie Akzentfarbe); fünf Vorgaben und Look pro Workspace fehlen
- [ ] 4.14 Sprachen Deutsch und Englisch (Texte aus einer Datei, unabhängig von der Browsersprache)
  - Stand: nicht gebaut; lebt in v06-paritaet-rest 6.3
- [ ] 4.15 Prüfen, dass Deinstallation Lesezeichen unberührt lässt und ein Export der Zusatzdaten vorher möglich ist
  - Stand: nicht ausdrücklich geprüft oder dokumentiert

## 5. Freie Pro-Funktionen und Sicherung

- [x] 5.1 Prüfen, dass kein Code eine Lizenz, ein Konto oder einen Schlüssel verlangt
  - Stand: kein Lizenz-/Konto-Code gefunden
- [x] 5.2 Dateisicherung über `downloads` (Berechtigung im Manifest), Import aus Datei
  - Stand: Export/Import per Blob-Download und Dateiauswahl, ohne downloads-Berechtigung
- [x] 5.3 Eigene Icons je Lesezeichen/Ordner (Emoji oder Bild) prüfen und ergänzen

## 6. Prüfung

- [x] 6.1 `npm test` und `web-ext lint` ohne Fehler
- [ ] 6.2 Chromium-E2E erweitert um Gleichzeitigkeit, Migration, Toolbar, Popover, Widgets
  - Stand: teils (Gleichzeitigkeit, Widgets); Toolbar und Popover nicht vorhanden
- [ ] 6.3 Firefox: `web-ext run` mit Testprofil, Checkliste aus dem Issue von Hand abhaken
  - Stand: Handprüfung offen
- [ ] 6.4 Screenshot des Boards gegen das Vorbild-Bild im Issue vergleichen
  - Stand: Handprüfung offen
- [x] 6.5 README aktualisieren, Draft-PR auf „Ready“ setzen
