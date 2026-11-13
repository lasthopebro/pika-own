# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v03-fundament-board` von `feature/pika-own-v0.1` anlegen (bis PR #9 gemergt ist), ein Worktree über Orca, Draft-PR mit Titel „v0.3 Fundament und Board“
- [ ] 1.2 Austausch nur per Issue-/PR-Kommentar im Format `von -> an | TYP | Change | Status | nächste Aktion`

## 2. Fundament

- [ ] 2.1 `lib/bus.js`: `patch(path, op, value)` und `get()` über `runtime.sendMessage` mit Antwort
- [ ] 2.2 `background.js`: Warteschlange, Zustand pro Nachricht frisch laden, Patch anwenden, speichern; `fire()` und `syncReminders` auf dieselbe Warteschlange umstellen
- [ ] 2.3 `lib/store.js`: `migrate()` (rein, wiederholbar), Version 2, Sicherung vor Migration
- [ ] 2.4 Alle `save()`-Aufrufe in `newtab.js` und `sidebar.js` auf `bus.patch` umstellen
- [ ] 2.5 Unit-Tests: zwei gleichzeitige Patches, Migration v1 auf v2, doppelte Migration unverändert

## 3. Module aufteilen

- [ ] 3.1 `lib/board.js`, `lib/toolbar.js`, `lib/widgets.js`, `lib/sessions-ui.js` aus `newtab.js` herauslösen, Verhalten unverändert (E2E bleibt grün)
- [ ] 3.2 `newtab.js` auf Verdrahtung kürzen (unter 150 Zeilen)

## 4. Board wie das Vorbild

- [ ] 4.1 Werkzeugleiste mit allen Schaltern aus der Spezifikation, Suche mit Taste F
- [ ] 4.2 Getönte Spalten mit Emoji-Überschrift und Farbpunkt; verschachtelte Ordner, Drag-and-drop mit Zyklus-Schutz
- [ ] 4.3 Sortierung (Manuell, A–Z, Zuletzt) nur für die Anzeige
- [ ] 4.4 Workspace-Menü (wechseln, anlegen, umbenennen, löschen)
- [ ] 4.5 Sitzungs-Popover (Name mit Datum, Liste mit Alter und Tab-Anzahl, öffnen, löschen)
- [ ] 4.6 Widgets: Countdown, Zähler mit Ziel-Balken, Notiz/Checkliste, Foto-Widget (neben Uhr, Timer, Textbausteinen)

## 5. Freie Pro-Funktionen und Sicherung

- [ ] 5.1 Prüfen, dass kein Code eine Lizenz, ein Konto oder einen Schlüssel verlangt
- [ ] 5.2 Dateisicherung über `downloads` (Berechtigung im Manifest), Import aus Datei
- [ ] 5.3 Eigene Icons je Lesezeichen/Ordner (Emoji oder Bild) prüfen und ergänzen

## 6. Prüfung

- [ ] 6.1 `npm test` und `web-ext lint` ohne Fehler
- [ ] 6.2 Chromium-E2E erweitert um Gleichzeitigkeit, Migration, Toolbar, Popover, Widgets
- [ ] 6.3 Firefox: `web-ext run` mit Testprofil, Checkliste aus dem Issue von Hand abhaken
- [ ] 6.4 Screenshot des Boards gegen das Vorbild-Bild im Issue vergleichen
- [ ] 6.5 README aktualisieren, Draft-PR auf „Ready“ setzen
