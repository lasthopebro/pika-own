# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Worktree `v06-feinschliff` (Branch `agent/claude/v06-feinschliff` von `main`) weiterverwenden; Draft-PR „v0.6 Feinschliff: Symbole, Menüs, Optionen“
- [ ] 1.2 Version 0.6.0 in `manifest.json` und `package.json`, `CHANGELOG.md`

## 2. Symbole

- [ ] 2.1 `icons/icon.svg` (eigener Entwurf) und `tools/render-icons.mjs`; PNGs 16/32/48/128 erzeugen und einchecken
- [ ] 2.2 `manifest.json`: `icons`, `action.default_icon`, `sidebar_action.default_icon`; Benachrichtigungen in `background.js` auf das neue Symbol; alte `icon48.png`/`icon128.png` entfernen
- [ ] 2.3 `lib/icons.js` (klassisches Skript, `PikaIcons.icon(name, label)`, etwa 20 Strich-Symbole) in `newtab.html`, `sidebar.html` und Content-Script-Registrierung laden
- [ ] 2.4 Kopf, Leiste und Seitenleiste auf `PikaIcons` umstellen, jedes Symbol mit `aria-label`

## 3. Menüs

- [ ] 3.1 `lib/ui.js` `menu()`: Einträge mit `icon`, `kbd`, `sub`; Rollen; Tastatur (Pfeile, Pos1/Ende, Enter, Esc, Fokus zurück)
- [ ] 3.2 `lib/bar.js` `showMenu`: dieselbe Tastatur-Logik und Rollen
- [ ] 3.3 Kopf: sechs Knöpfe plus „Mehr“-Menü (Workspace anlegen/bearbeiten, Widget, Sitzungen)
- [ ] 3.4 Lesezeichen-Menü: „In Live-Ordner legen ▸“, „Link kopieren“, „Als Markdown kopieren“, „In neuem Fenster öffnen“
- [ ] 3.5 Browser-Kontextmenü: Eltern-Eintrag „pika-own“, Untermenü inkl. „In Live-Ordner ▸“, Neuaufbau bei Änderung von `lf`
- [ ] 3.6 `commands` im Manifest (save-page, toggle-bar, `_execute_action`, `_execute_sidebar_action`), Handler im Hintergrund
- [ ] 3.7 `?` öffnet Dialog „Tastenkürzel“ mit allen Kürzeln und Hinweis auf die Browser-Verwaltung

## 4. Optionen

- [ ] 4.1 `lib/store.js`: `newtabBar`, `openInNewTab`, `confirmDelete`, `backup.nagDays`, `pomo`; `merge` für verschachtelte Felder; Test für alte Stände
- [ ] 4.2 `lib/ui.js` `ask()`: Abschnittszeilen und `search: true` (Taste `/`, Filter, leere Abschnitte ausblenden)
- [ ] 4.3 Einstellungsdialog neu gegliedert (Aussehen, Leiste, Schnellwahl, Board, Erinnerungen & Timer, Sicherung, KI, Datenschutz), bisherige Knöpfe in ihre Abschnitte
- [ ] 4.4 Optionen verdrahten: Leiste im Neuen Tab, `pagebar.quick`, Board-Links im neuen Tab, Löschen bestätigen mit Rückgängig für Links, Hinweis-Abstand (`backupNagDue` mit `nagDays`, Test), Pomodoro-Standardwerte im Widget-Dialog
- [ ] 4.5 Emoji-Raster (24 Emoji plus eigenes Zeichen) für Live-Ordner in Leiste und Board

## 5. Prüfung

- [ ] 5.1 Unit-Tests: `merge` mit alten Ständen, `backupNagDue` mit `nagDays`, Menü-Tastenlogik als reine Funktion (nächster Index)
- [ ] 5.2 `npm test` und `npm run lint` ohne Fehler (Warnungen zu `commands` prüfen)
- [ ] 5.3 Chromium-E2E: Kopf mit sechs Knöpfen plus Mehr, Menü per Tastatur, „In Live-Ordner legen“, Markdown kopieren, Einstellungssuche, Leiste im Neuen Tab aus, Löschen mit Rückgängig, neues Symbol im Manifest
- [ ] 5.4 Review durch getrennten Prüfer-Agenten (Barrierefreiheit und Sicherheit)
- [ ] 5.5 README (Abschnitte Symbole/Menüs/Einstellungen, Tastenkürzel), Draft-PR, `openspec validate v06-feinschliff`

## 6. Handprüfung

- [ ] 6.1 Firefox: Symbol in Werkzeugleiste und about:addons, Kürzel in about:addons änderbar, Kontextmenü-Untermenü, Seitenleiste per Kürzel
- [ ] 6.2 Brave: Symbol bei 16 px, `chrome://extensions/shortcuts`, Kontextmenü, Seitenpanel per Kürzel
