# Spec Delta

## Purpose
Die Leiste ist auf Wunsch auf jeder Webseite erreichbar, ohne Seiten zu stören und ohne Seiteninhalt zu lesen.

## ADDED Requirements

### Requirement: Opt-in mit Berechtigung
Die Leiste auf Webseiten MUSS ausgeschaltet starten. Beim Einschalten MUSS die Berechtigung für alle Seiten angefragt werden. Wird sie verweigert, MUSS der Schalter aus bleiben und eine Meldung den Grund nennen.

#### Scenario: Einschalten
- **WHEN** der Nutzer den Schalter aktiviert und die Berechtigung erteilt
- **THEN** erscheint die Leiste nach dem nächsten Laden jeder Webseite

#### Scenario: Verweigert
- **WHEN** der Nutzer die Berechtigung ablehnt
- **THEN** bleibt der Schalter aus und es erscheint keine Leiste

### Requirement: Isolierung und Ausnahmen
Die Leiste MUSS in einem abgeschotteten Shadow DOM laufen, nur im obersten Frame erscheinen, keine Inline-Skripte nutzen und den Seiteninhalt weder lesen noch verändern. Auf Browser-Seiten (`about:`, `chrome:`, Web Store, PDF-Viewer) erscheint sie nicht. Der Nutzer MUSS Domains ausschließen können.

#### Scenario: Strenge CSP
- **WHEN** eine Seite mit strenger Content-Security-Policy lädt
- **THEN** ist die Leiste sichtbar und es gibt keine CSP-Verstöße in der Konsole

#### Scenario: Browser-Seite
- **WHEN** `about:blank` oder der Web Store geöffnet wird
- **THEN** erscheint keine Leiste und es entsteht kein Fehler

### Requirement: Vollbild und Einklappen
Die Leiste MUSS im Vollbild verschwinden und danach wiederkommen. Sie MUSS einklappbar sein (Tastenkürzel und Klick) und den Seiteninhalt nicht verschieben.

#### Scenario: Video im Vollbild
- **WHEN** ein Video in den Vollbildmodus geht
- **THEN** ist die Leiste ausgeblendet und nach Esc wieder da

### Requirement: Eingeschränkter Datenzugriff
Das Content-Script DARF nur Nachrichten an den Hintergrund senden und bekommt einen schlanken Ausschnitt der Daten; es nutzt weder Verlauf, Lesezeichen noch Tabs direkt.

#### Scenario: Datenfluss
- **WHEN** die Leiste Daten braucht
- **THEN** fragt sie den Hintergrund per Nachricht und erhält nur die für die Anzeige nötigen Felder
