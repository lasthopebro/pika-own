# Spec Delta

## Purpose
Die restlichen Funktionen des Vorbilds werden eigenständig nachgebaut, damit die private Einzelversion funktional gleichwertig ist.

## ADDED Requirements

### Requirement: Galerie-Vollbild
Die Galerie MUSS Home (Lesezeichenleiste) und jeden Ordner als Kacheln zeigen, mit Brotkrumen, „Zu Ordner springen“, Suche je Ordner, Raster oder Liste, Dichte und einer Seitenleiste mit Widgets und Ordnern als Ablageziele. Esc geht eine Ebene hoch.

#### Scenario: Ebene hoch
- **WHEN** der Nutzer in einem Unterordner Esc drückt
- **THEN** zeigt die Galerie den übergeordneten Ordner, von oben aus verlässt Esc die Galerie

### Requirement: Werkzeugleiste und Angepinnte
Eine Werkzeugleiste MUSS schwebend, oben angedockt, unten angedockt oder aus einstellbar sein und Erinnerungen, Sitzungen, Papierkorb und Einstellungen enthalten. Angepinnte Links (bis 16 je Workspace) MÜSSEN in Werkzeugleiste oder Kopf stehen, mit Namen, Icons oder automatisch.

#### Scenario: Angepinnten Link öffnen
- **WHEN** der Nutzer in der Werkzeugleiste auf das Icon eines angepinnten Links klickt
- **THEN** öffnet sich die Seite

### Requirement: Kopieren und Einfügen
Kopieren MUSS Klartext, Markdown, HTML, CSV und eine Baumdarstellung bieten. „Links kopieren“ MUSS alle URLs der Auswahl in Board-Reihenfolge liefern. Strg+V auf dem Board außerhalb von Textfeldern MUSS jeden http(s)-Link der Zwischenablage als Lesezeichen anlegen; hineingezogene Links MÜSSEN im Zielordner landen (mehrere auf leerer Fläche in einem neuen Ordner).

#### Scenario: Einfügen
- **WHEN** der Nutzer drei Links in der Zwischenablage hat und Strg+V auf dem Board drückt
- **THEN** entstehen drei Lesezeichen und eine Rückgängig-Meldung erscheint

### Requirement: Tabs speichern
Ein Knopf MUSS die Tabs des Fensters ohne Browser-Seiten in einen neuen Ordner legen (optionale Berechtigung beim ersten Mal). Das Popup MUSS bei bereits gespeicherter Seite „Gespeichert in …“ mit Verschieben und „Kopie speichern“ zeigen, bei zwei oder mehr speicherbaren Tabs „Alle Tabs speichern“ und ohne Eingabe die 8 neuesten Lesezeichen.

#### Scenario: Bereits gespeichert
- **WHEN** die aktuelle Seite schon ein Lesezeichen ist
- **THEN** zeigt das Popup den Ordner und „Verschieben“ statt „Speichern“

### Requirement: Eigenen Neuen Tab behalten
Der Nutzer MUSS den Neuen Tab des Browsers behalten und das Board über das Popup öffnen können; Suche und „Tab speichern“ im Popup MÜSSEN gleich funktionieren.

#### Scenario: Board über Popup
- **WHEN** der Nutzer im Popup „Board öffnen“ wählt
- **THEN** öffnet sich das Board unter einer eigenen Adresse, die er als Lesezeichen setzen kann

### Requirement: Widgets vertiefen
Der Timer MUSS einen Pomodoro-Modus (Fokus, Pause, Überspringen) haben. Das Foto-Widget MUSS bis zu 6 Bilder mit Einpassen, Form, Position, Wechsel (jeder neue Tab, jede Minute, täglich) und einem Klick-Link zeigen; die Bilder bleiben lokal und stehen nicht in Sicherungen.

#### Scenario: Pomodoro
- **WHEN** der Fokus-Abschnitt endet
- **THEN** startet die Pause und der Nutzer kann sie überspringen

### Requirement: Systembenachrichtigungen
Erinnerungen und Timer-Abschnitte MÜSSEN als Systembenachrichtigung erscheinen können (optionale Berechtigungen beim Einschalten, standardmäßig aus), auch wenn kein Tab offen ist. Gesperrte Items DÜRFEN weder Namen noch Nachricht zeigen. Wird die Berechtigung abgelehnt, MUSS der Schalter aus bleiben und den Grund nennen. Auf Browsern ohne die API MUSS die Funktion unsichtbar sein.

#### Scenario: Erinnerung fällig
- **WHEN** eine Erinnerung fällig wird und der Schalter an ist
- **THEN** erscheint eine Benachrichtigung; Klick öffnet einen neuen Tab mit Zeigen, Erledigt und „1 Tag später“

### Requirement: Sicherungsordner und Erinnerung
Auf Chromium MUSS ein frei gewählter Ordner für Sicherungen angebunden werden können (Unterordner, Datei je Snapshot, eine Dateigruppe je Gerät, Gerätename änderbar, Zugriff erneuern). Ein Hinweis MUSS an eine Kopie außerhalb des Browserprofils erinnern (nach 1, 7, 14 Tagen, danach alle 30), und auf neuem Rechner mit leerem Board MUSS eine Karte „Sicherung wiederherstellen“ erscheinen.

#### Scenario: Zugriff abgelaufen
- **WHEN** der Browser nach einem Neustart den Ordnerzugriff erneut verlangt
- **THEN** zeigt die Oberfläche „Zugriff erneuern“ und schreibt nichts, bis er erteilt ist

### Requirement: Einstellungen und Tour
Die Einstellungen MÜSSEN eine Suche (Taste /) und eine Berechtigungsseite haben. Eine Erste-Schritte-Tour MUSS überspringbar und wiederholbar sein. Ein Zusatzordner „Leere Ordner“ MUSS einschaltbar sein.

#### Scenario: Einstellung suchen
- **WHEN** der Nutzer in den Einstellungen / drückt und einen Namen tippt
- **THEN** öffnet Enter die erste Fundstelle und hebt die Zeile hervor
