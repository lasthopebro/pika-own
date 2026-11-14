# Spec Delta

## Purpose
Alle Einstellungen sollen an einem Ort gegliedert und durchsuchbar sein, und Verhalten, das bisher fest im Code steht, soll der Nutzer selbst wählen können.

## ADDED Requirements

### Requirement: Einstellungen mit Abschnitten und Suche
Der Einstellungsdialog MUST die Optionen in Abschnitte gliedern (Aussehen, Leiste, Schnellwahl, Board, Erinnerungen & Timer, Sicherung, KI, Datenschutz). Ein Suchfeld oben MUST beim Tippen nur passende Optionen und deren Abschnitte zeigen; Taste `/` im Dialog MUST das Suchfeld fokussieren. Bestehende Einstellungen MUST mit ihren bisherigen Werten erhalten bleiben.

#### Scenario: Suche
- **WHEN** der Nutzer im Einstellungsdialog `/` drückt und „pomo“ tippt
- **THEN** sind nur die Pomodoro-Optionen und ihr Abschnitt sichtbar

#### Scenario: Alte Werte
- **WHEN** ein Nutzer von v0.5.2 auf v0.6 aktualisiert
- **THEN** zeigt der Dialog seine bisherigen Werte für Design, Hintergrund und Leiste

### Requirement: Neue Optionen mit sicheren Standardwerten
Die Erweiterung MUST diese Optionen anbieten, jeweils mit einem Standardwert, der das bisherige Verhalten beibehält:
- Leiste im Neuen Tab anzeigen (Standard: an)
- Anzahl Schnellwahl-Einträge in der Leiste, 0 bis 20 (Standard: 8)
- Links im Board im neuen Tab öffnen (Standard: aus)
- Löschen einzelner Links bestätigen (Standard: an); ist sie aus, MUST stattdessen eine Meldung mit „Rückgängig“ erscheinen. Ordner MUST immer bestätigt werden.
- Sicherungs-Hinweis nach 7, 14 oder 30 Tagen oder nie (Standard: 14)
- Pomodoro-Standardlängen für neue Timer (Standard: 25 und 5 Minuten)

#### Scenario: Leiste im Neuen Tab aus
- **WHEN** der Nutzer „Leiste im Neuen Tab anzeigen“ ausschaltet
- **THEN** erscheint die Leiste im Neuen Tab nicht mehr, auf Webseiten und in der Seitenleiste bleibt sie unverändert

#### Scenario: Links im neuen Tab
- **WHEN** die Option an ist und der Nutzer ein Lesezeichen im Board anklickt
- **THEN** öffnet es sich in einem neuen Tab und der Neue Tab bleibt offen

#### Scenario: Link ohne Bestätigung löschen
- **WHEN** „Löschen einzelner Links bestätigen“ aus ist und der Nutzer einen Link löscht
- **THEN** ist er sofort weg, und „Rückgängig“ legt ihn am selben Platz wieder an

#### Scenario: Hinweis nie
- **WHEN** der Sicherungs-Hinweis auf „nie“ steht
- **THEN** erscheint kein Hinweis, auch ohne Export

### Requirement: Symbol-Auswahl für Live-Ordner
Das Ändern des Symbols eines Live-Ordners MUST eine Auswahl aus mindestens 24 Emoji in einem Raster anbieten, ein eigenes Zeichen MUST weiter möglich sein. Die Auswahl MUST mit Tastatur bedienbar sein.

#### Scenario: Symbol wählen
- **WHEN** der Nutzer im Ordner-Menü „Symbol …“ wählt und ein Emoji anklickt
- **THEN** zeigt die Leiste den Ordner sofort mit dem neuen Symbol
