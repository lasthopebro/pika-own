# Tasks

Regeln für jeden Task: höchstens 2 Dateien und etwa 80 geänderte Zeilen; am Ende `npm test` grün und der genannte Prüfbefehl. **[stark]** = Speicher, Berechtigungen, Content-Script: nur starkes Modell, getrennter Prüfer. **[günstig]** = darf ein günstiges Modell allein machen. Unklar? Nicht raten, im PR fragen.

## 1. Branch

- [x] 1.1 [günstig] Erst `v06-feinschliff` gemergt? Dann Orca-Worktree `v07-widget-fundament` von `main`, Branch `agent/<anbieter>/v07-widget-fundament`, Draft-PR. Prüfen: `git log origin/main..HEAD` leer.

## 2. Sicherheitsnetz zuerst

- [x] 2.1 [günstig] `tools/e2e/harness.mjs` (launch, ok, summary, `PIKA_MOCK_PORT`) und `tools/e2e/widgets.mjs`: legt je ein Widget der fünf Typen an und prüft Titel und einen Klick. Prüfen: `node tools/e2e/widgets.mjs <ext>` grün auf heutigem Stand.
- [x] 2.2 [günstig] Restliche Prüfungen aus `tools/e2e-chromium.mjs` auf `board.mjs`, `bar.mjs`, `ai.mjs`, `capture.mjs` verteilen (je Datei ein Ablauf, feste Pausen durch `waitFor` ersetzen). Prüfen: jede Datei einzeln grün.
- [x] 2.3 [günstig] `tools/e2e/run.mjs` (alle Abläufe, Fehler je Ablauf fangen, Zusammenfassung, Exit-Code); `tools/e2e-chromium.mjs` ruft nur noch `run.mjs`. Prüfen: absichtlich eine Prüfung brechen → andere Abläufe laufen, Exit 1.
- [x] 2.4 [stark] `docs/BERECHTIGUNGEN.md` (Tabelle aller heutigen Berechtigungen mit Begründung) und `tools/check-permissions.mjs`; CI-Schritt im Job `test`. Prüfen: `node tools/check-permissions.mjs` grün; mit erfundener Zusatz-Berechtigung rot.

## 3. Registry

- [x] 3.1 [stark] `patchWidget(id, fn)` in `lib/store.js` plus Test in `test/store.test.js` „patchWidget ändert nur das eine Widget und behält fremde Felder“. Prüfen: `npm test`.
- [x] 3.2 [günstig] `widgets/index.js` (leere Liste) und `test/widgets.contract.test.js` mit DOM-Ersatz; Test läuft über `WIDGETS`. Prüfen: `npm test` grün (0 Widgets).
- [x] 3.3 [günstig] `widgets/counter.js` (aus `newtab.js` herauslösen, Speichern über `patch`), in `index.js` eintragen. Prüfen: Vertragstest und `tools/e2e/widgets.mjs`.
- [x] 3.4 [günstig] `widgets/snippets.js` wie 3.3.
- [x] 3.5 [günstig] `widgets/clock.js` und `widgets/countdown.js` wie 3.3.
- [x] 3.6 [stark] `widgets/timer.js` (Pomodoro, Alarm `timer|<id>`, `timerLeft/timerNext` aus `lib/quick.js`) wie 3.3.
- [x] 3.7 [stark] Hülle in `newtab.js`: `widgetEl`/`addWidget` lesen nur noch `WIDGETS`, `try/catch` → Fehlerkarte; alte `if`-Kette, Titel- und Felder-Map löschen. Prüfen: alle E2E-Abläufe grün, `grep -n "type === 'counter'" newtab.js` leer.

## 4. Abschluss

- [ ] 4.1 [günstig] README-Abschnitt „Eigenes Widget bauen“ (Vertrag, eine Datei, ein Eintrag, Vertragstest) und `CHANGELOG.md` (0.7.0, Version in `manifest.json`/`package.json`). Prüfen: `npm run lint`.
- [ ] 4.2 [stark] Review durch getrennten Prüfer (Speicher, Fehler-Isolation), CI grün, `openspec validate v07-widget-fundament`, PR auf „Ready“.
