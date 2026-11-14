# Tasks

> Ersetzt durch `v09-sicherung`, `v10-galerie`, `v11-erste-schritte`, `v12-kopieren-suchen`. Haken = bereits gebaut (Stand v0.8.0); Rest siehe Verweise.

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v06-paritaet-rest` von `agent/claude/v05-leiste-webseiten-ki` anlegen, Draft-PR „v0.6 Parität: Rest der Funktionsliste“, Basis: v0.5-Branch
- [ ] 1.2 `docs/FUNKTIONSLISTE.md` ist die Quelle; erledigte Zeilen dort von „v0.6“ auf „vorhanden“ setzen

## 2. Ansicht und Werkzeugleiste

- [ ] 2.1 `lib/gallery.js`: Home, Brotkrumen, „Zu Ordner springen“, Suche je Ordner, Raster/Liste, Dichte, Seitenleiste (-> `v10-galerie`)
- [ ] 2.2 `lib/toolbar-dock.js`: schwebend/oben/unten/aus, Erinnerungen, Sitzungen, Papierkorb (gestrichen: Kopf mit „Mehr“-Menü seit v0.6.0, kein Klick gespart)
- [x] 2.3 Angepinnte Links in Werkzeugleiste oder Kopf (bis 16 je Workspace, Namen/Icons/Auto) (`renderPinned` in `newtab.js`, vorhanden)

## 3. Kopieren, Einfügen, Tabs

- [ ] 3.1 `lib/clipboard-formats.js`: Klartext, Markdown, HTML, CSV, Baum; „Links kopieren“ (Markdown für einen Link und „Links kopieren“ seit v0.6.0/v0.5.2 vorhanden; Ordnerformate -> `v12-kopieren-suchen`)
- [x] 3.2 Strg+V und Hineinziehen von Links; Rückgängig-Meldung (`addLinks`, `paste`, `dropOn` in `newtab.js`, v0.5.2)
- [x] 3.3 „Offene Tabs als Ordner“ mit optionaler `tabs`-Berechtigung (`saveTabsFolder`, v0.5.2; `tabs` ist seither Pflicht-Berechtigung)
- [ ] 3.4 Popup: „Gespeichert in …“, „Alle Tabs speichern“, 8 neueste; Board über Popup öffnen (bleibt `v03-fundament-und-board` 4.8; „Gespeichert in …“ nur als Meldung des Kontextmenüs vorhanden)

## 4. Widgets und Benachrichtigungen

- [x] 4.1 Pomodoro im Timer-Widget (`widgets/timer.js`, `background.js`, v0.5.2)
- [x] 4.2 Foto-Widget (`widgets/photo.js`, `lib/photo.js`, v0.8.0): bis 6 Adressen, Einpassen/Füllen, Wechselzeit; Form, Position, lokale Bilder und Klick-Link gestrichen (Bilddaten würden Speicher und Sicherung aufblähen)
- [x] 4.3 Benachrichtigungen für Erinnerungen, Timer und Todo (`background.js` `notifications.create`, v0.5.2/v0.8.0; `alarms` und `notifications` sind Pflicht-Berechtigungen)

## 5. Sicherung

- [ ] 5.1 `lib/backup-folder.js`: Ordnerwahl (Chromium), Unterordner, Datei je Snapshot, Datei je Gerät, Zugriff erneuern (-> `v09-sicherung`)
- [ ] 5.2 Erinnerung an Kopie außerhalb des Profils (vorhanden: `backupNagDue`, `nagDays`, v0.5.2/v0.6.0; Staffel gestrichen); Karte „Sicherung wiederherstellen“ (-> `v09-sicherung`)

## 6. Einstellungen und Rest

- [ ] 6.1 Einstellungssuche (Taste /, vorhanden seit v0.6.0 in `lib/ui.js` `ask`), Berechtigungsseite und Zusatzordner „Leere Ordner“ (-> `v11-erste-schritte`)
- [ ] 6.2 `lib/tour.js`: Erste-Schritte-Tour, überspringbar und wiederholbar (-> `v11-erste-schritte`)
- [ ] 6.3 Sprachdateien: Deutsch und Englisch vollständig, weitere optional (weitere Sprachen gestrichen; DE/EN bleibt `v03-fundament-und-board` 4.14)

## 7. Prüfung

- [ ] 7.1 Unit-Tests für Formate, Link-Einfügen, Sicherungs-Erinnerungsplan (-> je in v09, v11, v12)
- [ ] 7.2 Chromium-E2E: Galerie, Einfügen, Popup; Firefox-Checkliste von Hand (-> je in den Ersatz-Changes)
- [ ] 7.3 README und Draft-PR aktualisieren, auf „Ready“ setzen (-> je in den Ersatz-Changes)
