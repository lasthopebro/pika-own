# Entscheidungsbaum: pika-own (eigene Lesezeichen-Board-Erweiterung)

Gilt für alle Agenten (Claude-Subagenten, Hermes). Jeder Knoten hat EINEN Eingang, EINEN Ausgang (Datei) und feste Abbruchregeln.
Ergebnis nach `work/<knoten>.json`, Status in `work/STATE.json`:
`{"N1":{"status":"todo|done|blocked","output":"work/N1-inventory.json","reason":""}}`

## Harte Regeln (überschreiben alles)
- R1 Clean-room: Kein Code aus Pikamark (oder anderen Closed-Source-Erweiterungen) kopieren, entpacken oder anpassen. Keine Lizenzprüfung umgehen. Funktionen werden aus öffentlichen Beschreibungen mit eigenem Code gebaut.
- R2 Fremder Code nur, wenn die Lizenz es erlaubt (MIT/BSD/MPL/GPL, Quelle in NOTICE). Unklare Lizenz = nur Ideenquelle.
- R3 Nutzerdaten (Verlauf, Lesezeichen, Profile) nur lesend und nur von KOPIEN (laufende Browser sperren Dateien). Inhalte nie ins Repo: `data/` und `work/private/` stehen in `.gitignore`. Berichte enthalten Pfade und Zählwerte, keine URLs.
- R4 Keine Schlüssel/Tokens ins Repo. OpenRouter-Key nur in den lokalen Erweiterungs-Einstellungen.
- R5 Prozesse als Argumentliste starten, nie als Shell-String.

## Baum
```
N0 START
 N1 Inventar (lokal)                    -> work/N1-inventory.json
     Browser/Profile gefunden? ja -> N2 | nein -> STOP, Nutzer fragen
 N2 Erweiterungen lokal                 -> work/N2-extensions.json
     je Erweiterung: id, Name, Version, Pfad, Lizenz (manifest/LICENSE), offen|geschlossen
     ├─ Name enthält "pikamark" -> nur melden vorhanden/nicht, NICHT öffnen (R1)
     ├─ Lizenz offen -> "Referenz" (darf gelesen werden)
     └─ unklar/geschlossen -> "nur Idee", nicht lesen
 N3 Online-Recherche (parallel zu N1/N2)-> work/N3-research.json
     a) offene Referenzprojekte (Board, Schnellwahl, Seitenleiste, Tab-Sessions): Repo, Lizenz
     b) APIs: history, topSites, bookmarks, sidebar_action/sidePanel, chrome_url_overrides (Firefox vs Chromium)
     c) KI: Ollama (/api/tags, /api/chat), OpenRouter (/api/v1/models, /chat/completions)
     d) Pikamark nur öffentliche Seiten (Website, Handbuch): Funktionsliste
 N4 ENTSCHEIDUNG (Merge N1+N2+N3)       -> work/N4-decision.json
     je Feature genau eine Wahl: passende offene Referenz -> "adaptieren"; sonst "selbst bauen"
     KI nötig -> Ollama zuerst, OpenRouter zweiter Provider, gleiches Interface
 N5 Seed (privat)                       -> data/seed.json (nicht im Repo)
     Lesezeichen aller Browser dedupliziert; Ordner nach Vorlage fmhy aus Firefox-Profil "555555555555" (= Profiles/MFgXhOmb.Profil 1)
     Verlauf -> Top-Domains + Unterseiten für Schnellwahl (Kontextmenü je Domain)
 N6 BAU nur nach Kommando "erstelle ein erstes echtes laufendes repo"
     Gerüst MV3 -> Board -> Schnellwahl -> eigene Seitenleisten-Ansichten -> Tags/Kommentare/Erinnerungen
     -> Workspaces -> Sessions -> Backups -> Look -> Widgets -> Massen-Umbenennen -> KI
     je Schritt: Test, grün, Commit (kein Secret, kein data/)
 N7 Abnahme: Firefox (about:debugging, temporär), danach Brave (entpackt laden)
```

## Hermes-Übergabe
Nimm den ersten Knoten mit `todo`, dessen Eingänge `done` sind, und halte R1-R5 ein. Bei `blocked` nichts raten: Grund in STATE.json, Nutzer fragen.
