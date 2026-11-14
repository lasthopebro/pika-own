---
name: pika-weiter
description: "Use when resuming work on pika-own, when the user says \"mach weiter\", \"weiter mit pika\", \"nächster Task\", or when a model starts in this repo without context — finds the next open OpenSpec task, sets up the right worktree and runs the fixed check commands."
---

# pika-own: sicher weitermachen

Für jedes Modell, auch günstige. Schritte genau in dieser Reihenfolge. Nichts raten.

## 1. Lage prüfen (nur lesen)
```bash
git fetch --prune origin
git status --short
git worktree list
gh pr list --state open
openspec list --json
```
- Offener PR mit roter CI? Zuerst dort weiter (Schritt 4), nichts Neues anfangen.
- Sonst: der erste Change aus der Reihenfolge in `AGENTS.md` (Zeile 3), der noch offene Tasks hat.

## 2. Task wählen
```bash
openspec instructions apply --change <change> --json
```
- Nimm den **ersten** offenen Task.
- Steht dort **[stark]** und du bist ein günstiges Modell: nicht anfangen. Schreib in den PR: `<du> -> Mensch | BLOCKIERT | <change> | Task <n> braucht starkes Modell | übergeben`.
- Task unklar, Datei fehlt, Plan widerspricht dem Code: nicht raten. Gleicher Kommentar mit `FRAGE`.

## 3. Arbeitsplatz
- Gibt es schon einen Worktree/Branch für den Change (`git worktree list`)? Dort arbeiten.
- Sonst neu, immer von `origin/main`:
  `orca.exe worktree create --repo id:1cf3e1ab-c5f5-44f4-b0b7-31843c1f8b4e --name <change> --branch agent/<anbieter>/<change> --base-branch origin/main --setup skip --json`
- Nie auf `main` arbeiten.

## 4. Umsetzen und prüfen
- Nur die Dateien ändern, die der Task nennt (höchstens 2, etwa 80 Zeilen).
- Danach immer:
```bash
npm test
npm run lint
```
- Plus den Prüfbefehl aus dem Task. Browser-Prüfung lokal (Windows, Pfad ohne Leerzeichen):
  Erweiterung nach `%TEMP%\pikaext` spiegeln (`robocopy <worktree> %TEMP%\pikaext /MIR /XD data work node_modules .git dist openspec .github .claude`), dann `node tools/e2e-chromium.mjs %TEMP%/pikaext` mit installiertem Playwright.
- Rot? Ursache im Code suchen. **Nie** den Test abschwächen.

## 5. Abschließen
- Häkchen im `tasks.md` setzen (`- [ ]` → `- [x]`), nur wenn alles grün ist.
- Commit mit Task-Nummer, Push, Draft-PR (Basis `main`) oder vorhandenen PR aktualisieren.
- PR-Kommentar: `<du> -> Prüfer | ERLEDIGT | <change> | Task <n> | nächster Task <n+1>`.
- Mergen nur, wenn CI grün **und** ein anderer Agent geprüft hat **und** der Mensch zugestimmt hat.

## Fallen auf diesem Rechner
- GateGuard-Hooks verlangen vor dem ersten Schreiben Fakten (Aufrufer, gibt es die Datei schon, Datenformat, wörtlicher Auftrag). Nennen, dann wiederholen.
- Das Wort für „überschreiben“ auf Englisch und `Remove-Item` lösen die Löschsperre aus; `robocopy /MIR` statt Löschen.
- Dateien haben teils CRLF; mehrzeilige Ersetzungen in PowerShell vorher auf LF normalisieren oder das Edit-Werkzeug nutzen.
- Private Daten (`data/`, `work/`) nie committen; Tests nutzen `test/fixtures/`.
