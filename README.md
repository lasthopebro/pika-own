# pika-own

Eigenes Lesezeichen-Board als Neuer-Tab-Seite plus Seitenleiste. Firefox und Chromium/Brave (Manifest V3), ohne Build-Schritt, ohne Konto.
Eigener Code, clean-room: Vorbild ist nur Aussehen und Verhalten, kein fremder Code, siehe `PLAN-DECISIONTREE.md` (Regeln R1-R5).

## Installieren (Release 0.5.1)
1. Zip aus den [Releases](https://github.com/lasthopebro/pika-own/releases) entpacken (oder Repository klonen).
2. Brave/Chrome: `brave://extensions` → Entwicklermodus → Entpackte Erweiterung laden → entpackten Ordner wählen.
3. Firefox: `about:debugging` → Dieser Firefox → Temporäres Add-on laden → `manifest.json` (nach Neustart erneut nötig, solange nicht signiert).
4. Neuen Tab öffnen. Für KI: Ollama installieren und starten, dann ✨ → Modell wählen oder laden.

## Leiste und Live-Tab-Ordner (v0.4/v0.5)
- Oben im Neuen Tab: Live-Tab-Ordner, deine Lesezeichenleiste und die meistbesuchten Seiten, wie eine Lesezeichenleiste. Zu breit → „»“.
- **Live-Tab-Ordner:** ＋ legt einen benannten Ordner an (Symbol änderbar). Im Ordner-Menü: Tab hinzufügen, öffnen ohne Duplikat (vorhandener Tab wird fokussiert), als Sitzung speichern, umbenennen. Die Zuordnung gilt pro URL und überlebt Neustarts.
- **✨ Tabs sortieren:** KI schlägt Themen vor, „In Live-Ordner übernehmen“, „Rückgängig“ stellt den Stand davor wieder her.
- **Leiste auf Webseiten:** Einstellungen → „Leiste auf Webseiten einschalten“ (fragt um Zugriff auf alle Seiten; ohne Zustimmung bleibt sie aus). Ausblenden pro Domain, Einklappen mit Alt+Umschalt+B, im Vollbild aus. Nur ein kleiner Ausschnitt (Titel, Domains, Ordner) geht an die Seite, nie der volle Zustand.

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
`npm test` (Logik), `npm run lint` (web-ext). Browser-Test: `tools/e2e-chromium.mjs <Erweiterungsordner ohne Leerzeichen im Pfad>` mit installiertem Playwright.
