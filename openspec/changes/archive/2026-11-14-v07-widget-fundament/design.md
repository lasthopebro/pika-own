# Design

## Ausgangslage (main nach v0.5.2 + Audit + v0.3-Rest)

- Widget-Wissen an drei Stellen in `newtab.js`: Titel-Map in `widgetEl`, die `if`-Kette für `clock|countdown|timer|counter|snippets`, die Felder-Map in `addWidget`.
- Widgets speichern mit `persist()`, das `Object.assign(cur, S, …)` macht: der ganze Zustand des Tabs gewinnt (nur `lf`/`snapshots` ausgenommen). `absorb` (lib/quick.js) mildert das für Timer, nicht für Zähler/Textbausteine.
- `tools/e2e-chromium.mjs`: ein Skript, ~35 Prüfungen nacheinander, feste Pausen, Port 11434.
- CI (`.github/workflows/ci.yml`): `npm test`, `web-ext lint`, E2E.

## Entscheidungen

- **Vertrag** (`widgets/<typ>.js`, ES-Modul, nur Newtab):
  ```js
  export default {
    type: 'counter', label: 'Zähler',
    defaults: () => ({ label: '', n: 0 }),
    fields: (d) => [{ name: 'label', label: 'Name', value: d.label }],   // Format von ask() in lib/ui.js
    title: (w) => w.label || 'Zähler',
    render(w, { big, sub, box, patch, tick, h, toast }) { /* DOM füllen; Änderungen nur über patch */ },
  }
  ```
  `widgets/index.js`: `export const WIDGETS = { clock, countdown, timer, counter, snippets }`.
- **`patchWidget(id, fn)`** in `lib/store.js`: `update((S) => { const w = S.workspaces.flatMap(x => x.widgets).find(x => x.id === id); if (w) fn(w) })`. Das Widget-Objekt im Tab wird danach mit dem gespeicherten Stand abgeglichen (`Object.assign(local, saved)`), damit `persist()` es nicht zurückdreht.
- **Hülle in `newtab.js`** (~25 Zeilen): Kasten, Titel, Kontextmenü „Entfernen“, `try/catch` um `render` → Fehlerkarte, `tick`-Registrierung, `addWidget` aus `WIDGETS` (Typ-Auswahl, dann `fields(defaults())`).
- **Timer** behält `timerLeft/timerNext` aus `lib/quick.js`; der Alarm im Hintergrund schreibt weiter per `update()`.
- **Vertragstest** importiert `widgets/index.js` unter Node mit einem minimalen DOM-Ersatz (`globalThis.document` mit `createElement`, das ein einfaches Objekt liefert). Kein jsdom, keine neue Abhängigkeit.
- **E2E-Harness** `tools/e2e/harness.mjs`: `launch()` (frisches Profil, Erweiterung, `PIKA_MOCK_PORT`, Standard 11434), `ok()`, `summary()`; Abläufe `tools/e2e/board.mjs`, `bar.mjs`, `ai.mjs`, `widgets.mjs`, `capture.mjs`; `tools/e2e/run.mjs` startet alle nacheinander, fängt Fehler je Ablauf und setzt den Exit-Code. `tools/e2e-chromium.mjs` bleibt als dünner Aufruf von `run.mjs` (CI und Doku zeigen weiter darauf).
- **Berechtigungs-Wächter** `tools/check-permissions.mjs` liest `manifest.json` und die Tabelle in `docs/BERECHTIGUNGEN.md` (Zeilen `| name | Begründung |`), vergleicht beide Mengen, Exit 1 mit Liste der Abweichungen. CI-Schritt im Job `test`.

## Risiken

- Der DOM-Ersatz im Vertragstest prüft nur „wirft nicht“, nicht die Optik; Optik bleibt beim E2E.
- Umzug ohne sichtbare Änderung ist nur so gut wie der E2E-Ablauf „widgets“; er muss vor dem Umzug die fünf Widgets prüfen (Task 2.1 vor 3.x).
- Bei paralleler Arbeit an `v06-feinschliff` Konflikte in `newtab.js`; Reihenfolge: v0.6 zuerst mergen, dann diesen Change auf `main` ziehen.
