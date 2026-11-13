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
