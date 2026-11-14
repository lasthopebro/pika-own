# Tasks

## 1. Branch und Übergabe

- [ ] 1.1 Vorher `git status`, `git branch --list`, `git worktree list` prüfen; Branch `agent/claude/v05-leiste-webseiten-ki` von `agent/claude/v04-leiste-live-ordner` anlegen, Draft-PR „v0.5 Leiste auf Webseiten und KI-Sortierung“, Basis: v0.4-Branch
  - Prozessschritt, nicht am Code prüfbar
- [ ] 1.2 Voraussetzung: v0.4 fertig (`lib/bar.js`, `getBar`, Live-Ordner)
  - Prozessschritt, nicht am Code prüfbar

## 2. Leiste auf Webseiten

- [x] 2.1 `content/bar.js`: Shadow DOM (closed), nur oberster Frame, nutzt `lib/bar.js`, Daten per `getBar`
- [x] 2.2 Einstellungen: Schalter, `permissions.request` für alle Seiten, Meldung bei Ablehnung
- [x] 2.3 Laufzeit-Registrierung mit `scripting.registerContentScripts`, beim Ausschalten wieder entfernen
- [x] 2.4 Einklappen (Griff, Tastenkürzel), Vollbild ausblenden, Ausschlussliste für Domains
- [x] 2.5 Hintergrund liefert `pika_bar` (schlanker Ausschnitt), nie den vollen Zustand
  - Stand: heißt getBar (schlanker Ausschnitt), nicht pika_bar

## 3. KI-Sortierung

- [x] 3.1 „Tabs sortieren“ in der Leiste: Vorschlag in Live-Ordner, Vorschau, Bestätigung
  - Stand: Knopf in der Leiste öffnet den KI-Dialog im Neuen Tab
- [x] 3.2 Snapshot vor dem Anwenden, „Rückgängig“ stellt ihn wieder her
- [x] 3.3 Hinweis „lokal/extern“ vor dem Senden; nur Titel und Domains
- [x] 3.4 Optionale Tab-Gruppen mit Feature-Prüfung

## 4. Prüfung

- [ ] 4.1 Playwright-Fixtures: Seite mit strenger CSP, `about:blank`, Seite mit Vollbild-Video
  - Stand: teils (strenge CSP); about:blank und Vollbild-Video fehlen
- [ ] 4.2 Unit-Tests: Ausschlussliste, Snapshot und Rückgängig, schlanker Ausschnitt
  - Stand: teils (Ausschlussliste, Snapshot/Rückgängig); schlanker Ausschnitt nur im E2E
- [ ] 4.3 Firefox: `web-ext run` mit sauberem Profil, Berechtigungsdialog von Hand prüfen, Checkliste im Issue
  - Stand: Handprüfung offen
- [x] 4.4 README, Datenschutzhinweis und Draft-PR aktualisieren, auf „Ready“ setzen
