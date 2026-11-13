# Spec Delta

## Purpose
Die Schnellwahl zeigt die wirklich besuchten Seiten des Nutzers, nicht Platzhalter.

## ADDED Requirements

### Requirement: Echter Verlauf
Die Schnellwahl MUSS den Verlauf des Browsers nutzen, in dem sie läuft (history-API), mit Besuchszahl und Unterseiten pro Domain.

#### Scenario: Meistbesucht
- **WHEN** der Nutzer die Leiste „Meistbesucht“ öffnet
- **THEN** stehen die Domains nach echter Besuchszahl absteigend dort, Unterseiten per Rechtsklick

### Requirement: Verlauf anderer Browser nur lokal
Verlauf anderer Browser DARF nur über den lokalen Seed-Import einfließen. Die Seed-Dateien DÜRFEN NICHT ins Repository gelangen.

#### Scenario: Seed nicht committet
- **WHEN** ein Commit vorbereitet wird
- **THEN** enthält er keine Datei aus `data/`

### Requirement: Ausblenden
Der Nutzer MUSS Domains aus der Schnellwahl ausblenden können; ausgeblendete Domains erscheinen nirgends in der Leiste.

#### Scenario: Domain ausblenden
- **WHEN** der Nutzer eine Domain ausblendet
- **THEN** verschwindet sie aus allen Leisten und taucht nach Neuladen nicht wieder auf
