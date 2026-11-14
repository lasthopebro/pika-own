# Spec Delta

## Purpose
Links und offene Tabs sollen mit möglichst wenigen Schritten im Board landen, und jeder Vorgang lässt sich sofort rückgängig machen.

## ADDED Requirements

### Requirement: Links einfügen und hineinziehen
Strg+V auf dem Board und das Hineinziehen eines Links MÜSSEN jede gültige `http(s)`-Adresse im aktuellen Ordner ablegen. Andere Schemata (zum Beispiel `javascript:`) DÜRFEN NICHT abgelegt werden. Danach MUSS eine Meldung mit „Rückgängig“ erscheinen.

#### Scenario: Link einfügen
- **WHEN** der Nutzer eine `https`-Adresse kopiert hat und auf dem Board Strg+V drückt
- **THEN** liegt sie im aktuellen Ordner und eine Rückgängig-Meldung ist sichtbar

#### Scenario: Ungültiger Inhalt
- **WHEN** der Nutzer Text ohne Adresse oder eine `javascript:`-Adresse einfügt
- **THEN** wird nichts abgelegt und nichts verändert

#### Scenario: Rückgängig
- **WHEN** der Nutzer in der Meldung auf „Rückgängig“ klickt
- **THEN** ist der Zustand wie vor dem Einfügen

### Requirement: Alle Tabs als Ordner speichern
Kopf des Neuen Tabs und Kontextmenü der Seite MÜSSEN „Alle Tabs als Ordner speichern“ mit einem Klick anbieten. Gibt es keine http(s)-Tabs, MUSS ein Hinweis erscheinen statt eines leeren Ordners.

#### Scenario: Speichern und zurücknehmen
- **WHEN** der Nutzer im Kopf auf „Alle Tabs als Ordner speichern“ klickt
- **THEN** entsteht ein Ordner „Tabs <Datum>“ mit allen http(s)-Tabs des Fensters, und „Rückgängig“ entfernt ihn wieder

### Requirement: Gespeichert in …
Nach jedem Speichern MUSS der Zielordner genannt werden: im Neuen Tab als Meldung, beim Speichern über das Kontextmenü als Systembenachrichtigung.

#### Scenario: Kontextmenü
- **WHEN** der Nutzer eine Seite über das Kontextmenü speichert
- **THEN** nennt eine Benachrichtigung den Ordner und den Titel

### Requirement: Ziehen auf Live-Ordner
Ein Link, der auf einen eigenen Live-Ordner in der Leiste gezogen wird, MUSS diesem Ordner zugeordnet werden. Lesezeichen-Ordner der Leiste DÜRFEN NICHT als Ziel erscheinen.

#### Scenario: Link ziehen
- **WHEN** der Nutzer einen Link auf einen Live-Ordner zieht
- **THEN** liegt er danach in diesem Ordner, mit Titel, und in keinem anderen

### Requirement: Ordner als Tab-Gruppe
Bietet der Browser Tab-Gruppen an, MUSS das Ordner-Menü „Als Tab-Gruppe öffnen“ zeigen. Offene Tabs MÜSSEN wiederverwendet werden. Ohne API MUSS der Eintrag fehlen.

#### Scenario: Gruppe öffnen
- **WHEN** der Nutzer „Als Tab-Gruppe öffnen“ wählt
- **THEN** liegen alle Einträge des Ordners in einer Gruppe mit dem Ordnernamen, ohne doppelte Tabs
