# Spec Delta

## Purpose
Die KI schlägt vor, in welche Live-Tab-Ordner offene Tabs gehören; der Nutzer behält die Kontrolle und kann zurück.

## ADDED Requirements

### Requirement: Vorschlag mit Bestätigung
Die Sortierung MUSS immer erst einen Vorschlag zeigen und darf Tabs oder Ordner nur nach Bestätigung ändern.

#### Scenario: Vorschlag ansehen
- **WHEN** der Nutzer „Tabs sortieren“ in der Leiste wählt
- **THEN** zeigt eine Vorschau pro Ordner die zugeordneten Tabs, und nichts ist geändert, bevor er bestätigt

### Requirement: Rückgängig
Nach dem Übernehmen MUSS ein Klick den Zustand davor wiederherstellen.

#### Scenario: Rückgängig
- **WHEN** der Nutzer nach dem Übernehmen „Rückgängig“ wählt
- **THEN** sind Ordner und Zuordnungen wie vor der Sortierung

### Requirement: Datensparsamkeit
An KI-Anbieter DÜRFEN nur Titel und Domains der Tabs gehen, und der Nutzer MUSS vorher sehen, ob der Anbieter lokal (Ollama) oder extern (OpenRouter) ist.

#### Scenario: Externer Anbieter
- **WHEN** OpenRouter gewählt ist
- **THEN** zeigt die Oberfläche einen Hinweis „extern“ vor dem Senden

### Requirement: Optionale Tab-Gruppen
Wenn die Browser-API für Tab-Gruppen vorhanden ist, KANN der Nutzer die Vorschläge zusätzlich als echte Gruppen anlegen. Fehlt die API, MUSS die Funktion unsichtbar bleiben, ohne Fehler.

#### Scenario: API fehlt
- **WHEN** der Browser keine Tab-Gruppen-API hat
- **THEN** erscheint die Option nicht und die Sortierung in Ordner funktioniert unverändert
