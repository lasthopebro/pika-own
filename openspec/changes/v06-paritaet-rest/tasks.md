# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v06-paritaet-rest` von `agent/claude/v05-leiste-webseiten-ki` anlegen, Draft-PR „v0.6 Parität: Rest der Funktionsliste“, Basis: v0.5-Branch
- [ ] 1.2 `docs/FUNKTIONSLISTE.md` ist die Quelle; erledigte Zeilen dort von „v0.6“ auf „vorhanden“ setzen

## 2. Ansicht und Werkzeugleiste

- [ ] 2.1 `lib/gallery.js`: Home, Brotkrumen, „Zu Ordner springen“, Suche je Ordner, Raster/Liste, Dichte, Seitenleiste
- [ ] 2.2 `lib/toolbar-dock.js`: schwebend/oben/unten/aus, Erinnerungen, Sitzungen, Papierkorb
- [ ] 2.3 Angepinnte Links in Werkzeugleiste oder Kopf (bis 16 je Workspace, Namen/Icons/Auto)

## 3. Kopieren, Einfügen, Tabs

- [ ] 3.1 `lib/clipboard-formats.js`: Klartext, Markdown, HTML, CSV, Baum; „Links kopieren“
- [ ] 3.2 Strg+V und Hineinziehen von Links; Rückgängig-Meldung
- [ ] 3.3 „Offene Tabs als Ordner“ mit optionaler `tabs`-Berechtigung
- [ ] 3.4 Popup: „Gespeichert in …“, „Alle Tabs speichern“, 8 neueste; Board über Popup öffnen

## 4. Widgets und Benachrichtigungen

- [ ] 4.1 Pomodoro im Timer-Widget
- [ ] 4.2 Foto-Widget: bis 6 Bilder, Einpassen, Form, Position, Wechselzeit, Klick-Link; Bilder nicht in Sicherung
- [ ] 4.3 `lib/notify.js`: Erinnerungen und Timer als Systembenachrichtigung, optionale Berechtigungen, Funktion unsichtbar ohne API

## 5. Sicherung

- [ ] 5.1 `lib/backup-folder.js`: Ordnerwahl (Chromium), Unterordner, Datei je Snapshot, Datei je Gerät, Zugriff erneuern
- [ ] 5.2 Erinnerung an Kopie außerhalb des Profils; Karte „Sicherung wiederherstellen“

## 6. Einstellungen und Rest

- [ ] 6.1 Einstellungssuche (Taste /), Berechtigungsseite, Zusatzordner „Leere Ordner“
- [ ] 6.2 `lib/tour.js`: Erste-Schritte-Tour, überspringbar und wiederholbar
- [ ] 6.3 Sprachdateien: Deutsch und Englisch vollständig, weitere optional

## 7. Prüfung

- [ ] 7.1 Unit-Tests für Formate, Link-Einfügen, Sicherungs-Erinnerungsplan
- [ ] 7.2 Chromium-E2E: Galerie, Einfügen, Popup; Firefox-Checkliste von Hand
- [ ] 7.3 README und Draft-PR aktualisieren, auf „Ready“ setzen
