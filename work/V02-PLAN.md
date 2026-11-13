# v0.2 Plan (Recherche 2026-11-11, 6 Teams + Synthese + Gegenpruefung)

Kernwert: pika-own wertet lokal und kostenlos deinen Verlauf und deine offenen Tabs aus ("woran habe ich gearbeitet") und macht daraus Weitermachen-Karten und Sortier-Vorschlaege, statt wie OneTab, Toby oder Session Buddy nur Zustand zu speichern, ohne Konto, ohne Abo und mit Auto-Snapshot gegen Datenverlust.

## Finaler MVP (nach Gegenpruefung)
- 0. Spike (vor Bau): Ollama aus Background erreichbar? OLLAMA_ORIGINS-Test auf Chrome und Firefox, host_permissions in Firefox pruefen.
- 1. Ollama-Provider (nur Ollama): Verbindungscheck 2s-Timeout, Hilfebox 'aus ODER CORS' mit Kopier-Button OLLAMA_ORIGINS, Modellliste /api/tags mit Radio 'verwenden' und Groesse. Keine Badges aus /api/show ausser tools/embedding falls trivial.
- 2. OpenRouter minimal: manuelles Key-Feld (storage.local), Dropdown ':free'-Modelle live aus /models, Datenschutz-Opt-in-Hinweis, 429 -> Fallback Ollama. Kein OAuth, kein Limit-Balken.
- 3. Modell-Download: kleine feste Empfehlungsliste (qwen3:4b Default, qwen3:1.7b, gemma3:4b) ohne Lizenz-Badges, /api/pull NDJSON-Fortschrittsbalken, Abbrechen per AbortController, Loeschen mit Bestaetigung. Groessen zur Laufzeit/als Richtwert.
- 4. KI-Tab-Sortierung auf Provider umstellen: JSON-Schema per format (Ollama), bei OpenRouter JSON im Prompt plus Parser-Validierung, temperature 0, nur Vorschlag mit Bestaetigung, kein Auto-Move.
- 5. Weitermachen-Karten: Verlauf nach Zeitluecken clustern, Titel heuristisch, optional per LLM veredelt, Ein-Klick-Wiederoeffnen. Funktioniert auch ohne KI.
- 6. Auto-Sicherheits-Snapshot: rollierend, Ein-Klick-Rueckgaengig (S, keine Abhaengigkeit, starkes Verkaufsargument).
- 7. Inspiration: nur tools/analyze_repo.mjs (Node, URL-Regex, Lizenz-Klasse, Prompt-Template mit <readme>-Tags) plus repos.json und inspiration/prompt.md fuer den Entwicklungsprozess; Pflicht = Workflow-Regel 'mind. 1 Repo, 5-6 empfohlen' im README/Build-Prozess. In-Extension-UI, Konsolidierungsrunde, PAT-Feld, Roadmap-Karte nach v0.2.
- Gestrichen/verschoben: OAuth-PKCE, Limit-Balken, Browser-lokaler Provider, Lizenz-Badges, Hardware-Hinweise pro Modell, /api/ps-Punkt, Probe-Sortierung-Button, Embeddings, Sprache, Tote-Links, Cloud-Modelle.

## Einwaende
- Ueberzogen: 7 MVP-Punkte, davon 4x Provider/Modell-UI (Punkte 1-4) vor jedem Nutzerwert. Ein 'MVP' mit OAuth-PKCE, Modell-Download-UI, Limit-Balken und Empfehlungsliste ist v0.3, nicht MVP.
- OpenRouter-OAuth-PKCE ist unnoetig im MVP: manuelles Key-Feld reicht. launchWebAuthFlow plus Redirect-URL-Registrierung ist Firefox/Chrome-unterschiedlich und ungeprueft. Limit-Balken aus /key ist Kosmetik.
- Pflicht-Gate Inspirations-Repos als L-Aufwand mit hartem Onboarding-Block ist falsch priorisiert: Es ist eine Entwickler-Hilfe fuer den Bauenden, kein Endnutzer-Feature einer Tab-Extension. Endnutzer haben keine 5-6 Inspirations-Repos; das Gate blockiert jeden Nutzer der Extension. Der 'Pflicht'-Wunsch gilt dem Entwicklungsprozess (Nutzer gibt Repos an Claude), nicht dem Produkt.
- Falsche Annahme: 'Pflicht' = In-Extension-Gate. Die Quelle (tools/analyze_repo.mjs, Node) deckt den Wunsch billiger ab; die Extension-Variante braucht LLM-Aufruf, GitHub-Rate-Limit, PAT-Feld, Konsolidierungsrunde, Lizenz-Badges.
- Download-UI: /api/pull-Fehlerformat, 403-Verhalten und think:false sind unverifiziert; trotzdem als fester Plan. Empfehlungsliste mit Lizenz-Badges widerspricht dem eigenen Risiko 'Lizenzen nicht verifiziert' - Badges erst nach Pruefung, also im MVP weglassen.
- Widerspruch: core_value verspricht lokal+kostenlos, aber Punkt 6 (Weitermachen-Karten) haengt von Punkt 5 und LLM ab; ohne laufendes Ollama ist der Kernwert tot. Zeitluecken-Clustering braucht gar kein LLM, nur der Titel; heuristischer Titel (haeufigste Domain/Titelwoerter) als Fallback fehlt.
- Kein Test-/Verifikationsschritt fuer den riskantesten Teil (CORS/OLLAMA_ORIGINS, Firefox host_permissions) vor dem Bau; sollte Punkt 0 sein (30-Minuten-Spike).
- OpenRouter-Datenschutz: Tab-Titel/URLs gehen an Dritte; Opt-in ist erwaehnt, aber Provider-Wahl ist im MVP nicht noetig, wenn Ollama der Default ist.
- Browser-lokaler Provider steht in Punkt 1, obwohl Embeddings/Transformers.js ausdruecklich auf 'later' verschoben sind; Widerspruch, streichen.
- Sidebery-Konflikt/Tab-Gruppen: Sortier-Vorschlag mit Drag/Bestaetigung ist ok, aber Batching, JSON-Schema-enum, response_format-Branching sind Optimierungen; ein Provider-Pfad (Ollama format) reicht zuerst.

## Spaeter
- Embeddings (Ollama embeddinggemma, Transformers.js multilingual-e5-small in Offscreen-Dokument/Extension-Seite): semantische Suche, Dubletten, Auto-Projekte per Clustering. Grund: Vektorspeicher, IndexedDB, WebGPU/CSP-Risiken ungeklaert; erst nach stabiler Provider-Schicht (v0.3)
- Sprache/Diktat (Web Speech API, whisper.cpp-Server, Moonshine): nicht Kernaufgabe, Firefox nur Preview, Mikrofon-Architektur ungeklaert (Phase 2, Opt-in). Parakeet nur als Doku-Hinweis, nicht einbauen
- Tote-Link-Pruefung (HEAD-Requests, breite host_permissions), verschluesselter Export/WebDAV-Sync, Seitenarchivierung, Ollama-Cloud-Modelle (Datenschutz, Key im Browser nicht empfohlen, Limits unbelegt), Modell-Galerie aus ollama.com (keine offizielle API)

## UI-Konzept
Ein Einstellungs-Tab 'KI' mit drei Karten. (1) Status-Kopf: Anbieter-Umschalter Ollama / OpenRouter, gruener/roter Punkt, bei Fehler Hilfebox mit beiden Ursachen (nicht gestartet / CORS), Kopier-Button fuer OLLAMA_ORIGINS und Link ollama.com/download. (2) Ollama-Modellkarten als Raster: Name, GB-Groesse, Badges (tools, vision, embedding, Kontext), Lizenz-Badge, Punkt 'geladen' (/api/ps), Radio 'verwenden'. Empfohlene, noch nicht installierte Modelle erscheinen ausgegraut mit Button 'Herunterladen (2,5 GB)'; Klick startet /api/pull, der Button wird zum Fortschrittsbalken (completed/total des aktuellen digest, Prozent, MB/s) mit 'Abbrechen' und Hinweis 'Fortsetzen moeglich'; danach /api/tags neu laden. Loeschen im Menue mit Bestaetigung. Hardware-Hinweis pro Modell ('ca. 4 GB VRAM, CPU moeglich aber langsamer'). (3) OpenRouter: Button 'Mit OpenRouter anmelden' (PKCE), Key-Feld als Fallback, Dropdown nur ':free'-Modelle mit Badges (Kontext, JSON-faehig, 0 USD), Tageslimit-Balken (used/limit aus /key) mit Hinweis '50/Tag, ab 10 Credits 1000/Tag', Datenschutzhinweis dass Titel/URLs den Rechner verlassen. Test-Button 'Probe-Sortierung mit 5 Beispiel-Tabs' zeigt Ergebnis live.

## Risiken
- CORS/OLLAMA_ORIGINS: Nutzer scheitern am ersten Start; Fehlerursache im Browser nicht unterscheidbar (nicht gestartet vs. blockiert). Mitigation: gefuehrte Hilfebox, Aufrufe nur aus Background; HTTP-403-Verhalten ist nicht in Docs belegt, vor Release testen.
- Firefox-MV3: ob host_permissions bei Installation automatisch gewaehrt werden, blieb ungeprueft (MDN lieferte 404); Firefox-Moz-UUID pro Profil zufaellig, daher Wildcard noetig. Auf beiden Browsern testen.
- Datenschutz: OpenRouter-Free-Modelle koennen Prompts fuer Training nutzen (nicht geprueft); Tab-Titel/URLs verlassen den Rechner. Deutlicher Opt-in-Hinweis, Ollama lokal als Default; API-Key nur in storage.local.
- Free-Limits OpenRouter: 50 Anfragen/Tag ohne gekaufte Credits, 20/min; ':free'-Angebot wechselt taeglich, nie hartkodieren; Fallback auf Ollama zwingend.
- Qwen3 Thinking vs. JSON-Format: Feld think:false nicht gegen Thinking-Doku verifiziert; Sortierung mit Schema-Validierung und Parser-Fallback absichern.
- Lizenzen nicht primaer verifiziert: Qwen3 vermutlich Apache-2.0, Gemma-Terms (nicht OSI, gated), Llama Community License, Nemotron/Liquid ungeprueft; Badges erst nach Pruefung auf HuggingFace anzeigen. Repo-Lizenz-Klassifikation ist keine Rechtsberatung.
- GitHub-Rate-Limit 60/h pro IP (geteilte IPs) und ungeprueft ob raw.githubusercontent.com CORS/Limit-Verhalten wie erwartet; Teststufe per Testaufruf vor Bau. Ollama-Modellgroessen schwanken je Quelle, zur Laufzeit lesen.
- Tab-Konflikte mit Sidebery/Tree Style Tabs beim Verschieben; deshalb nur Vorschlag, kein Auto-Move. Scope-Risiko: L-Aufwand beim Inspirations-Feature und 8 Punkte sind viel, bei Zeitnot zuerst Punkt 6 auf Minimalumfang (ohne Konsolidierungsrunde) kuerzen.

Quellen je Team: Workflow-Journal wf_f5dc7ca9-e2a (lokal).
