# Spec Delta

## Purpose
pika-own soll im Browser und in der eigenen Oberfläche sofort wiedererkennbar sein: ein eigenes Programmsymbol und ein einheitlicher, lokal eingebetteter Symbolsatz statt gemischter Zeichen.

## ADDED Requirements

### Requirement: Eigenes Programmsymbol
Die Erweiterung MUST ein eigenes Programmsymbol in 16, 32, 48 und 128 px mitbringen und es für Erweiterungsliste, Werkzeugleisten-Knopf und Benachrichtigungen verwenden. Das Symbol MUST ein eigener Entwurf sein und DARF NICHT Logo, Farben oder Form eines anderen Produkts nachbilden.

#### Scenario: Werkzeugleiste
- **WHEN** die Erweiterung installiert ist
- **THEN** zeigt der Werkzeugleisten-Knopf das neue Symbol, auch bei 16 px scharf erkennbar

### Requirement: Einheitlicher Symbolsatz
Kopf, Leiste und Menüs MUST Symbole aus einem gemeinsamen Satz verwenden, die in der Erweiterung eingebettet sind. Es DARF dafür nichts aus dem Netz geladen werden. Jedes Symbol ohne Text MUST einen zugänglichen Namen haben (`aria-label` und Tooltip). Symbole MUST die aktuelle Textfarbe übernehmen, damit sie in Hell, Dunkel und Pitch Black lesbar sind.

#### Scenario: Screenreader
- **WHEN** ein Screenreader den Kopf vorliest
- **THEN** hört der Nutzer zu jedem Knopf einen Namen wie „Einstellungen“, nicht ein Sonderzeichen

#### Scenario: Dunkles Design
- **WHEN** das Design auf Dunkel steht
- **THEN** sind alle Symbole hell und gut sichtbar
