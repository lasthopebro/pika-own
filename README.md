# pika-own

Eigenes Lesezeichen-Board als Neuer-Tab-Seite plus Seitenleiste. Firefox und Chromium/Brave (Manifest V3), ohne Build-Schritt, ohne Konto.
Eigener Code, clean-room: Vorbild ist nur Aussehen und Verhalten, kein fremder Code, siehe `PLAN-DECISIONTREE.md` (Regeln R1-R5).

## Installieren (Release 0.5.2)
1. Zip aus den [Releases](https://github.com/lasthopebro/pika-own/releases) entpacken (oder Repository klonen).
2. Brave/Chrome: `brave://extensions` → Entwicklermodus → Entpackte Erweiterung laden → entpackten Ordner wählen.
3. Firefox: `about:debugging` → Dieser Firefox → Temporäres Add-on laden → `manifest.json` (nach Neustart erneut nötig, solange nicht signiert).
4. Neuen Tab öffnen. Für KI: Ollama installieren und starten, dann ✨ → Modell wählen oder laden.

## Leiste und Live-Tab-Ordner (v0.4/v0.5)
- Oben im Neuen Tab: Live-Tab-Ordner, deine Lesezeichenleiste und die meistbesuchten Seiten, wie eine Lesezeichenleiste. Zu breit → „»“.
- **Live-Tab-Ordner:** ＋ legt einen benannten Ordner an (Symbol änderbar). Im Ordner-Menü: Tab hinzufügen, öffnen ohne Duplikat (vorhandener Tab wird fokussiert), als Sitzung speichern, umbenennen. Die Zuordnung gilt pro URL und überlebt Neustarts.
- **✨ Tabs sortieren:** KI schlägt Themen vor, „In Live-Ordner übernehmen“, „Rückgängig“ stellt den Stand davor wieder her.
- **Leiste auf Webseiten:** Einstellungen → „Leiste auf Webseiten einschalten“ (fragt um Zugriff auf alle Seiten; ohne Zustimmung bleibt sie aus). Ausblenden pro Domain, Einklappen mit Alt+Umschalt+B, im Vollbild aus. Nur ein kleiner Ausschnitt (Titel, Domains, Ordner) geht an die Seite, nie der volle Zustand.

## Schnelle Wege (v0.5.2)
- **Link ablegen:** Adresse kopieren und im Neuen Tab Strg+V drücken, oder einen Link (Adressleiste, andere Seite) auf eine Spalte ziehen. Landet im gezeigten Ordner, sonst in der ersten Spalte. Die Meldung nennt den Ordner und hat „Rückgängig“.
- **Alle Tabs sichern:** ⤓ im Kopf oder Rechtsklick auf eine Seite → „Alle Tabs als Lesezeichen-Ordner speichern“. Neuer Ordner „Tabs <Datum>“, mit Rückgängig.
- **Auf Live-Ordner ziehen:** Einen Link auf einen Live-Ordner in der Leiste ziehen ordnet ihn zu. Im Ordner-Menü: „Als Tab-Gruppe öffnen“ (Chromium/Brave, Firefox ab 139).
- **Pomodoro:** ▣ → Timer → „Pomodoro“ ankreuzen. Arbeit und Pause wechseln sich ab, die Benachrichtigung kommt auch bei geschlossenem Neuen Tab.
- **Sicherungsdatei:** Nach 14 Tagen ohne Export erinnert ein Hinweis an eine Kopie außerhalb des Browsers („Später“ = 14 Tage Ruhe).
- **Seitenleiste:** Ansicht „Live-Ordner“ zeigt dieselbe Leiste senkrecht.

## Symbole, Menüs, Einstellungen (v0.6)
- **Symbole:** eigenes Programmsymbol (Quelle `icons/icon.svg`, PNGs per `node tools/render-icons.mjs`) und ein einheitlicher Satz Strich-Symbole in Kopf, Leiste und Menüs. Jedes Symbol hat einen Namen für Screenreader, nichts wird aus dem Netz geladen.
- **Kopf:** Suche, Auswahl, Ansicht, Alle Tabs speichern, KI, Einstellungen; Seltenes (Workspace anlegen/bearbeiten, Widget, Sitzungen) im Menü „Mehr“.
- **Menüs mit Tastatur:** Pfeile, Pos1/Ende, Enter, Esc (Fokus kehrt zurück). Lesezeichen-Menü: „In Live-Ordner legen ▸“, „Link kopieren“, „Als Markdown kopieren“, „In neuem Fenster öffnen“. Browser-Kontextmenü: ein Eintrag „pika-own“ mit Untermenü.
- **Tastenkürzel:** `?` zeigt alle. Im Browser änderbar (Alt+Umschalt+S Seite speichern, Alt+Umschalt+B Leiste ein-/ausklappen, Alt+Umschalt+P/L Seitenleiste): Chrome/Brave/Edge `chrome://extensions/shortcuts`, Firefox `about:addons` → Zahnrad → Tastenkürzel verwalten.
- **Einstellungen:** Abschnitte (Aussehen, Leiste, Schnellwahl, Board, Erinnerungen & Timer, Sicherung, KI, Datenschutz) mit Suche (Taste `/`). Neu: Leiste im Neuen Tab an/aus, Zahl der Schnellwahl-Einträge, Links im neuen Tab, Löschen bestätigen (aus = mit Rückgängig, Ordner immer mit Nachfrage), Sicherungs-Hinweis nach 7/14/30 Tagen oder nie, Pomodoro-Standardlängen, Emoji-Raster für Live-Ordner und Lesezeichen.

## Eigenes Widget bauen (v0.7)
Ein Widget ist eine Datei `widgets/<typ>.js` mit einem Standard-Export und ein Eintrag in `widgets/index.js`; `newtab.js` bleibt unberührt.
```js
export default {
  type: 'counter', label: 'Zähler',                          // Schlüssel in der Liste, Name im Dialog
  defaults: (S) => ({ label: '', n: 0 }),                    // Startwerte, JSON-fähig (S = Zustand, z. B. für Einstellungen)
  fields: (d) => [{ name: 'label', label: 'Name', value: d.label }],   // Formular wie ask() in lib/ui.js
  title: (w) => w.label || 'Zähler',                         // Titel, nie leer
  make: (v, d) => ({ ...d, ...v }),                          // optional: Formularwerte -> Widget; ein Text als Rückgabe ist eine Fehlermeldung
  render(w, { big, sub, box, patch, tick, h, toast, ask, icon, redraw }) { /* DOM füllen */ },
}
```
- **Schreiben nur über `patch(fn)`:** `await patch((x) => { x.n += 1 })` ändert unter der Speichersperre genau dieses Widget und gleicht `w` mit dem gespeicherten Stand ab. Nie `persist()` oder den ganzen Zustand anfassen.
- **`tick(fn)`** läuft sofort und dann jede Sekunde; wirft `render` oder `tick`, ersetzt eine Fehlerkarte nur dieses Widget.
- **Test:** `npm test` prüft jedes registrierte Widget (Pflichtfelder, JSON-fähige Standardwerte, Titel, Zeichnen mit Standard- und leeren Daten). Die Optik prüft `tools/e2e/widgets.mjs`.
- Keine neue Berechtigung ohne Eintrag in `docs/BERECHTIGUNGEN.md` (die CI prüft das).

## Datenschutz
Alles bleibt im Browser (`storage.local`). Nichts wird an Dritte gesendet, außer du schaltest OpenRouter ein: dann gehen nur Tab-Titel und Domains an OpenRouter. Mit Ollama bleibt es auf deinem Rechner. Kein Konto, kein Lizenzschlüssel, keine Telemetrie.

Lizenz: MIT (`LICENSE`), Änderungen: `CHANGELOG.md`.
## Funktionen
- Board (Spalten, Galerie `V`), Palette `F` (`>` Aktion, `/` Ordner, `@` Workspace, `#` Tag), Auswahlmodus `S`, Drag & Drop
- Schnellwahl-Leisten aus dem Verlauf (frei konfigurierbar), Rechtsklick = Unterseiten der Domain
- Tags, Kommentare, Erinnerungen, Favoriten, Farbmarkierung, eigene Emoji-Icons, Spaltennamen/-farben
- Workspaces, angepinnte Links, Tab-Sitzungen, tägliche Sicherung (7 Stück) + Export/Import, Sammelumbenennen (Regex, Live-Vorschau)
- Akzentfarbe, Pitch Black, 8 Hintergründe/Foto/Farbe/Verlauf, Körnung, Parallax
- Widgets: Uhr mit Zeitzone, Countdown, Timer, Zähler, Textbausteine
- Seitenleiste mit eigenen Ansichten (Ordner, Tag, Verlauf, Tabs, Suche, Sitzungen, eigene Links)
- **Weitermachen** (v0.2): Karten auf dem neuen Tab, die den Verlauf nach Zeitlücken (30 min) zu Sitzungen gruppieren; „Alle öffnen“ in einem Fenster, funktioniert ohne KI
- **KI-Dialog** (✨, v0.2): Ollama-Status (grün/rot), Modelle mit Größe wählen, empfohlene Modelle herunterladen (Fortschrittsbalken, Abbrechen, Löschen); OpenRouter mit Schlüssel und nur kostenlosen Modellen, bei Tageslimit Fallback auf das Ollama-Modell
- Tab-Sortierung nur als **Vorschlag** (Ollama mit JSON-Schema, `think:false`), speichern als Lesezeichen-Ordner „KI-Themen“ oder als Sitzungen
- Inspirations-Repos: `inspiration/repos.json` füllen (mind. 1, empfohlen 5–6 GitHub-URLs), dann `node tools/analyze_repo.mjs` → `inspiration/report.md`; Ideen daraus mit `inspiration/prompt.md`. Lizenzklasse pro Repo, Code nur bei permissiver Lizenz mit NOTICE

## Starten
- Firefox: `about:debugging` → Dieser Firefox → Temporäres Add-on laden → `manifest.json`
- Brave/Chrome: `brave://extensions` → Entwicklermodus → Entpackte Erweiterung laden → diesen Ordner
- Danach neuen Tab öffnen. KI: ✨ → bei „Ollama nicht erreichbar“ den Hinweis befolgen (Ollama starten; in Chromium ging ein echtes Ollama ohne Zusatzeinstellung, in Firefox ist `OLLAMA_ORIGINS="moz-extension://*,chrome-extension://*"` + Neustart von Ollama die sichere Wahl).

## Eigene Daten (Seed)
`npm run seed` liest Kopien aller lokalen Browser und schreibt `data/seed-*.json` (in `.gitignore`).
Einstellungen → „Seed importieren“ legt die Ordner und fehlende Lesezeichen an, `seed-dials.json` füttert die Schnellwahl zusätzlich zum Verlauf.

## Tests
`npm test` (Logik), `npm run lint` (web-ext). Browser-Test: `tools/e2e-chromium.mjs <Erweiterungsordner ohne Leerzeichen im Pfad>` (Playwright) startet die Abläufe `tools/e2e/{board,bar,ai,capture,widgets}.mjs` einzeln mit frischem Profil; einer allein: `node tools/e2e/widgets.mjs <Ordner>`. Umgebung: `PIKA_MOCK_PORT` (Port des Ollama-Ersatzes, Standard 11434), `PIKA_CHROMIUM` (eigene Chromium-Datei). Berechtigungen: `node tools/check-permissions.mjs`.
