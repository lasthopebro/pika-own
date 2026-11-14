# Spec Delta

## Purpose
Ordnerinhalte lassen sich in gängigen Textformaten weitergeben, und eine erfolglose Suche führt mit einem Klick in die Websuche.

## ADDED Requirements

### Requirement: Kopierformate
Das Ordner-Menü MUST „Kopieren als“ mit Klartext, Markdown, HTML, CSV und Baum anbieten. Unterordner MUST in der Ausgabe erhalten bleiben (Überschriften, Einrückung oder Pfadspalte). Sonderzeichen in Titeln MUST maskiert werden, sodass die Ausgabe gültig bleibt. Nach dem Kopieren MUST eine Meldung die Anzahl der Links nennen.

#### Scenario: Markdown
- **WHEN** ein Ordner „Doku“ mit zwei Lesezeichen und dem Unterordner „Alt“ mit einem Lesezeichen als Markdown kopiert wird
- **THEN** enthält die Zwischenablage zwei Listenzeilen, eine Überschrift „Alt“ und eine Listenzeile darunter

#### Scenario: CSV mit Komma
- **WHEN** ein Titel `Eins, zwei "drei"` kopiert wird
- **THEN** steht er als `"Eins, zwei ""drei"""` in der CSV-Zeile

#### Scenario: Auswahl
- **WHEN** der Nutzer im Auswahlmodus drei Lesezeichen wählt und „Als Markdown“ klickt
- **THEN** liegen drei Markdown-Zeilen in Board-Reihenfolge in der Zwischenablage

### Requirement: Im Web suchen
Die Palette MUST als letzten Eintrag „Im Web suchen: <Text>“ zeigen, solange Text eingegeben ist, und bei null Treffern als einzigen. Enter MUST die Suche in einem neuen Tab mit der Standardsuchmaschine des Browsers öffnen. Die Berechtigung `search` MUST optional sein und erst beim ersten Einsatz angefragt werden. Wird sie abgelehnt, MUST der Eintrag eine Meldung zeigen und nichts öffnen. Fehlt die API im Browser, MUST der Eintrag unsichtbar sein.

#### Scenario: Keine Treffer
- **WHEN** der Nutzer in der Palette „qwxzy“ eingibt und es keine Treffer gibt
- **THEN** ist „Im Web suchen: qwxzy“ der einzige Eintrag

#### Scenario: Berechtigung abgelehnt
- **WHEN** der Nutzer die Anfrage ablehnt
- **THEN** öffnet sich kein Tab und eine Meldung nennt den Grund

#### Scenario: Gewährt
- **WHEN** der Nutzer die Anfrage annimmt
- **THEN** öffnet ein neuer Tab die Suche mit „qwxzy“
