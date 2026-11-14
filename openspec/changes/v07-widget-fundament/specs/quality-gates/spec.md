# Spec Delta

## Purpose
Prüfungen sollen Fehler früh und einzeln zeigen und unerlaubte Berechtigungen aufhalten, damit auch günstigere Modelle sicher Änderungen beitragen können.

## ADDED Requirements

### Requirement: Vertragstest für alle Widgets
Ein automatischer Test MUST jedes registrierte Widget prüfen: Pflichtfelder vorhanden, `defaults()` als JSON speicherbar, `title()` mit Standardwerten ein nicht leerer Text, `render()` mit Standardwerten und mit leeren Daten ohne Ausnahme.

#### Scenario: Unvollständiges Widget
- **WHEN** ein Widget ohne `defaults` registriert wird
- **THEN** schlägt `npm test` mit dem Namen des Widgets fehl

### Requirement: Unabhängige E2E-Abläufe
Die Browser-Prüfung MUST aus unabhängigen Abläufen bestehen, die je ein frisches Profil starten. Ein fehlschlagender Ablauf DARF NICHT die anderen verhindern; am Ende MUST eine Zusammenfassung mit allen Ergebnissen stehen, und der Exit-Code MUST bei einem Fehler ungleich 0 sein. Der Port des Ollama-Ersatzes MUST über eine Umgebungsvariable wählbar sein.

#### Scenario: Ein Ablauf fällt
- **WHEN** der Ablauf „Leiste“ fehlschlägt
- **THEN** laufen „Board“, „KI“ und „Widgets“ trotzdem und erscheinen in der Zusammenfassung

### Requirement: Berechtigungs-Wächter
Die CI MUST scheitern, wenn das Manifest eine Berechtigung enthält, die nicht in `docs/BERECHTIGUNGEN.md` mit Begründung steht, oder dort eine aufgeführt ist, die im Manifest fehlt.

#### Scenario: Neue Berechtigung ohne Begründung
- **WHEN** ein PR `"geolocation"` zu `permissions` hinzufügt, ohne die Liste zu ergänzen
- **THEN** ist die CI rot mit dem Namen der Berechtigung
