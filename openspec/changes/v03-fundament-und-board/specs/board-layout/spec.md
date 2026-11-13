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

### Requirement: Ansichten
Das Board MUSS die Ansichten Spalten, Galerie (Raster und Liste), Kompakte Zeilen und Zentriert (große Uhr über Ordner-Kacheln) bieten; Taste V wechselt. Die Ansicht MUSS pro Workspace speicherbar sein.

#### Scenario: Ansicht wechseln
- **WHEN** der Nutzer auf dem Board V drückt
- **THEN** wechselt die Ansicht ohne Neuladen, Lesezeichen bleiben unverändert

### Requirement: Echte Lesezeichen
Das Board MUSS die echten Lesezeichen des Browsers lesen und ändern, keine Kopie. Eine Lesezeichen-Änderung MUSS nur auf Wunsch des Nutzers passieren. Nach dem Entfernen der Erweiterung MÜSSEN alle Lesezeichen erhalten bleiben; nur Zusatzdaten (Notizen, Tags, Farben, Layout) gehen verloren, deshalb MUSS ein Export vorher möglich sein.

#### Scenario: Erweiterung entfernt
- **WHEN** die Erweiterung deinstalliert wird
- **THEN** liegen alle Lesezeichen unverändert im Browser

### Requirement: Toolbar-Popup
Ein Popup am Symbol der Erweiterung MUSS Lesezeichen durchsuchen und „Diesen Tab speichern“ mit Ordnerauswahl anbieten, ohne den Neuen Tab zu öffnen.

#### Scenario: Tab speichern
- **WHEN** der Nutzer im Popup einen Ordner wählt und „Speichern“ klickt
- **THEN** liegt der aktuelle Tab als Lesezeichen in diesem Ordner

### Requirement: Papierkorb und Rückgängig
Gelöschte Lesezeichen, Ordner und Notizen MÜSSEN mit Rückgängig wiederherstellbar sein, solange die Meldung sichtbar ist, und danach für 7 Tage im Papierkorb liegen (höchstens 20 Einträge, mit Größengrenze). Fehlt der Elternordner, MUSS die Wiederherstellung in die Lesezeichenleiste gehen.

#### Scenario: Wiederherstellen
- **WHEN** der Nutzer einen gelöschten Ordner aus dem Papierkorb wiederherstellt
- **THEN** ist er samt Inhalt wieder da, auch wenn der Elternordner fehlt (dann in der Lesezeichenleiste)

### Requirement: Dubletten-Finder
Das Board MUSS Lesezeichen mit gleicher Zieladresse finden, die Anzahl zeigen und auf Wunsch je Adresse eines behalten, wobei Tags und Favoriten übernommen werden; ein Klick macht es rückgängig.

#### Scenario: Aufräumen
- **WHEN** der Nutzer „Je eines behalten“ wählt
- **THEN** bleibt pro Adresse ein Lesezeichen mit allen Tags und Favoriten, und „Rückgängig“ stellt den Zustand davor wieder her

### Requirement: Entdeckungs-Ordner
Optionale Ordner „Zuletzt hinzugefügt“ und „Meistbesucht“ MÜSSEN wie normale Spalten auf dem Board stehen können.

#### Scenario: Einschalten
- **WHEN** der Nutzer „Meistbesucht“ aktiviert
- **THEN** erscheint eine Spalte mit den am häufigsten besuchten Seiten

### Requirement: Auswahlmodus und Massenaktionen
Taste S MUSS den Auswahlmodus öffnen (Klick, Umschalt-Klick, Ziehen). Aus einer Leiste MÜSSEN Favorit, Farbe, Verschieben, Löschen und „Links kopieren“ gehen. „Alle öffnen“ MUSS einen ganzen Ordner mit einem Klick öffnen, „In Ordner verschieben“ MUSS ohne Ziehen gehen.

#### Scenario: Mehrere verschieben
- **WHEN** der Nutzer drei Einträge auswählt und „In Ordner verschieben“ wählt
- **THEN** liegen alle drei im Zielordner

### Requirement: Notizen und Taste N
Notizen und Checklisten MÜSSEN neben den Ordnern stehen; Taste N legt eine neue Notiz an.

#### Scenario: Neue Notiz
- **WHEN** der Nutzer N drückt
- **THEN** erscheint eine leere Notiz mit Fokus

### Requirement: Aussehen
Hell, Dunkel und System, mindestens fünf Akzentfarben sowie freie Akzentfarbe, Pitch Black, Schriftart (Sans, Mono, Serif), Hintergründe (Vorgabe, Foto, Farbe, Verlauf) mit Intensität, Körnung und Parallax MÜSSEN einstellbar sein, und jeder Workspace MUSS ein eigenes Aussehen haben können.

#### Scenario: Look pro Workspace
- **WHEN** der Nutzer für Workspace „Arbeit“ Pitch Black und Mono wählt
- **THEN** behält Workspace „Privat“ sein eigenes Aussehen

### Requirement: Sprachen
Die Oberfläche MUSS mindestens Deutsch und Englisch bieten, unabhängig von der Browsersprache; weitere Sprachen KÖNNEN folgen.

#### Scenario: Sprache wechseln
- **WHEN** der Nutzer „English“ wählt
- **THEN** sind alle Beschriftungen englisch, ohne den Browser umzustellen
