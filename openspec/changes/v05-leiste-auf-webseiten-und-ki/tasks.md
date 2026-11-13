# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v05-leiste-webseiten-ki` von `agent/claude/v04-leiste-live-ordner` anlegen, Draft-PR „v0.5 Leiste auf Webseiten und KI-Sortierung“, Basis: v0.4-Branch
- [ ] 1.2 Voraussetzung: v0.4 fertig (`lib/bar.js`, `getBar`, Live-Ordner)

## 2. Leiste auf Webseiten

- [ ] 2.1 `content/bar.js`: Shadow DOM (closed), nur oberster Frame, nutzt `lib/bar.js`, Daten per `getBar`
- [ ] 2.2 Einstellungen: Schalter, `permissions.request` für alle Seiten, Meldung bei Ablehnung
- [ ] 2.3 Laufzeit-Registrierung mit `scripting.registerContentScripts`, beim Ausschalten wieder entfernen
- [ ] 2.4 Einklappen (Griff, Tastenkürzel), Vollbild ausblenden, Ausschlussliste für Domains
- [ ] 2.5 Hintergrund liefert `pika_bar` (schlanker Ausschnitt), nie den vollen Zustand

## 3. KI-Sortierung

- [ ] 3.1 „Tabs sortieren“ in der Leiste: Vorschlag in Live-Ordner, Vorschau, Bestätigung
- [ ] 3.2 Snapshot vor dem Anwenden, „Rückgängig“ stellt ihn wieder her
- [ ] 3.3 Hinweis „lokal/extern“ vor dem Senden; nur Titel und Domains
- [ ] 3.4 Optionale Tab-Gruppen mit Feature-Prüfung

## 4. Prüfung

- [ ] 4.1 Playwright-Fixtures: Seite mit strenger CSP, `about:blank`, Seite mit Vollbild-Video
- [ ] 4.2 Unit-Tests: Ausschlussliste, Snapshot und Rückgängig, schlanker Ausschnitt
- [ ] 4.3 Firefox: `web-ext run` mit sauberem Profil, Berechtigungsdialog von Hand prüfen, Checkliste im Issue
- [ ] 4.4 README, Datenschutzhinweis und Draft-PR aktualisieren, auf „Ready“ setzen
