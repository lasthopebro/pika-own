# Spec Delta

## Purpose
Die Galerie zeigt Ordner als Vollbild-Kacheln mit klarer Navigation, damit der Nutzer immer weiß, wo er ist, und mit einer Taste zurückkommt.

## ADDED Requirements

### Requirement: Navigation mit Brotkrumen
Die Galerie MUST mit Home beginnen und jeden Ordner als Kachel zeigen, die ihn öffnet. Über den Kacheln MUST ein Pfad (Home › Ordner › Unterordner) stehen, dessen Stufen anklickbar sind. Esc MUST eine Ebene höher gehen; auf Home MUST Esc die Galerie schließen.

#### Scenario: Ebene hoch
- **WHEN** der Nutzer in einem Unterordner Esc drückt
- **THEN** zeigt die Galerie den übergeordneten Ordner

#### Scenario: Galerie verlassen
- **WHEN** der Nutzer auf Home Esc drückt
- **THEN** zeigt der Neue Tab wieder das Board

### Requirement: Suche je Ordner
Die Galerie MUST ein Suchfeld bieten, das nur die Kacheln des gezeigten Ordners nach Titel und Adresse filtert, ohne Beachtung der Groß-/Kleinschreibung. Ein leeres Feld MUST alle Kacheln zeigen. Pfeiltasten und Enter MUST die Treffer bedienen.

#### Scenario: Filtern
- **WHEN** der Nutzer in einem Ordner mit 20 Einträgen „git“ eintippt
- **THEN** bleiben nur Einträge mit „git“ im Titel oder in der Adresse sichtbar

### Requirement: Ordner-Sprung
Die Palette MUST in der Galerie mit dem Präfix `/` einen Ordner wählbar machen; Enter MUST die Galerie in diesen Ordner setzen.

#### Scenario: Sprung
- **WHEN** der Nutzer in der Galerie `/` und einen Ordnernamen eingibt und Enter drückt
- **THEN** zeigt die Galerie diesen Ordner, der Pfad stimmt

### Requirement: Raster, Liste, Dichte
Die Galerie MUST als Raster oder Liste und in drei Dichten darstellbar sein; beide Einstellungen MUST einen Neustart überstehen.

#### Scenario: Liste merken
- **WHEN** der Nutzer „Liste“ und „klein“ wählt und den Tab neu lädt
- **THEN** erscheint die Galerie wieder als kleine Liste

### Requirement: Ordner als Ablageziele
Eine Seitenleiste MUST die Ordner des Workspace zeigen. Eine auf einen dieser Ordner gezogene Kachel MUST das Lesezeichen dorthin verschieben und eine Rückgängig-Meldung zeigen.

#### Scenario: Ablegen
- **WHEN** der Nutzer ein Lesezeichen auf einen Ordner der Seitenleiste zieht
- **THEN** liegt es in diesem Ordner und die Meldung bietet Rückgängig an
