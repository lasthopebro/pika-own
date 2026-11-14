# Spec Delta

## Purpose
Menüs und Kopf sollen ruhig, vollständig und ohne Maus bedienbar sein, damit häufige Vorgänge schnell gehen und seltene nicht im Weg stehen.

## ADDED Requirements

### Requirement: Ruhiger Kopf mit Mehr-Menü
Der Kopf des Neuen Tabs MUST höchstens sechs Symbol-Knöpfe für häufige Vorgänge zeigen (Suche, Auswahl, Ansicht, Alle Tabs speichern, KI, Einstellungen). Seltene Vorgänge (Workspace anlegen und bearbeiten, Widget hinzufügen, Tab-Sitzungen) MUST über ein „Mehr“-Menü erreichbar sein. Häufige Vorgänge DÜRFEN dadurch NICHT mehr Klicks brauchen als vorher.

#### Scenario: Widget hinzufügen
- **WHEN** der Nutzer auf „Mehr“ und dann „Widget hinzufügen“ klickt
- **THEN** öffnet sich derselbe Dialog wie bisher

### Requirement: Menüs mit Tastatur
Jedes Kontextmenü in Board und Leiste MUST mit der Tastatur bedienbar sein: Beim Öffnen hat der erste Eintrag den Fokus, Pfeil hoch/runter wechselt, Enter führt aus, Esc schließt und gibt den Fokus an das auslösende Element zurück. Das Menü MUST die Rolle `menu` und die Einträge die Rolle `menuitem` haben.

#### Scenario: Menü per Tastatur
- **WHEN** der Nutzer ein Menü öffnet, zweimal Pfeil runter und Enter drückt
- **THEN** wird der dritte Eintrag ausgeführt und das Menü geschlossen

#### Scenario: Esc
- **WHEN** der Nutzer im offenen Menü Esc drückt
- **THEN** schließt das Menü und der Fokus liegt wieder auf dem auslösenden Element

### Requirement: Erweitertes Lesezeichen-Menü
Das Menü eines Lesezeichens im Board MUST zusätzlich „In Live-Ordner legen ▸“ (Liste der eigenen Live-Ordner), „Link kopieren“, „Als Markdown kopieren“ und „In neuem Fenster öffnen“ anbieten.

#### Scenario: In Live-Ordner legen
- **WHEN** der Nutzer „In Live-Ordner legen ▸ Projekt“ wählt
- **THEN** liegt die Adresse im Live-Ordner „Projekt“ und in keinem anderen

#### Scenario: Als Markdown kopieren
- **WHEN** der Nutzer „Als Markdown kopieren“ wählt
- **THEN** enthält die Zwischenablage `[Titel](Adresse)`

### Requirement: Browser-Kontextmenü gebündelt
Das Kontextmenü des Browsers MUST genau einen Eintrag „pika-own“ mit Untermenü zeigen: Seite speichern, In Live-Ordner ▸ (eigene Ordner, aktuell gehalten), Alle Tabs als Ordner, Alle Tabs als Sitzung. Auf einem Link MUST „Seite speichern“ den Link speichern.

#### Scenario: Neuer Live-Ordner erscheint
- **WHEN** der Nutzer einen Live-Ordner anlegt
- **THEN** erscheint er ohne Neustart im Untermenü „In Live-Ordner ▸“

### Requirement: Tastenkürzel
Die Erweiterung MUST Tastenkürzel für „Seite speichern“, „Seitenleiste öffnen“ und „Leiste ein-/ausklappen“ über die Kürzel-Verwaltung des Browsers anbieten, sodass der Nutzer sie dort ändern kann. Taste `?` im Neuen Tab MUST eine Übersicht aller Kürzel zeigen.

#### Scenario: Kürzel-Übersicht
- **WHEN** der Nutzer im Neuen Tab `?` drückt
- **THEN** öffnet sich ein Dialog mit allen Kürzeln und dem Hinweis, wo sie geändert werden
