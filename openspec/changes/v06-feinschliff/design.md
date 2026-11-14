# Design

## Ausgangslage (gelesen in v0.5.2)

- `icon48.png`/`icon128.png` sind ein einfarbiger lila Kreis; `action` hat kein eigenes Symbol.
- Kopf (`newtab.js` `renderHead`): zehn Knöpfe mit Unicode-Zeichen (＋ ✎ ☑ ▦ ⤓ ⏱ ✨ ▣ ⚙), nur `title`, kein `aria-label`.
- `lib/ui.js` `menu()`: Knöpfe ohne Rollen, kein Fokus, keine Tasten außer Klick; `lib/bar.js` hat ein eigenes `showMenu` mit Esc, ohne Pfeiltasten.
- Browser-Kontextmenü: drei Einträge auf oberster Ebene (Speichern, Sitzung, Tabs als Ordner).
- Kein `commands` im Manifest; Alt+Umschalt+B nur im Content-Script per `keydown`.
- Einstellungen: ein `ask()`-Formular mit 14 Feldern ohne Gliederung, dazu Knöpfe; `pagebar.quick` (8) und der 14-Tage-Abstand haben keine Oberfläche.

## Entscheidungen

- **Symbolsatz als klassisches Skript** `lib/icons.js` (`globalThis.PikaIcons.icon(name, label)`), weil `lib/bar.js` ohne Importe auch im Content-Script läuft. Geladen in `newtab.html`, `sidebar.html` und in der Content-Script-Registrierung vor `lib/bar.js`. Eigene, einfache Strich-Symbole (24×24, `stroke="currentColor"`), etwa 20 Stück. Kein fremdes Icon-Paket, nichts aus dem Netz.
- **Programmsymbol:** Quelle `icons/icon.svg` (dunkles abgerundetes Quadrat, helle Leiste mit drei Lesezeichen-Reitern, grüner Live-Punkt). PNGs 16/32/48/128 erzeugt `tools/render-icons.mjs` einmalig mit dem vorhandenen Playwright-Chromium; die PNGs werden eingecheckt (kein Build-Schritt für Nutzer). Alte `icon48.png`/`icon128.png` werden ersetzt und Verweise (`manifest.json`, Benachrichtigungen in `background.js`) angepasst.
- **Menüs:** `menu()` bekommt Einträge `{ label, fn, icon, kbd, sub }`. `sub` ersetzt den Inhalt durch die Unterliste (wie „Tab hinzufügen ▸“ in der Leiste), mit „‹ Zurück“. Tastatur: Fokus auf ersten Eintrag, Pfeile, Pos1/Ende, Enter, Esc mit Fokus zurück; Rollen `menu`/`menuitem`. Dieselbe Tastenlogik als kleine Funktion in `lib/bar.js` (Duplikat von etwa 10 Zeilen, weil kein Import möglich).
- **Mehr-Menü im Kopf:** ein Knopf „Mehr“ öffnet `menu()` mit den seltenen Einträgen; Tastenkürzel N (Workspace) bleibt.
- **Lesezeichen-Menü:** „In Live-Ordner legen ▸“ schickt `{ type:'lf', op:'assign' }` an den Hintergrund (vorhandene Nachricht); „In neuem Fenster“ über `windows.create`; Kopieren über `navigator.clipboard`.
- **Browser-Kontextmenü:** Eltern-Eintrag `pika` mit Kindern; Untermenü der Live-Ordner wird bei Änderung von `lf` (Speicher-Ereignis, entprellt) per `contextMenus.removeAll` und Neuaufbau aktuell gehalten. Kinder-IDs `lf:<id>`.
- **Tastenkürzel:** `commands` mit `save-page` (Alt+Umschalt+S), `toggle-bar` (Alt+Umschalt+B, Nachricht an den aktiven Tab), `_execute_action` (öffnet in Chromium das Seitenpanel) und `_execute_sidebar_action` (Firefox). Das bisherige `keydown` im Content-Script bleibt als Rückfall.
- **Einstellungen:** `ask()` erhält Abschnittszeilen `{ section: 'Aussehen' }` und die Option `search: true` (Suchfeld, `/` fokussiert, filtert Zeilen nach Beschriftung, blendet leere Abschnitte aus). Die bisherigen Knöpfe (Foto, Leisten, Sicherungen, Seed, Leiste auf Webseiten) wandern in ihre Abschnitte.
- **Neue Einstellungen** in `DEFAULT.settings` mit Standardwerten, die das alte Verhalten treffen: `newtabBar: true`, `openInNewTab: false`, `confirmDelete: true`, `backup.nagDays: 14` (0 = nie), `pomo: { work: 25, brk: 5 }`. `merge()` ergänzt verschachtelte Felder (`pomo`, `backup`). `backupNagDue` liest `nagDays`.
- **Löschen ohne Bestätigung:** nur einzelne Links; vorher `{ parentId, index, title, url }` merken, „Rückgängig“ legt neu an. Ordner immer mit Bestätigung, weil ein Ordnerbaum nicht sicher wiederherstellbar ist.
- **Emoji-Raster:** 24 feste Emoji als Knöpfe in einem kleinen Dialog (Newtab) bzw. im Leisten-Menü (Content-Script), plus Feld für eigenes Zeichen.

## Offene Risiken

- Chromium erlaubt höchstens vier vorgeschlagene Kürzel; Alt+Umschalt+S/B können mit anderen Erweiterungen kollidieren. Der Nutzer kann sie in `chrome://extensions/shortcuts` bzw. `about:addons` ändern.
- `_execute_sidebar_action` ist Firefox-spezifisch; Chromium meldet ihn als normales Kommando ohne Wirkung (Annahme, beim Lint prüfen).
- Das Neuaufbauen des Browser-Kontextmenüs bei jeder Ordneränderung ist billig, kann aber kurz flackern, wenn das Menü gerade offen ist.
- Optik des neuen Programmsymbols ist Geschmackssache; Quelle als SVG erlaubt schnelles Nachbessern.
