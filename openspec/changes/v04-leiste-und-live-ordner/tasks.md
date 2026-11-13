# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v04-leiste-live-ordner` von `agent/claude/v03-fundament-board` anlegen, Draft-PR mit Titel „v0.4 Leiste und Live-Tab-Ordner“, Basis: v0.3-Branch
- [ ] 1.2 Voraussetzung: v0.3 Aufgaben 2.x (Bus, Warteschlange) sind fertig

## 2. Gemeinsame Leiste

- [ ] 2.1 `lib/bar.js`: Rendern aus Datenobjekt, Überlauf „»“, Klick öffnet im aktuellen Tab, Mittelklick im neuen
- [ ] 2.2 `lib/bus.js` und `background.js`: Nachrichten `getBar` (Schnellwahl, Lesezeichen) und `getTabs`
- [ ] 2.3 Leiste im Neuen Tab oben einbauen; Seitenleiste auf `lib/bar.js` umstellen
- [ ] 2.4 Schnellwahl-Unterseiten per Rechtsklick wie bisher; Ausblenden-Funktion bleibt

## 3. Live-Tab-Ordner

- [ ] 3.1 `lib/folders.js`: Ordner anlegen, umbenennen, Symbol setzen, Tabs zuordnen (URL), „live“ per Abgleich
- [ ] 3.2 Ziehen auf Ordner und Kontextmenü „In Ordner“
- [ ] 3.3 Öffnen ohne Duplikat (vorhandenen Tab fokussieren)
- [ ] 3.4 Ordner als Sitzung speichern, Sitzung als Ordner öffnen

## 4. Verlauf

- [ ] 4.1 `lib/dials.js` bleibt Quelle; Test mit echter Historie des laufenden Browsers
- [ ] 4.2 Prüfung, dass nichts aus `data/` im Commit landet (`git ls-files data` leer)

## 5. Prüfung

- [ ] 5.1 Unit-Tests für `lib/folders.js` (Zuordnung, Schließen, Neustart-Simulation) und Überlauf-Logik
- [ ] 5.2 Chromium-E2E: Klick-Budget, 100 Einträge unter 200 ms, Ordner nach Neustart des Kontexts
- [ ] 5.3 Firefox mit `web-ext run` und Testprofil: gleiche Prüfungen, Checkliste im Issue
- [ ] 5.4 README und Draft-PR aktualisieren, auf „Ready“ setzen
