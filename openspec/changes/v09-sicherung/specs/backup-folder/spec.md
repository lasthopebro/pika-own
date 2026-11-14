# Spec Delta

## Purpose
Sicherungen verlassen das Browserprofil automatisch und lassen sich auf einem leeren Profil mit einem Klick zurückholen, ohne Konto und ohne neue Berechtigung.

## ADDED Requirements

### Requirement: Sicherungsordner
Auf Browsern mit `showDirectoryPicker` MUST der Nutzer einen Ordner wählen können. Der Neue Tab MUST dort höchstens eine Sicherungsdatei je Kalendertag und Gerät schreiben und nur die neuesten 5 eigenen Dateien behalten. Fremde Dateien im Ordner MUST NOT verändert oder gelöscht werden. Die Datei MUST den API-Schlüssel nicht enthalten. Auf Browsern ohne die API MUST die Ordnerwahl unsichtbar sein.

#### Scenario: Erste Sicherung des Tages
- **WHEN** der Ordnerzugriff erteilt ist und der erste Neue Tab des Tages öffnet
- **THEN** liegt im Ordner genau eine neue Datei `pika-<gerät>-<Datum>.json` und ältere als die neuesten 5 eigenen sind entfernt

#### Scenario: Zugriff abgelaufen
- **WHEN** der Browser nach einem Neustart den Zugriff erneut verlangt
- **THEN** zeigt der Neue Tab „Zugriff erneuern“ und schreibt nichts, bis der Nutzer klickt

#### Scenario: Fremde Datei
- **WHEN** im Ordner eine Datei `urlaub.jpg` liegt
- **THEN** bleibt sie nach jeder Sicherung unverändert vorhanden

### Requirement: Sicherung wiederherstellen
Bei einem frischen Profil MUST eine Karte „Sicherung wiederherstellen“ erscheinen. Sie MUST eine Datei aus dem Sicherungsordner (wo möglich) oder per Dateiwahl anbieten und vor dem Einspielen eine Bestätigung verlangen. Vorhandene Lesezeichen MUST NOT gelöscht werden.

#### Scenario: Neuer Rechner
- **WHEN** ein leeres Profil den Neuen Tab öffnet und der Nutzer eine gültige Sicherungsdatei wählt und bestätigt
- **THEN** sind Zustand und fehlende Lesezeichen wieder da und die Karte verschwindet

#### Scenario: Ungültige Datei
- **WHEN** der Nutzer eine Datei wählt, die keine pika-own-Sicherung ist
- **THEN** erscheint eine Fehlermeldung und nichts wird verändert

### Requirement: Hinweis nur bei Bedarf
Der Hinweis auf eine Sicherungsdatei außerhalb des Profils MUST schweigen, solange der Sicherungsordner in den letzten 2 Tagen beschrieben wurde.

#### Scenario: Ordner aktiv
- **WHEN** die letzte Ordner-Sicherung 1 Tag alt ist
- **THEN** erscheint kein Sicherungshinweis
