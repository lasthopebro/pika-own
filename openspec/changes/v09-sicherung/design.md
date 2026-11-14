# Design

## Entscheidungen

- **Nur der Neue Tab schreibt in den Ordner.** `showDirectoryPicker` und `requestPermission` brauchen eine Nutzergeste und gehen nicht im Hintergrund-Worker. Der Worker macht weiter seine tägliche Sicherung in `storage.local` (`background.js`, unverändert). Der erste Neue Tab des Tages schreibt zusätzlich die Datei, wenn `queryPermission` `granted` liefert.
- **Handle in IndexedDB**, nicht in `storage.local` (ein `FileSystemDirectoryHandle` ist nicht JSON). Schlüssel `pika-folder`. In `settings.backup.folder` stehen nur `{ on, device, keep, lastWrite }`.
- **Reine Logik getrennt** (`lib/backup-plan.js`): `fileName(device, ts)`, `devicePrefix(device)`, `toDelete(names, device, keep)`, `isFreshProfile(tree, state)`. Der Dateizugriff (`lib/backup-folder.js`) nimmt Handle-ähnliche Objekte entgegen und lässt sich so mit einem Fake im Node-Test prüfen.
- **Aufbewahrung nur für eigene Dateien**: gelöscht wird nur, was zum eigenen Gerätenamen und dem Muster passt; fremde Dateien im Ordner bleiben unberührt.
- **Zugriff abgelaufen** (`queryPermission` = `prompt`): nichts schreiben, Hinweisleiste „Zugriff erneuern“ mit Knopf (Geste → `requestPermission`).
- **Wiederherstellen-Karte** erscheint nur bei „frisch“: Lesezeichenbaum hat höchstens 3 Lesezeichen und `settings.backup.lastExport` ist 0 und es gibt keinen Workspace-Inhalt. Knöpfe „Aus Sicherungsordner“ (Chromium) und „Datei wählen“; danach `restore(b)` aus `lib/backup.js` mit Bestätigung.
- **Fehler** (Ordner gelöscht, Platte voll): einmalige Meldung, `folder.on` bleibt, nächster Versuch am nächsten Tag; nie das Board blockieren.

## Arbeitsweise

Ein Branch `agent/<anbieter>/v09-sicherung` von `origin/main`, ein Worktree, ein PR (AGENTS.md Regel 3). Vorher `git branch --list`, `git worktree list`. Bauer und Prüfer sind verschiedene Agenten.

## Risiken

- Chromium-Versionen und Brave: Brave kann die File System Access API per Flag abschalten. Dann ist `supported()` falsch und die Funktion unsichtbar (Handprüfpunkt).
- Persistente Berechtigung hängt vom Browser ab; ohne sie muss der Nutzer nach jedem Neustart einmal klicken. Das ist der dokumentierte Normalfall.
- Dateiname mit Gerätenamen: nur `[a-z0-9-]`, sonst Ersatz, damit kein Pfadtrick möglich ist.
