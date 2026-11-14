# Spec Delta

## Purpose
Widgets sollen nach einem festen Vertrag gebaut werden, sicher speichern und einander nicht stören, damit neue Widgets als eine Datei mit einem Test entstehen können.

## ADDED Requirements

### Requirement: Registry mit festem Vertrag
Jeder Widget-Typ MUST in genau einer Datei liegen und `type`, `label`, `title(w)`, `fields(defaults)`, `defaults()` und `render(w, ctx)` bereitstellen. Eine einzige Liste MUST alle Typen registrieren; Hinzufügen-Dialog, Titel und Darstellung MUST nur aus dieser Liste kommen.

#### Scenario: Neuer Typ
- **WHEN** eine neue Datei registriert wird
- **THEN** erscheint der Typ im Dialog „Widget hinzufügen“, ohne dass `newtab.js` geändert wird

#### Scenario: Bestehende Widgets
- **WHEN** ein Nutzer von v0.6 aktualisiert
- **THEN** sehen Uhr, Countdown, Timer/Pomodoro, Zähler und Textbausteine aus wie vorher und behalten ihre Werte

### Requirement: Sicherer Schreibweg je Widget
Ein Widget MUST seine Daten nur über `patch(fn)` ändern, das unter der Speichersperre genau dieses Widget aktualisiert. Änderungen anderer Tabs oder des Hintergrunds an anderen Feldern MUST dabei erhalten bleiben.

#### Scenario: Zwei Neue Tabs
- **WHEN** in Tab A der Zähler erhöht wird und danach in Tab B ein Textbaustein geändert wird
- **THEN** sind beide Änderungen gespeichert

### Requirement: Fehler-Isolation
Wirft ein Widget beim Zeichnen oder Ticken einen Fehler, MUST an seiner Stelle eine Fehlerkarte mit „Entfernen“ erscheinen. Board, Leiste und andere Widgets MUST weiter funktionieren.

#### Scenario: Kaputte Daten
- **WHEN** ein Widget mit beschädigten Daten gespeichert ist
- **THEN** zeigt nur dieses Widget eine Fehlerkarte, alles andere bleibt bedienbar
