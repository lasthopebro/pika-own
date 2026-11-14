# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v04-leiste-live-ordner` von `agent/claude/v03-fundament-board` anlegen, Draft-PR mit Titel „v0.4 Leiste und Live-Tab-Ordner“, Basis: v0.3-Branch
  - Prozessschritt, nicht am Code prüfbar
- [ ] 1.2 Voraussetzung: v0.3 Aufgaben 2.x (Bus, Warteschlange) sind fertig
  - Prozessschritt, nicht am Code prüfbar

## 2. Gemeinsame Leiste

- [x] 2.1 `lib/bar.js`: Rendern aus Datenobjekt, Überlauf „»“, Klick öffnet im aktuellen Tab, Mittelklick im neuen
- [x] 2.2 `lib/bus.js` und `background.js`: Nachrichten `getBar` (Schnellwahl, Lesezeichen) und `getTabs`
  - Stand: getTabs steckt in getBar (Feld tabs)
- [x] 2.3 Leiste im Neuen Tab oben einbauen; Seitenleiste auf `lib/bar.js` umstellen
- [x] 2.4 Schnellwahl-Unterseiten per Rechtsklick wie bisher; Ausblenden-Funktion bleibt

## 3. Live-Tab-Ordner

- [x] 3.1 `lib/folders.js`: Ordner anlegen, umbenennen, Symbol setzen, Tabs zuordnen (URL), „live“ per Abgleich
- [x] 3.2 Ziehen auf Ordner und Kontextmenü „In Ordner“
- [x] 3.3 Öffnen ohne Duplikat (vorhandenen Tab fokussieren)
- [ ] 3.4 Ordner als Sitzung speichern, Sitzung als Ordner öffnen
  - Stand: teils; Ordner als Sitzung speichern ja, Sitzung als Ordner öffnen nicht gebaut

## 4. Verlauf

- [ ] 4.1 `lib/dials.js` bleibt Quelle; Test mit echter Historie des laufenden Browsers
  - Stand: dials.js ist Quelle; Test mit echter Historie fehlt
- [x] 4.2 Prüfung, dass nichts aus `data/` im Commit landet (`git ls-files data` leer)

## 5. Prüfung

- [x] 5.1 Unit-Tests für `lib/folders.js` (Zuordnung, Schließen, Neustart-Simulation) und Überlauf-Logik
  - Stand: test/folders.test.js, test/bar.test.js
- [ ] 5.2 Chromium-E2E: Klick-Budget, 100 Einträge unter 200 ms, Ordner nach Neustart des Kontexts
  - Stand: teils (getBar unter 200 ms, Ordner nach Neustart); Klick-Budget nicht geprüft
- [ ] 5.3 Firefox mit `web-ext run` und Testprofil: gleiche Prüfungen, Checkliste im Issue
  - Stand: Handprüfung offen
- [x] 5.4 README und Draft-PR aktualisieren, auf „Ready“ setzen
