# Spec Delta

## Purpose
Offene Tabs lassen sich in eigene, benennbare Ordner mit Symbol legen, die eine Lesezeichenleiste nicht bietet, und überstehen Neustarts.

## ADDED Requirements

### Requirement: Benennbare Ordner mit Symbol
Ein Live-Tab-Ordner MUSS einen Namen und ein Symbol (Emoji oder Bild) tragen und umbenennbar sein.

#### Scenario: Ordner anlegen
- **WHEN** der Nutzer einen Ordner „Recherche“ mit Symbol 🔎 anlegt
- **THEN** erscheint er in der Leiste mit diesem Namen und Symbol

### Requirement: Tabs zuordnen
Tabs MÜSSEN per Ziehen auf den Ordner oder per Kontextmenü „In Ordner“ zugeordnet werden. Die Zuordnung MUSS über URL und Fenster erfolgen, nicht über Tab-IDs.

#### Scenario: Tab schließen
- **WHEN** ein zugeordneter Tab geschlossen wird
- **THEN** bleibt sein Eintrag im Ordner als „gespeichert“ erhalten und ist kein toter Link

#### Scenario: Browser-Neustart
- **WHEN** der Browser neu gestartet wurde
- **THEN** sind Name, Symbol und Einträge erhalten, und ein Klick auf einen Eintrag öffnet ihn oder fokussiert einen offenen Tab mit gleicher URL, ohne Duplikat

### Requirement: Zusammenarbeit mit Sitzungen
Ein Ordner MUSS mit einem Klick als Sitzung gespeichert und eine Sitzung als Ordner geöffnet werden können, ohne Einträge zu verlieren.

#### Scenario: Ordner zu Sitzung
- **WHEN** der Nutzer „Als Sitzung speichern“ wählt
- **THEN** erscheint eine Sitzung mit denselben URLs im Sitzungs-Popover
