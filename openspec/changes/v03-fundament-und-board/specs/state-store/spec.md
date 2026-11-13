# Spec Delta

## Purpose
Der gespeicherte Zustand wird von genau einer Stelle geschrieben, damit gleichzeitige Änderungen aus Neuem Tab, Seitenleiste und Hintergrund nie verloren gehen.

## ADDED Requirements

### Requirement: Einziger Schreiber
Alle Änderungen am gespeicherten Zustand MÜSSEN über den Hintergrund laufen und nacheinander angewendet werden. Andere Seiten senden nur die Änderung, nicht den Gesamtzustand.

#### Scenario: Gleichzeitige Änderungen
- **WHEN** der Neue Tab einen Tag setzt und im selben Moment die Seitenleiste eine Ansicht anlegt
- **THEN** sind nach dem Speichern beide Änderungen vorhanden

#### Scenario: Hintergrund schläft
- **WHEN** der Hintergrundprozess beendet war und eine Änderung eintrifft
- **THEN** lädt er den Zustand neu, wendet die Änderung an und speichert, ohne Daten aus einem alten Speicherstand

### Requirement: Schema-Version 2 mit Migration
Der Zustand MUSS eine Versionsnummer tragen. Beim ersten Start mit v1-Daten MUSS vorher eine Sicherung entstehen und danach alles verlustfrei übernommen werden. Die Migration MUSS wiederholbar sein.

#### Scenario: Update von v0.2
- **WHEN** die Erweiterung mit vorhandenen v1-Daten startet
- **THEN** existiert eine Sicherung, alle Tags, Workspaces, Sitzungen und Ansichten sind unverändert vorhanden und die Version ist 2

#### Scenario: Zweiter Start
- **WHEN** die Migration ein zweites Mal läuft
- **THEN** ändert sich nichts
