# Proposal

## Why

Neue Widgets (Notizen, Todo, Fotorahmen) sollen in v0.8 kommen und möglichst von günstigeren Modellen gebaut werden können. Heute geht das nicht sicher: Das Wissen über Widget-Typen steckt an drei Stellen in `newtab.js` (Titel-Map, `if`-Kette in `widgetEl`, Felder-Map in `addWidget`), und jedes Widget speichert über `persist()`, das den ganzen Zustand mit der Kopie des Tabs überschreibt. Zwei offene Neue Tabs oder der Pomodoro-Wechsel im Hintergrund können so getippten Text verlieren. Außerdem reißt ein Fehler im langen E2E-Skript alle späteren Prüfungen mit, und nichts hält eine neue Berechtigung ohne Spezifikation auf.

## What Changes

- **Widget-Registry:** jeder Typ in einer eigenen Datei `widgets/<typ>.js` mit festem Vertrag (`type`, `label`, `title`, `fields`, `defaults`, `render`); `widgets/index.js` ist die einzige Liste. Die fünf vorhandenen Widgets (Uhr, Countdown, Timer/Pomodoro, Zähler, Textbausteine) ziehen um, ohne sichtbare Änderung.
- **Sicherer Schreibweg:** `patchWidget(id, fn)` in `lib/store.js` ändert über `update()` nur dieses eine Widget. Widgets bekommen nur `patch`, keinen Zugriff auf den ganzen Zustand.
- **Fehler-Isolation:** Wirft ein Widget beim Zeichnen, zeigt es eine Fehlerkarte; Board und andere Widgets bleiben.
- **Vertragstest:** ein Test läuft über alle registrierten Widgets (Pflichtfelder, serialisierbare Standardwerte, Titel mit Standardwerten, Zeichnen mit leeren und kaputten Daten ohne Fehler).
- **E2E aufgeteilt:** unabhängige Abläufe je Funktion mit frischem Profil, Warten auf Selektoren statt fester Pausen, Mock-Port über Umgebungsvariable.
- **Berechtigungs-Wächter in CI:** ein Skript vergleicht `permissions`/`host_permissions`/`optional_*` im Manifest mit einer Liste in `docs/BERECHTIGUNGEN.md`; Abweichung lässt die CI scheitern.

## Capabilities

### New Capabilities
- `widget-framework`: Registry, Vertrag, sicherer Schreibweg und Fehler-Isolation für Widgets.
- `quality-gates`: getrennte E2E-Abläufe und Berechtigungs-Wächter in CI.

### Modified Capabilities
<!-- keine: openspec/specs/ ist noch leer -->

## Impact

- Code: neu `widgets/*.js`, `test/widgets.contract.test.js`, `tools/check-permissions.mjs`, `tools/e2e/*.mjs` (Abläufe) mit gemeinsamem `tools/e2e/harness.mjs`; geändert `newtab.js` (Widget-Teil schrumpft auf die Hülle), `lib/store.js` (`patchWidget`), `.github/workflows/ci.yml`.
- Keine neue Funktion für den Nutzer, keine neue Berechtigung, Datenformat der Widgets unverändert.
- Voraussetzung für `v08-widgets`. Unabhängig von `v06-feinschliff` (berührt dort nur den Widget-Teil von `newtab.js`; bei Konflikt zuerst v0.6 mergen).
