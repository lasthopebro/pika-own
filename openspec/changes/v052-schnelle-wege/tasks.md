# Tasks

## 1. Branch und Übergabe

- [x] 1.1 Vorher `git status`, `git branch --list`, `git worktree list`; Branch `agent/claude/v052-schnelle-wege` von `main` angelegt (Orca-Worktree), Draft-PR „v0.5.2 Schnelle Wege“
- [x] 1.2 Version in `manifest.json` und `package.json` auf 0.5.2, `CHANGELOG.md` ergänzt

## 2. Einfügen und Ablegen

- [x] 2.1 `urlsFromText(text)` (nur `http(s)`) mit Test in `test/quick.test.js`
- [x] 2.2 `paste`- und Drop-Handler auf dem Board, Ablage im gezeigten Ordner, Meldung mit Ordnername und „Rückgängig“
- [x] 2.3 „Alle Tabs als Ordner speichern“ in Kopf und Kontextmenü, mit Rückgängig
- [x] 2.4 Kontextmenü „In pika-own speichern“ meldet den Ordner per Benachrichtigung
- [x] 2.5 Ziehen auf Live-Ordner in der Leiste (`urlFromDrop` mit Test)
- [x] 2.6 „Als Tab-Gruppe öffnen“ (offene Tabs wiederverwenden, Name setzen, ohne API ausgeblendet)

## 3. Erinnern

- [x] 3.1 Timer-Zustand als Zeitstempel, Alarm `timer|<id>`, Benachrichtigung im Hintergrund, Alarme nach Neustart neu angelegt
- [x] 3.2 Pomodoro (einstellbar, Standard 25/5) mit `timerNext` und Test
- [x] 3.3 Neuer Tab übernimmt fremde Änderungen (`absorb` mit Test, Neuladen ohne offenen Dialog)

## 4. Sicherung

- [x] 4.1 `settings.backup.lastExport` beim Export, Hinweis nach 14 Tagen, „Später“ für 14 Tage
- [x] 4.2 Test für `backupNagDue`

## 5. Weitere Verbesserungen

- [x] 5.1 `permissions.onAdded/onRemoved` registriert die Leiste auf Webseiten neu
- [x] 5.2 Seitenleiste: Ansicht „Live-Ordner“ (senkrechte Leiste)

## 6. Prüfung

- [x] 6.1 `npm test` und `npm run lint` (0 Fehler)
- [x] 6.2 Chromium-E2E: Ziehen, Einfügen, Rückgängig, Tabs als Ordner, Tab-Gruppe, Pomodoro-Wechsel im Hintergrund, Hinweis, Seitenleiste, Neustart
- [x] 6.3 Review durch getrennten Prüfer-Agenten, Befunde 1 bis 7 behoben
- [x] 6.4 README, Draft-PR, `openspec validate v052-schnelle-wege`

## 7. Handprüfung (von Hand, nicht automatisiert)

- [ ] 7.1 Firefox: signierte XPI bleibt nach Neustart; Seitenleiste öffnet/schließt; Leiste auf Webseite; Seitenzugriff entziehen/erteilen; Ollama-Status; Erinnerung und Pomodoro melden sich; Tab-Gruppe (ab 139); zwei Neue Tabs speichern gleichzeitig ohne Datenverlust
- [ ] 7.2 Brave: entpackt laden; Seitenpanel mit Live-Ordnern; Leiste mit Shields „streng“; Ollama/CORS; `topSites` und Verlauf; Kontextmenü „Alle Tabs als Lesezeichen-Ordner“; Timer meldet sich nach 5 Minuten Ruhe; privates Fenster
