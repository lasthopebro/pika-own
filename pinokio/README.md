# pika-own als Pinokio-Launcher (Variante)

**Variante, nicht die Hauptlinie.** Die Hauptlinie (Erweiterung, Plan, OpenSpec) bleibt unverändert. Dieser Ordner enthält nur Launcher-Dateien und ändert keinen Code der Erweiterung.

## Was es tut
Ein Klick pro Aufgabe im Projektordner (eine Ebene über `pinokio/`):
- **In Firefox starten:** `web-ext run` mit frischem Testprofil und geladener Erweiterung
- **Tests:** `npm test`
- **Lint:** `npm run lint`
- **Seed bauen:** `npm run seed` (liest Kopien deiner Browserdaten, schreibt nur nach `data/`, das nicht committet wird)
- **Inspirations-Repos analysieren:** `node tools/analyze_repo.mjs` (füllt vorher `inspiration/repos.json`)
- **Ollama-Modelle anzeigen:** `ollama list`
- **Aktualisieren:** `git pull --ff-only`

## Einrichten
Pinokio findet Launcher unter `C:\pinokio\api\<name>`. Dieser Ordner liegt im Orca-Worktree `pinokio-variante`. Verknüpfe ihn einmal, zum Beispiel per Junction von `C:\pinokio\api\pika-own` auf diesen `pinokio/`-Ordner, oder lege ihn dorthin. Kein Konto, nichts zu installieren (Node und Python kommen von Pinokio).

## API
Keine. Es gibt keinen Server; die Erweiterung hat ihre eigene Oberfläche im Browser.

## Bekannte Grenzen
Das Menü wurde gegen das Beispiel `cli-example` gebaut, aber in Pinokio selbst noch nicht geöffnet. Ein Reset-Skript gibt es nicht, weil keine Abhängigkeiten installiert werden.
