# Spec Delta

## Purpose
Die tägliche Sicherung liegt im Browserprofil und schützt nicht vor dessen Verlust, deshalb erinnert die Erweiterung an eine Kopie außerhalb.

## ADDED Requirements

### Requirement: Erinnerung an Kopie außerhalb des Profils
Liegt die letzte Dateikopie (Export) länger als 14 Tage zurück oder gibt es keine, MUSS ein dezenter Hinweis mit einem Klick auf „Jetzt exportieren“ erscheinen. Der Hinweis MUSS sich für 14 Tage schließen lassen und DARF NICHT blockieren.

#### Scenario: Keine Kopie
- **WHEN** noch nie exportiert wurde
- **THEN** erscheint der Hinweis mit „Jetzt exportieren“

#### Scenario: Hinweis geschlossen
- **WHEN** der Nutzer den Hinweis schließt
- **THEN** erscheint er 14 Tage lang nicht erneut

#### Scenario: Export ohne Daten nach außen
- **WHEN** der Nutzer exportiert
- **THEN** entsteht nur eine lokale Datei, es wird nichts gesendet
