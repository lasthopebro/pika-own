# Proposal

## Why

Geht das Browserprofil verloren (Neuinstallation, Rechnerwechsel, Profilfehler), sind Board-Zustand und die 7 Sicherungen in `storage.local` weg. Heute hilft nur der manuelle Datei-Export samt Hinweis nach 14 Tagen (v0.5.2). Für einen Nutzer mit ADHS ist „einmal einrichten, danach läuft es“ der größte Schutz vor Datenverlust und kostet im Alltag null Klicks.

## What Changes

- **Sicherungsordner (nur Chromium/Brave):** Einstellungen → Sicherung → „Ordner wählen“. Der Neue Tab schreibt dort höchstens eine Datei je Tag (`pika-<gerät>-<JJJJMMTT>.json`), behält die neuesten 5 je Gerät. Gerätename änderbar. Nach einem Browserneustart fragt Chromium den Zugriff erneut ab: Hinweis „Zugriff erneuern“ mit einem Klick.
- **Karte „Sicherung wiederherstellen“** bei leerem Profil (kaum Lesezeichen, noch nie benutzt): Datei aus dem Sicherungsordner (Chromium) oder per Dateiwahl (alle Browser); nutzt das vorhandene `restore()`.
- Firefox: Ordnerwahl unsichtbar (kein `showDirectoryPicker`), der Datei-Export und die Hinweise bleiben.
- Der bestehende Hinweis auf eine Sicherungsdatei schweigt, solange der Ordner täglich beschrieben wird.
- Gestrichen: Staffel „1, 7, 14, dann alle 30 Tage“ (die Option `nagDays` genügt), „Wiederherstellen von anderem Gerät“ als eigene Oberfläche (die Dateiliste zeigt alle Geräte, das reicht).

## Capabilities

### New Capabilities
- `backup-folder`: Sicherungsordner mit Ordnerwahl und Wiederherstellen-Karte.

### Modified Capabilities
<!-- keine -->

## Impact

- Code: `lib/backup-plan.js` (reine Namens-/Aufbewahrungslogik), `lib/backup-folder.js` (Dateizugriff), `lib/store.js` (Einstellung `backup.folder`), `newtab.js` (Einstellungen, tägliche Sicherung, Karte), `style.css`.
- Berechtigungen: **keine neue**. `showDirectoryPicker` braucht keinen Manifest-Eintrag; jede Wahl ist eine Nutzergeste. `docs/BERECHTIGUNGEN.md` bleibt unverändert, der Wächter bleibt grün.
- Datenschutz: Datei bleibt auf dem Rechner, der Schlüssel `ai.orKey` wird wie beim Export entfernt.
- Voraussetzung: v0.8.0 (`main`). Unabhängig von v10 bis v12. Version 0.9.0.
