# Proposal

## Why

Die Leiste soll beim täglichen Besuchen der immergleichen Seiten helfen, nicht nur im Neuen Tab. Der Nutzer hat „Beides“ gewählt: Neuer Tab und jede Webseite. Außerdem sollen offene Tabs per KI in die Live-Tab-Ordner sortiert werden, ohne dass die Standardfunktionen des Browsers nötig sind.

## What Changes

- Einklappbare Leiste auf Webseiten (Content-Script, Shadow DOM), standardmäßig aus. Beim Einschalten fragt der Browser nach der Berechtigung für alle Seiten (optional, nicht beim Installieren).
- KI-Sortierung der offenen Tabs in Live-Tab-Ordner mit Vorschau, Bestätigung und Rückgängig. Ollama/OpenRouter wie in v0.2.
- Echte Browser-Tab-Gruppen nur als optionales Extra, wenn die API vorhanden ist.

## Capabilities

### New Capabilities
- `page-bar`: Leiste auf Webseiten mit Opt-in, Ausnahmen und sicherer Isolierung.
- `ai-tab-sorting`: KI-Vorschläge für Live-Tab-Ordner mit Vorschau und Rückgängig.

### Modified Capabilities
<!-- keine -->

## Impact

- Neu: `content/bar.js`, Berechtigungsfluss in den Einstellungen; Nachrichten `getBar`, `getTabs` (aus v0.4).
- `manifest.json`: `optional_host_permissions` und `scripting`; `data_collection_permissions` prüfen.
- `lib/ai.js`, `newtab.js` (Sortier-Dialog in die Leiste).
- Version: v0.5. Branch `agent/claude/v05-leiste-webseiten-ki`, aufbauend auf v0.4.
