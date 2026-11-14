# Tasks

Regeln wie in `v07-widget-fundament`: höchstens 2 Dateien und etwa 80 Zeilen je Task, am Ende `npm test` grün plus genannter Prüfbefehl. **[stark]** nur starkes Modell mit getrenntem Prüfer, **[günstig]** darf ein günstiges Modell allein.

## 1. Branch

- [ ] 1.1 [günstig] `v07-widget-fundament` gemergt? Dann Orca-Worktree `v08-widgets` von `main`, Branch `agent/<anbieter>/v08-widgets`, Draft-PR.

## 2. Notiz

- [ ] 2.1 [günstig] `widgets/notes.js` (Textfeld, entprellt speichern über `patch`) und Eintrag in `widgets/index.js`. Prüfen: Vertragstest; E2E-Ablauf `widgets.mjs` um „Notiz tippen, neu laden, Text da“ ergänzen.

## 3. Todo

- [ ] 3.1 [günstig] `lib/todo.js` mit `sortTodos` und `dueSoon` plus `test/todo.test.js` (überfällig oben, erledigt unten, ohne Datum dazwischen). Prüfen: `npm test`.
- [ ] 3.2 [günstig] `widgets/todo.js` (Enter fügt hinzu, Abhaken, Löschen, Datum optional, Sortierung aus 3.1) und Eintrag in `index.js`. Prüfen: Vertragstest; E2E „Punkt anlegen, abhaken, steht unten“.
- [ ] 3.3 [stark] Alarme für fällige Todos in `background.js` (nur bei Änderung, Merker `notified`), Test für die Planungsfunktion. Prüfen: E2E mit Fälligkeit in 1 Sekunde → genau eine Benachrichtigung (Zähler über `chrome.notifications.getAll`).

## 4. Fotorahmen

- [ ] 4.1 [günstig] `widgets/photo.js` (bis 6 `https:`-Adressen, Wechselzeit, Einpassen/Füllen, Fehlerbild überspringen) und Eintrag in `index.js`. Prüfen: Vertragstest; Unit-Test, dass `javascript:` und `http:` abgelehnt werden.

## 5. Abschluss

- [ ] 5.1 [günstig] README (Widgets), `CHANGELOG.md` 0.8.0, Version in `manifest.json`/`package.json`. Prüfen: `npm run lint`, `node tools/check-permissions.mjs`.
- [ ] 5.2 [stark] Review durch getrennten Prüfer, CI grün, `openspec validate v08-widgets`, PR auf „Ready“.
