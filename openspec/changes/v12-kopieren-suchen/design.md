# Design

## Entscheidungen

- **Reine Funktionen** in `lib/clipboard-formats.js`: `toText(node)`, `toMarkdown(node)`, `toHtml(node)`, `toCsv(node)`, `toTree(node)`. Eingabe ist ein Knoten des Lesezeichenbaums (`{ title, url?, children? }`) oder eine Liste von Knoten. Ausgabe: String. Ordnerreihenfolge wie im Baum. Kein DOM, testbar in Node.
- **Escaping:** Markdown (`[` `]` `(` `)` im Titel), HTML (`& < > "`), CSV (Anführungszeichen verdoppeln, Zellen mit Komma/Zeilenumbruch einfassen). HTML wird zusätzlich als `text/html` in die Zwischenablage gelegt (`ClipboardItem`), sonst als Text.
- **Gesperrte/verborgene Items:** Verborgene Lesezeichen (`settings.hidden`) werden nur kopiert, wenn sie sichtbar sind (wie „Links kopieren“ heute).
- **Websuche:** `B.search.query({ text, disposition: 'NEW_TAB' })` (Chromium) bzw. `browser.search.search({ query, disposition: 'NEW_TAB' })` (Firefox). Berechtigung `search` optional: `permissions.request` im Klick-Handler der Palette (Nutzergeste). Fehlt die API, ist der Eintrag unsichtbar.
- **Kein Umweg über KI:** der Suchtext wird nicht geloggt, nicht gespeichert.

## Arbeitsweise

Branch `agent/<anbieter>/v12-kopieren-suchen` von `origin/main`, ein Worktree, ein PR. Da das Manifest geändert wird, dieselbe Änderung zuerst in `docs/BERECHTIGUNGEN.md` (Spezifikation vor Code).

## Risiken

- `ClipboardItem` mit `text/html` ist in Firefox nur bei neueren Versionen verfügbar; Rückfall auf Klartext mit Hinweis.
- Große Ordner (tausende Einträge): Kopie ist synchron und schnell; Grenze nur die Zwischenablage des Browsers.
