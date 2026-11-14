# Spec Delta

## Purpose
Neue Nutzer finden die zeitsparenden Wege, sehen jederzeit, was die Erweiterung darf, und räumen leere Ordner mit einem Klick auf.

## ADDED Requirements

### Requirement: Erste-Schritte-Tour
Beim ersten Start MUST eine Tour mit höchstens 5 Schritten erscheinen. Sie MUST jederzeit per Esc oder „Überspringen“ endbar sein und danach nicht erneut automatisch starten. Schritte, deren Ziel fehlt, MUST übersprungen werden. Der Nutzer MUST sie über die Palette wiederholen können.

#### Scenario: Überspringen
- **WHEN** die Tour beim ersten Start erscheint und der Nutzer Esc drückt
- **THEN** schließt sie und startet beim nächsten Neuen Tab nicht wieder

#### Scenario: Wiederholen
- **WHEN** der Nutzer in der Palette „Tour“ wählt
- **THEN** beginnt die Tour von vorn, auch wenn sie schon gesehen wurde

#### Scenario: Ziel fehlt
- **WHEN** ein Schritt auf ein Element zeigt, das in der aktuellen Ansicht nicht existiert
- **THEN** wird dieser Schritt übersprungen und die Tour läuft weiter

### Requirement: Berechtigungsseite
Die Einstellungen MUST eine Seite zeigen, die jede Berechtigung der Erweiterung mit einer Begründung in einem Satz und dem Status (erteilt oder nicht) aufführt. Optionale Berechtigungen MUST sich dort widerrufen lassen. Zu jeder Berechtigung des Manifests MUST ein Klartext vorhanden sein.

#### Scenario: Optionale widerrufen
- **WHEN** der Nutzer bei der optionalen Webseiten-Berechtigung „Widerrufen“ klickt
- **THEN** ist sie danach als nicht erteilt gezeigt und die Leiste auf Webseiten erscheint nicht mehr

#### Scenario: Klartext fehlt
- **WHEN** das Manifest eine Berechtigung ohne Eintrag in `lib/perms-info.js` enthält
- **THEN** schlägt `npm test` fehl und nennt die Berechtigung

### Requirement: Leere Ordner
Eine einschaltbare Zusatzspalte „Leere Ordner“ MUST Ordner zeigen, die weder Lesezeichen noch nicht-leere Unterordner enthalten. „Alle aufräumen“ MUST sie in den Papierkorb verschieben, vorher die Anzahl nennen und Rückgängig anbieten. Die Spalte MUST standardmäßig aus sein.

#### Scenario: Aufräumen
- **WHEN** drei leere Ordner existieren und der Nutzer „Alle aufräumen“ bestätigt
- **THEN** liegen sie im Papierkorb und eine Meldung bietet Rückgängig an

#### Scenario: Verschachtelt leer
- **WHEN** ein Ordner nur einen leeren Unterordner enthält
- **THEN** gilt auch er als leer
