# Design

## Entscheidungen

- **Tour = Daten + Overlay.** `lib/tour.js` exportiert `STEPS` (`{ sel, title, text }`, 5 Einträge) und `next(i, steps, exists)`: überspringt Schritte, deren Ziel (`sel`) auf der Seite fehlt. Das Overlay (`newtab.js`) hebt das Ziel hervor, zeigt Text, „Weiter“, „Überspringen“; Esc beendet. Kein Fremdcode, keine Bibliothek.
- **Einmal:** Merker `settings.tourDone` (fehlt = noch nicht gesehen; `merge` übernimmt unbekannte Felder). „Überspringen“ setzt ihn ebenfalls. Wiederholen ignoriert ihn.
- **Berechtigungsseite:** Quelle ist das laufende Manifest (`getManifest()`), Klartexte in `lib/perms-info.js` (Name → Satz). `test/perms-info.test.js` liest `docs/BERECHTIGUNGEN.md` und scheitert, wenn eine Berechtigung ohne Klartext bleibt (gleiches Muster wie `tools/check-permissions.mjs`). Widerruf nur für optionale (`optional_host_permissions`/`optional_permissions`), mit `permissions.remove`; Pflicht-Berechtigungen zeigen „nötig, weil …“.
- **Leere Ordner:** reine Funktion `emptyFolders(tree)` in `lib/folders.js` (Ordner ohne URL in sich und in Unterordnern, Wurzeln ausgenommen). Spalte wie „Zuletzt hinzugefügt“ (virtuell), Einstellung `discover`-Muster (`settings.emptyCol`, fehlt = aus). Aufräumen nutzt `trashNodes` (Papierkorb, 7 Tage, Rückgängig).
- **Sprachen gestrichen** (siehe proposal); alle neuen Texte deutsch.

## Arbeitsweise

Branch `agent/<anbieter>/v11-erste-schritte` von `origin/main`, ein Worktree, ein PR. Nur Texte und Anzeige, keine Datenformat-Änderung.

## Risiken

- Overlay über Elementen, die je nach Ansicht fehlen: `next()` überspringt, die Tour bricht nie ab.
- `permissions.remove` einer Berechtigung, die die Leiste auf Webseiten braucht (`<all_urls>`): die Leiste verschwindet, das ist gewollt und im Text gesagt; keine Datenänderung.
- Aufräumen leerer Ordner löscht echte Browser-Lesezeichen-Ordner: immer erst Papierkorb, Bestätigung mit Anzahl.
