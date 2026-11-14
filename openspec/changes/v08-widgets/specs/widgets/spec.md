# Spec Delta

## Purpose
Kleine lokale Werkzeuge im Neuen Tab (Notiz, Todo mit Fälligkeit, Fotorahmen), die ohne Konto und ohne neue Berechtigungen auskommen.

## ADDED Requirements

### Requirement: Notiz
Das Notiz-Widget MUST ein mehrzeiliges Textfeld zeigen und den Text spätestens 1 Sekunde nach der letzten Eingabe speichern. Der Text MUST einen Neustart und einen zweiten offenen Neuen Tab überstehen.

#### Scenario: Tippen und neu laden
- **WHEN** der Nutzer „Milch kaufen“ tippt und nach 2 Sekunden den Tab neu lädt
- **THEN** steht „Milch kaufen“ im Widget

### Requirement: Todo mit Fälligkeit
Das Todo-Widget MUST Punkte per Enter hinzufügen, abhaken und löschen können. Ein Punkt MAY ein Fälligkeitsdatum haben. Offene fällige und überfällige Punkte MUST oben stehen und markiert sein; erledigte stehen unten. Für jeden Punkt, der fällig wird, MUST genau eine Systembenachrichtigung erscheinen, auch ohne offenen Neuen Tab.

#### Scenario: Überfällig oben
- **WHEN** ein Punkt mit gestrigem Datum und einer ohne Datum offen sind
- **THEN** steht der überfällige oben und ist markiert

#### Scenario: Eine Benachrichtigung
- **WHEN** die Fälligkeit eines Punkts erreicht ist
- **THEN** erscheint genau eine Benachrichtigung mit dem Text des Punkts

### Requirement: Fotorahmen nur mit Adressen
Der Fotorahmen MUST bis zu 6 Bild-Adressen annehmen (nur `https:`), sie in der eingestellten Wechselzeit (Standard 30 s) zeigen und „Einpassen“ oder „Füllen“ erlauben. Es DÜRFEN NICHT Bilddaten im Speicher oder in der Sicherung landen. Ein nicht ladbares Bild MUST übersprungen werden.

#### Scenario: Ungültige Adresse
- **WHEN** der Nutzer `javascript:alert(1)` oder `http://…` einträgt
- **THEN** wird die Adresse abgelehnt

#### Scenario: Sicherung klein
- **WHEN** drei Bilder eingetragen sind und eine Sicherung exportiert wird
- **THEN** enthält die Datei nur die drei Adressen
