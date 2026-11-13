# Spec Delta

## Purpose
Das Board bietet Werkzeugleiste, Spalten, Ordner, Workspaces, Sitzungen und Widgets mit dem Funktionsumfang des Vorbilds. Alle Pro-Funktionen sind ohne Lizenzprüfung frei.

## ADDED Requirements

### Requirement: Werkzeugleiste
Das Board MUSS eine Werkzeugleiste mit Favoriten-Filter, Ausblenden, Farbfilter, Tag-Filter, Ordner anlegen, Auswahlmodus, Suche (Taste F), Sortierung (Manuell, A–Z, Zuletzt), Layout, Workspace-Menü, Raster/Galerie und Einstellungen bieten.

#### Scenario: Suche per Taste
- **WHEN** der Nutzer auf dem Board F drückt
- **THEN** hat das Suchfeld den Fokus ohne weiteren Klick

#### Scenario: Sortierung
- **WHEN** der Nutzer „A–Z“ wählt
- **THEN** sind die Einträge jeder Spalte alphabetisch geordnet, ohne die gespeicherte manuelle Reihenfolge zu überschreiben

### Requirement: Spalten und verschachtelte Ordner
Spalten MÜSSEN getönt sein, Emoji-Überschrift und Farbpunkt tragen. Ordner MÜSSEN verschachtelt und per Drag-and-drop verschiebbar sein. Ein Ordner darf nie in sich selbst oder einen Unterordner verschoben werden.

#### Scenario: Zyklus verhindert
- **WHEN** der Nutzer einen Ordner in seinen eigenen Unterordner zieht
- **THEN** passiert nichts und eine Meldung erklärt es

### Requirement: Workspaces
Workspaces MÜSSEN über denselben Lesezeichen liegen und per Menü wechselbar, anlegbar, umbenennbar und löschbar sein.

#### Scenario: Wechsel
- **WHEN** der Nutzer im Menü einen anderen Workspace wählt
- **THEN** zeigt das Board dessen Spalten, ohne Lesezeichen zu verändern

### Requirement: Sitzungs-Popover
Ein Popover MUSS das aktuelle Fenster mit Namen speichern (Vorgabe „Sitzung <Datum>“) und gespeicherte Sitzungen mit Alter und Tab-Anzahl auflisten, öffnen und löschen. Es gibt kein künstliches Limit.

#### Scenario: Speichern
- **WHEN** der Nutzer „Speichern“ klickt
- **THEN** erscheint die Sitzung oben in der Liste mit „vor wenigen Sekunden“ und der Tab-Anzahl

### Requirement: Widgets
Es MÜSSEN Uhr mit Zeitzone, Countdown (Tage bis Datum), Zähler mit Ziel-Balken, Notiz/Checkliste, Timer, Textbausteine und ein Foto-Widget verfügbar sein.

#### Scenario: Zähler mit Ziel
- **WHEN** der Nutzer bei einem Zähler mit Ziel 2000 plus 250 klickt
- **THEN** zeigt er den neuen Wert und der Balken füllt sich anteilig

### Requirement: Alle Pro-Funktionen frei
Tags, Kommentare und Erinnerungen, Workspaces, angepinnte Links, automatische Sicherung, Akzentfarbe, Pitch Black, Hintergründe, Sitzungen, eigene Icons, Spaltennamen und -farben, Widgets mit Zeitzonen und Sammelumbenennen MÜSSEN ohne Konto, Schlüssel oder Lizenzprüfung nutzbar sein.

#### Scenario: Frische Installation
- **WHEN** die Erweiterung neu installiert wird
- **THEN** sind alle genannten Funktionen sofort nutzbar

### Requirement: Dateisicherung
Zusätzlich zur rollierenden internen Sicherung (7 Stück) MUSS eine Sicherung als Datei in den Download-Ordner (Unterordner `pika-own`) geschrieben werden können; Wiederherstellen aus Datei MUSS möglich sein.

#### Scenario: Sicherung als Datei
- **WHEN** der Nutzer „Als Datei sichern“ wählt
- **THEN** liegt eine JSON-Datei in `Downloads/pika-own/` und lässt sich importieren

### Requirement: Eigener Code
Die Umsetzung MUSS eigener Code sein. Name, Logo, Texte, Grafiken und Quelltext von Pikamark DÜRFEN NICHT übernommen werden.

#### Scenario: Prüfung vor Merge
- **WHEN** ein PR für diese Funktion geprüft wird
- **THEN** enthält er keinen kopierten Code und keine fremden Marken oder Grafiken
