# Spec Delta

## Purpose
Eine horizontale Leiste im Neuen Tab ersetzt im Alltag die Lesezeichenleiste und bietet dabei Schnellwahl, Lesezeichen und Live-Tabs ohne mehr Klicks.

## ADDED Requirements

### Requirement: Klick-Budget
Öffnen eines Eintrags MUSS mit 1 Klick gehen, Speichern des Fensters mit 1 Klick, Suche mit 0 Klicks (Tastenkürzel). Kein häufiger Vorgang DARF mehr Klicks brauchen als in der Standard-Lesezeichenleiste.

#### Scenario: Eintrag öffnen
- **WHEN** der Nutzer in der Leiste auf eine Schnellwahl klickt
- **THEN** öffnet sich die Seite im aktuellen Tab nach genau einem Klick

#### Scenario: Unterseiten
- **WHEN** der Nutzer mit Rechtsklick auf eine Schnellwahl die Unterseiten öffnet und eine wählt
- **THEN** öffnet sie sich, ohne dass ein weiteres Fenster nötig ist

### Requirement: Drei Zonen und Überlauf
Die Leiste MUSS Schnellwahl, Lesezeichen und Live-Tab-Ordner anzeigen. Passt nicht alles in die Breite, MUSS ein „»“-Menü den Rest zeigen, ohne die Seite horizontal scrollen zu lassen.

#### Scenario: Schmales Fenster
- **WHEN** das Fenster schmaler wird als die Einträge
- **THEN** erscheint „»“ und enthält alle ausgeblendeten Einträge

### Requirement: Leistungsgrenze
Die Leiste MUSS bei 100 Einträgen in unter 200 ms sichtbar sein und darf keine Konsolenfehler erzeugen.

#### Scenario: Viele Einträge
- **WHEN** 100 Einträge geladen werden
- **THEN** ist die Leiste nach höchstens 200 ms vollständig gezeichnet
