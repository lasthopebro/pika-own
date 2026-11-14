# Tasks

Regeln wie in `v08-widgets`: höchstens 2 Dateien und etwa 80 Zeilen je Task, am Ende `npm test` und `npm run lint` grün plus der genannte Prüfbefehl. **[stark]** nur starkes Modell mit getrenntem Prüfer, **[günstig]** darf ein günstiges Modell allein. Voraussetzung: v0.8.0 auf `main`; Branch `agent/<anbieter>/v12-kopieren-suchen` von `origin/main`, Draft-PR.

## 1. Formate

- [ ] 1.1 [günstig] `lib/clipboard-formats.js`: `toText`, `toMarkdown`, `toTree` plus `test/clipboard-formats.test.js` (Unterordner als Überschrift/Einrückung, `[` `]` im Titel maskiert, leerer Ordner → leerer String). Prüfen: `npm test`.
- [ ] 1.2 [günstig] Gleiche Datei: `toHtml`, `toCsv` plus Tests (HTML-Zeichen maskiert, CSV mit Komma, Anführungszeichen und Zeilenumbruch). Prüfen: `npm test`.

## 2. Menü

- [ ] 2.1 [günstig] `newtab.js`: Ordner-Menü „Kopieren als ▸“ mit den fünf Formaten (HTML zusätzlich als `text/html`, Rückfall Text), Meldung mit Anzahl; Auswahlleiste um „Als Markdown“ ergänzen. Prüfen: Handprüfung in Chromium und Firefox (einfügen in Editor, Notiz-Widget).

## 3. Websuche

- [ ] 3.1 [stark] `manifest.json` `optional_permissions: ["search"]` und `docs/BERECHTIGUNGEN.md` Zeile: `| `search` | Optional: „Im Web suchen“ in der Palette öffnet den eingegebenen Text in der Standardsuchmaschine des Browsers; erst beim ersten Einsatz angefragt, nichts wird gespeichert. |`. Prüfen: `node tools/check-permissions.mjs`, `npm test`, `npm run lint`.
- [ ] 3.2 [stark] `newtab.js` Palette: letzter Eintrag „Im Web suchen: <Text>“ (einziger bei null Treffern), `permissions.request({ permissions: ['search'] })` im Klick, dann `search.query`/`search.search` mit `disposition: 'NEW_TAB'`; ohne API unsichtbar, bei Ablehnung Meldung. Prüfen: Handprüfung (Chromium: Anfrage erscheint einmal; Firefox: Tab mit Standardsuche).

## 4. Abschluss

- [ ] 4.1 [günstig] `README.md`, `CHANGELOG.md` 0.12.0, Version in `manifest.json`/`package.json`, `docs/FUNKTIONSLISTE.md` (Zeilen Kopieren und Im Web suchen auf „vorhanden“). Prüfen: `npm run lint`, `openspec validate v12-kopieren-suchen`.
- [ ] 4.2 [stark] Review durch getrennten Prüfer (Maskierung, optionale Berechtigung, nichts an KI-Anbieter), CI grün, PR auf „Ready“.

## Handprüfpunkte

- **Firefox und Brave:** Ordner als Markdown/HTML/CSV/Baum kopieren und in Editor einfügen; HTML in Mail/Notizen-App ergibt Liste mit Links; Titel mit Sonderzeichen bleiben gültig.
- **Websuche:** erste Nutzung fragt `search` an; Ablehnen öffnet nichts; Zulassen öffnet die Standardsuchmaschine (Brave: Brave Search oder gewählte). Widerruf unter Einstellungen → Berechtigungen (falls v11 gebaut) oder im Add-on-Manager.
- **Berechtigungen:** neue optionale `search`; Zeile in `docs/BERECHTIGUNGEN.md` (Wortlaut oben) ist Pflicht, sonst scheitert `tools/check-permissions.mjs`.
