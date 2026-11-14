# Proposal

> **Ersetzt durch `v09-sicherung`, `v10-galerie`, und `v11-erste-schritte`** (v09 bis v11) (Stand v0.8.0). Bereits gebaut: Strg+V/Hineinziehen, Tabs als Ordner, Pomodoro, Benachrichtigungen, Foto-Widget (als Adressen), Einstellungssuche. Gestrichen: schwebende/angedockte Werkzeugleiste, weitere Sprachen. Gestrichen (Entscheidung): Kopierformate für Ordner, „Im Web suchen“, Toolbar-Popup. Dieser Change wird nicht mehr umgesetzt; Archivierung entscheidet der Planpfleger.

## Why

Der Funktionsvergleich mit der öffentlichen Beschreibung des Vorbilds (`docs/FUNKTIONSLISTE.md`) zeigt Funktionen, die nicht in v0.3 bis v0.5 passen, aber zum Nachbau gehören. Sie kommen gesammelt in v0.6, damit v0.3 klein genug bleibt, um gebaut und geprüft zu werden.

## What Changes

- Galerie-Vollbild mit Home, Brotkrumen, Ordner-Sprung, Suche je Ordner und Seitenleiste.
- Werkzeugleiste (schwebend, oben, unten, aus) und Anzeige der angepinnten Links.
- Kopierformate Markdown, HTML, CSV und Baum; „Links kopieren“; Links einfügen (Strg+V) und hineinziehen; „Offene Tabs als Ordner“; Popup-Ergänzungen („Gespeichert in …“, „Alle Tabs speichern“, 8 neueste); eigenen Neuen Tab behalten.
- Widgets vertiefen: Pomodoro, Foto-Rahmen mit bis zu 6 Bildern und Wechselzeiten.
- Systembenachrichtigungen für Erinnerungen und Timer (Chromium; Firefox nur, wenn möglich).
- Sicherungsordner mit Ordnerwahl auf Chromium, Datei je Gerät, Erinnerung an Sicherung, Karte „Sicherung wiederherstellen“.
- Einstellungen mit Suche, Berechtigungsseite, Erste-Schritte-Tour, weitere Sprachen (optional), Leere Ordner.
- Kein Lizenzschlüssel und keine Sperren: alles frei.

## Capabilities

### New Capabilities
- `board-parity-extras`: Restliche Funktionen aus dem Funktionsvergleich.

### Modified Capabilities
<!-- keine -->

## Impact

- Neue Module je Bereich (`lib/gallery.js`, `lib/toolbar-dock.js`, `lib/clipboard-formats.js`, `lib/notify.js`, `lib/backup-folder.js`, `lib/tour.js`, `lib/i18n/`).
- `manifest.json`: optionale Berechtigungen `tabs`, `tabGroups`, `notifications`, `alarms` (bei Nutzung angefragt).
- Version: v0.6. Branch `agent/claude/v06-paritaet-rest`, aufbauend auf v0.5 (gestapelt).
