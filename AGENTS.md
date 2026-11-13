# AGENTS.md – pika-own (für Claude, Hermes, Codex, OpenCode und Menschen)

Lesezeichen-Board als Neuer Tab plus horizontale Leiste, Firefox und Chromium (MV3, Vanilla-JS, kein Build). Pläne: `openspec/changes/<change>/` (proposal, specs, design, tasks). Stand und Reihenfolge: v0.3 → v0.4 → v0.5.

## Regeln (hart)
1. **Eigener Code.** Kein Code, Name, Logo, Text oder Grafik von Pikamark. Vorbild ist nur das Aussehen und Verhalten laut Spezifikation. Fremde Repos nur mit permissiver Lizenz und NOTICE (siehe `inspiration/`).
2. **Nutzerdaten bleiben lokal.** `data/` und `work/private/` nie committen. Keine Schlüssel oder Tokens im Repo.
3. **Ein Auftrag = ein Branch = ein Worktree = ein PR.** Name `agent/<anbieter>/<change>`. Vorher `git branch --list` und `git worktree list`, vorhandenes weiterverwenden (Skill `vibe-branch-hygiene`). Nie direkt auf `main`.
4. **Gestapelte PRs sind erlaubt:** v0.4 baut auf dem v0.3-Branch auf, v0.5 auf v0.4; Basis des PR ist der Vorgänger-Branch, nicht `main`.
5. **Kleinste vollständige Änderung** (Skill `ponytail`). Neue Logik bekommt einen Test.
6. **Klick-Budget:** Kein häufiger Vorgang braucht mehr Klicks als die Standard-Lesezeichenleiste.
7. **Alles Gesendete an KI-Anbieter:** nur Titel und Domains; Anbieter „lokal/extern“ vorher anzeigen.

## Team (vorhandene Agenten wiederverwenden)
| Rolle | Agent / Skill | Aufgabe |
|---|---|---|
| Orchestrator | Claude Hauptsitzung, `vibe-orca-parallel` | wählt den nächsten offenen Change, startet Worker, sammelt Ergebnis |
| Planer | `ecc:planner`, `opsx:propose` | Specs und Tasks, höchstens 3 Fragen pro Runde |
| Architekt | `ecc:architect` | Datenfluss, Berechtigungen, Firefox/Chromium-Unterschiede |
| Bauer | Worker mit `opsx:apply`, `ponytail` | setzt einen Change um, ein Worktree |
| Prüfer | `ecc:code-reviewer`, `ecc:security-reviewer` | prüft Diff, Content-Script und Berechtigungen |
| QA | `ecc:e2e-runner`, `ecc:tdd-guide` | Playwright-Chromium, Firefox per `web-ext run`, Abnahme laut Spezifikation |
Bauer und Prüfer sind immer verschiedene Agenten.

## Übergabe
Kommentare in Issue/PR: `von -> an | TYP | Change | Status | nächste Aktion`. Nach jedem Schritt Häkchen in `tasks.md` und kurzer Kommentar. Wiederaufnahme nach Unterbrechung: „lies AGENTS.md, nimm den ersten offenen Change mit offenen Tasks“.

## Befehle
- Tests: `npm test`; Lint: `npm run lint`
- Chromium-E2E: `tools/e2e-chromium.mjs <Erweiterungsordner ohne Leerzeichen im Pfad>` (Playwright)
- Firefox: `npx web-ext run -s <Ordner>` mit Testprofil, Checkliste im jeweiligen Issue
- Change umsetzen: `/opsx:apply <change>`; fertig prüfen: `openspec validate <change>`

## Definition of Done (pro Change)
Alle Tasks abgehakt, `npm test` und Lint ohne Fehler, Chromium-E2E grün, Firefox-Checkliste abgehakt, README aktuell, Draft-PR auf „Ready“.
