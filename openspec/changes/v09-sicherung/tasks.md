# Tasks

Regeln wie in `v08-widgets`: höchstens 2 Dateien und etwa 80 Zeilen je Task, am Ende `npm test` und `npm run lint` grün plus der genannte Prüfbefehl. **[stark]** nur starkes Modell mit getrenntem Prüfer, **[günstig]** darf ein günstiges Modell allein. Voraussetzung: v0.8.0 auf `main`; Branch `agent/<anbieter>/v09-sicherung` von `origin/main`, Draft-PR.

## 1. Reine Logik

- [ ] 1.1 [günstig] `lib/backup-plan.js`: `fileName(device, ts)` (nur `[a-z0-9-]`, sonst `-`), `toDelete(names, device, keep)` (nur eigene Muster-Dateien, älteste zuerst), `isFreshProfile(urlCount, state)` (höchstens 3 Lesezeichen, `lastExport` 0, keine Widgets/Tags) plus `test/backup-plan.test.js` (fremde Datei bleibt, Gerätename mit `../` wird entschärft). Prüfen: `npm test`.

## 2. Dateizugriff

- [ ] 2.1 [stark] `lib/backup-folder.js`: `writeSnapshot(dir, name, json)` (`getFileHandle` mit `create`, `createWritable`, schließen), `listSnapshots(dir)` (nur `*.json`, mit Datum), `prune(dir, names)`; Handle-ähnliche Parameter, plus Fake-Verzeichnis-Test in `test/backup-folder.test.js` (schreiben, 6 Tage → 5 bleiben, Fremddatei bleibt, Schreibfehler wirft). Prüfen: `npm test`.
- [ ] 2.2 [stark] Gleiche Datei: `supported()`, `pick()` (`showDirectoryPicker({ mode: 'readwrite' })`), Handle in IndexedDB (`saveHandle`/`loadHandle`, Speicher als Parameter für den Test), `access(dir, ask)` → `'granted' | 'prompt' | 'denied'` (`queryPermission`, bei `ask` `requestPermission`). Test mit Fake. Prüfen: `npm test`.

## 3. Einstellung und Oberfläche

- [ ] 3.1 [stark] `lib/store.js`: `settings.backup.folder = { on: false, device: '', keep: 5, lastWrite: 0 }` samt tiefem `merge` (alte Stände ohne das Feld) plus Test in `test/store.test.js`. Prüfen: `npm test`.
- [ ] 3.2 [stark] `newtab.js` Einstellungen → Sicherung: nur bei `supported()` „Ordner wählen“, Gerätename, „Zugriff erneuern“, „Jetzt in Ordner sichern“; Zustand als Text („Ordner aktiv, letzte Sicherung …“). Prüfen: E2E-Handprüfung in Chromium, Abschnitt fehlt in Firefox.
- [ ] 3.3 [stark] `newtab.js`: beim Start, wenn `folder.on` und `lastWrite` nicht heute: `access(dir,false)`; `granted` → `writeSnapshot` + `prune`, `lastWrite` und `backup.lastExport` setzen (so schweigt der alte Hinweis); `prompt` → Leiste „Zugriff erneuern“ mit Knopf; Fehler → eine Meldung. Alles über `update()`. Prüfen: Handprüfung (Neustart, Zugriff erneuern, Datei im Ordner).

## 4. Wiederherstellen

- [ ] 4.1 [günstig] `newtab.js` + `style.css`: Karte „Sicherung wiederherstellen“ bei `isFreshProfile`, Knöpfe „Aus Sicherungsordner“ (nur Chromium; Liste der Dateien, neueste zuerst) und „Datei wählen“ (vorhandenes Datei-Eingabefeld), Bestätigung, dann `restore(b)`; ungültige Datei → Meldung. Prüfen: neues Chromium-Profil mit Sicherungsdatei (`tools/e2e-chromium.mjs`), Karte erscheint und verschwindet.

## 5. Abschluss

- [ ] 5.1 [günstig] `README.md` (Sicherung), `CHANGELOG.md` 0.9.0, Version in `manifest.json`/`package.json`; `tools/e2e/backup.mjs` (Datei-Wahl-Weg der Karte, ohne Ordnerdialog) und Eintrag in `tools/e2e/run.mjs`. Prüfen: `npm run lint`, `node tools/check-permissions.mjs` (keine neue Berechtigung), `openspec validate v09-sicherung`.
- [ ] 5.2 [stark] Review durch getrennten Prüfer (Dateizugriff, Löschlogik, Schlüssel nicht in der Datei), Handprüfung Brave und Firefox, CI grün, PR auf „Ready“.

## Handprüfpunkte

- **Brave/Chromium:** Ordner wählen → am nächsten Tag Datei da (oder Uhr verstellen); nach Browserneustart „Zugriff erneuern“ → Klick → Datei; Fremddatei im Ordner bleibt; Karte „Wiederherstellen“ im frischen Profil (`--user-data-dir`). Brave: prüfen, ob `showDirectoryPicker` vorhanden ist; sonst ist der Abschnitt unsichtbar (richtig).
- **Firefox:** Abschnitt „Sicherungsordner“ nicht sichtbar, Datei-Export und Hinweis wie bisher, Karte nur mit „Datei wählen“.
- **Berechtigungen:** keine neue; `docs/BERECHTIGUNGEN.md` unverändert.
