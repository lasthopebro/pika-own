# pika-own

Eigenes Lesezeichen-Board als Neuer-Tab-Seite plus Seitenleiste. Firefox und Chromium/Brave (Manifest V3), ohne Build-Schritt, ohne Konto.
Clean-room: kein Code aus Pikamark, siehe `PLAN-DECISIONTREE.md` (Regeln R1-R5).

## Funktionen
- Board (Spalten, Galerie `V`), Palette `F` (`>` Aktion, `/` Ordner, `@` Workspace, `#` Tag), Auswahlmodus `S`, Drag & Drop
- Schnellwahl-Leisten aus dem Verlauf (frei konfigurierbar), Rechtsklick = Unterseiten der Domain
- Tags, Kommentare, Erinnerungen, Favoriten, Farbmarkierung, eigene Emoji-Icons, Spaltennamen/-farben
- Workspaces, angepinnte Links, Tab-Sitzungen, tägliche Sicherung (7 Stück) + Export/Import, Sammelumbenennen (Regex, Live-Vorschau)
- Akzentfarbe, Pitch Black, 8 Hintergründe/Foto/Farbe/Verlauf, Körnung, Parallax
- Widgets: Uhr mit Zeitzone, Countdown, Timer, Zähler, Textbausteine
- Seitenleiste mit eigenen Ansichten (Ordner, Tag, Verlauf, Tabs, Suche, Sitzungen, eigene Links)
- KI: Ollama (Modellliste per `/api/tags`) und OpenRouter, sortiert offene Tabs in Themen

## Starten
- Firefox: `about:debugging` → Dieser Firefox → Temporäres Add-on laden → `manifest.json`
- Brave/Chrome: `brave://extensions` → Entwicklermodus → Entpackte Erweiterung laden → diesen Ordner
- Ollama braucht `OLLAMA_ORIGINS="moz-extension://*,chrome-extension://*"` und einen Neustart von Ollama.

## Eigene Daten (Seed)
`npm run seed` liest Kopien aller lokalen Browser und schreibt `data/seed-*.json` (in `.gitignore`).
Einstellungen → „Seed importieren“ legt die Ordner und fehlende Lesezeichen an, `seed-dials.json` füttert die Schnellwahl zusätzlich zum Verlauf.

## Tests
`npm test` (Logik), `npm run lint` (web-ext). Browser-Test: `tools/e2e-chromium.mjs <Erweiterungsordner ohne Leerzeichen im Pfad>` mit installiertem Playwright.
