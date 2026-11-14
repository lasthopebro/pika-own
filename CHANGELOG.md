# Änderungen

## Unveröffentlicht
- Berechtigung `topSites` entfernt (ungenutzt).

## 0.10.0
- **Galerie-Vollbild** (Taste `V` oder Kopf-Knopf): Home mit den Spalten des Workspace als Ordner-Kacheln, Klick geht hinein, anklickbare Brotkrumen, `Esc` geht eine Ebene hoch (zuerst wird ein Suchtext geleert) und von Home zurück zum Board; der Fokus kehrt auf die verlassene Kachel zurück.
- **Suche je Ordner** (Titel und Adresse, Groß/Klein egal) mit Pfeiltasten und Enter; Palette `/Ordner` springt in der Galerie in den Ordner. Eine Änderung aus einem anderen Neuen Tab verwirft den Suchtext nicht.
- **Raster oder Liste** und **Dichte** S/M/L, in der Galerie-Leiste und unter Einstellungen → Board (`galleryMode`, `galleryDensity`, ungültige Werte fallen auf Raster/mittel zurück).
- **Ordner als Ablageziele:** Kachel auf einen Ordner der Seitenleiste oder auf eine Ordner-Kachel ziehen verschiebt das Lesezeichen, mit Rückgängig. Mehr als 300 Einträge je Ordner: „Mehr zeigen“.
- Die Spalten-Ansicht „Spalten-Raster“ im Board (früher „Galerie“ genannt) (Einstellungen → Ansicht) bleibt wie sie war; die Taste `V` öffnet jetzt das Vollbild statt sie umzuschalten.
- Keine neue Berechtigung, keine Abhängigkeit. Neu: `lib/gallery.js` mit Tests; Browser-Test `gallery`.

## 0.9.0
- **Sicherungsordner (Chromium/Brave):** Einstellungen → Sicherungsordner → „Ordner wählen“. Der erste Neue Tab des Tages schreibt `pika-<gerät>-<JJJJMMTT>.json` dorthin und behält die neuesten 5 eigenen Dateien; fremde Dateien bleiben unberührt. Nach einem Browserneustart fragt der Browser den Zugriff erneut ab: Hinweis „Zugriff erneuern“, ein Klick. Die Datei enthält den OpenRouter-Schlüssel nicht. Firefox: Abschnitt unsichtbar, Datei-Export bleibt.
- **Karte „Sicherung wiederherstellen“** bei frischem Profil (höchstens 3 Lesezeichen, nie exportiert, keine Widgets/Tags): „Aus Sicherungsordner“ (Chromium) oder „Datei wählen“, mit Bestätigung; ungültige Dateien werden abgelehnt. Vorhandene Lesezeichen werden nie gelöscht.
- Der Hinweis auf eine Sicherungsdatei schweigt, solange der Ordner täglich beschrieben wird.
- Keine neue Berechtigung, keine Abhängigkeit. Neu: `lib/backup-plan.js`, `lib/backup-folder.js` mit Tests; Browser-Test `backup`.

## 0.8.0
- Neue Widgets (Mehr → Widget hinzufügen): **Notiz** (speichert 0,5 s nach der letzten Eingabe), **Todo** (Enter fügt hinzu, Häkchen, Löschen, Fälligkeit optional; überfällige oben und markiert, erledigte unten) und **Fotorahmen** (bis 6 `https:`-Adressen im Wechsel, Einpassen/Füllen; es werden nur Adressen gespeichert, ein nicht ladbares Bild wird übersprungen).
- Todo-Benachrichtigung zur Fälligkeit kommt aus dem Hintergrund (Alarm `todo|<Widget>|<Punkt>`), auch ohne offenen Neuen Tab: genau eine je Punkt, nach einem Browserstart werden Alarme neu gestellt und Überfälliges nachgeholt. Höchstens die nächsten 100 Punkte werden geplant.
- Fotorahmen lehnt `javascript:`, `http:` und andere Schemata ab; der Dialog weist darauf hin, dass der Bild-Server IP-Adresse und Zeitpunkt sieht.
- Keine neue Berechtigung, keine Abhängigkeit. Reine Logik in `lib/todo.js` und `lib/photo.js` mit Tests; Browser-Test `widgets` um Notiz, Todo, Alarm und Fotorahmen erweitert.

## 0.7.0
- Widget-Fundament (keine sichtbare Änderung): jeder Widget-Typ liegt in einer Datei `widgets/<typ>.js` mit festem Vertrag, `widgets/index.js` ist die einzige Liste; Hinzufügen-Dialog, Titel und Darstellung kommen nur daraus.
- Widgets speichern über `patchWidget`/`addWidget`/`removeWidget` (`lib/store.js`) unter der Speichersperre: zwei offene Neue Tabs oder der Pomodoro-Wechsel im Hintergrund überschreiben einander nicht mehr (Zähler, Textbausteine).
- Ein Widget mit beschädigten Daten oder unbekanntem Typ zeigt eine Fehlerkarte mit „Entfernen“; Board und andere Widgets bleiben bedienbar.
- Prüfungen: Vertragstest über alle Widgets, Browser-Test in fünf unabhängigen Abläufen (`tools/e2e/`), Berechtigungs-Wächter (`docs/BERECHTIGUNGEN.md`, `tools/check-permissions.mjs`) in der CI. Keine neue Berechtigung, Datenformat der Widgets unverändert.

## 0.6.0
- Eigenes Programmsymbol (16/32/48/128 px) und einheitlicher Symbolsatz statt gemischter Unicode-Zeichen; alle Symbol-Knöpfe haben einen Namen für Screenreader.
- Ruhiger Kopf: sechs Knöpfe plus „Mehr“-Menü (Workspace, Widget, Sitzungen).
- Alle Menüs per Tastatur (Pfeile, Pos1/Ende, Enter, Esc), mit Symbol und Kürzel; Lesezeichen-Menü mit „In Live-Ordner legen“, „Link kopieren“, „Als Markdown kopieren“, „In neuem Fenster öffnen“.
- Browser-Kontextmenü gebündelt unter „pika-own“ (inkl. „In Live-Ordner“); Tastenkürzel im Manifest (`commands`), Übersicht mit `?`.
- Einstellungen mit Abschnitten und Suche (`/`); neue Optionen: Leiste im Neuen Tab, Schnellwahl-Anzahl, Links im neuen Tab, Löschen bestätigen (mit Rückgängig), Hinweis-Abstand für die Sicherungsdatei, Pomodoro-Standardlängen; Emoji-Raster für Symbole.
- Die alten Symbol-Dateien `icon48.png`/`icon128.png` sind durch `icons/icon-*.png` ersetzt.
- Papierkorb (7 Tage, höchstens 20 Einträge) mit Wiederherstellen; Löschen geht immer zuerst dorthin.
- Dubletten-Finder mit „Je eines behalten“ (Tags und Favoriten bleiben, sie hängen an der URL).
- Optionale Spalten „Zuletzt hinzugefügt“ und „Meistbesucht“, Ansicht „Kompakte Zeilen“, Schriftart Sans/Mono/Serif.
- Behoben (Audit): Wiederherstellen verlor Lesezeichen, die sich nur in `#…` oder Groß/Klein unterscheiden; Datei-Export ohne API-Schlüssel; CI mit Unit-Tests, Lint und E2E.

## 0.5.2
- Links per Strg+V oder Hineinziehen im Board ablegen, Meldung mit Ordner und Rückgängig.
- „Alle Tabs als Lesezeichen-Ordner speichern“ im Kopf und im Kontextmenü; Speichern über das Kontextmenü nennt den Ordner per Benachrichtigung.
- Links auf Live-Ordner in der Leiste ziehen; „Als Tab-Gruppe öffnen“ (neue Berechtigung `tabGroups`).
- Pomodoro im Timer-Widget; Timer laufen im Hintergrund weiter (auch nach Neustart) und melden sich per Systembenachrichtigung.
- Hinweis auf eine Sicherungsdatei außerhalb des Profils nach 14 Tagen.
- Seitenleiste: Ansicht „Live-Ordner“ (senkrechte Leiste).
- Behoben: Leiste auf Webseiten reagiert sofort auf geänderten Seitenzugriff im Add-on-Manager.
- Behoben: Der Neue Tab überschrieb Änderungen von Hintergrund und Leiste (z. B. per Kontextmenü gespeicherte Sitzungen, erledigte Erinnerungen) mit seinem alten Stand.

## 0.5.1 (stabil)
- Erste veröffentlichte Version: v0.1 bis v0.5 zusammengeführt, ohne Konto, ohne Lizenzschlüssel, alle Funktionen frei.
- Lokal zuerst: KI nur mit Ollama auf dem eigenen Rechner (OpenRouter optional, nur kostenlose Modelle). Es werden nur Titel und Domains gesendet.
- Gegenüber 0.5.0: Version, Lizenz (MIT), README mit Installation, Paketbau (`npm run pack`), Änderungsprotokoll.

## 0.5.0
- Leiste auf Webseiten (Opt-in, closed Shadow DOM, Ausschlussliste, einklappbar mit Alt+Umschalt+B).

## 0.4.0
- Horizontale Leiste im Neuen Tab (Live-Tab-Ordner, Lesezeichenleiste, Schnellwahl aus dem Verlauf, Überlauf »).
- Live-Tab-Ordner mit Name und Symbol, Zuordnung nach URL, Öffnen ohne Duplikat, als Sitzung speichern.
- KI-Vorschlag in Live-Ordner übernehmen, mit Rückgängig.

## 0.3.0
- Gesperrter Zustand (`update()`), Schema 2 mit Migration und Sicherung vor der Migration.

## 0.2.0 / 0.1.0
- Board, Schnellwahl aus dem Verlauf, Tags, Sitzungen, Sicherungen, Widgets, KI-Dialog mit Ollama-Modellverwaltung.

## Bekannte Grenzen
- Firefox und Brave wurden in dieser Version nicht von Hand geprüft; getestet wurde mit Chromium (Playwright).
- Firefox lädt unsignierte Erweiterungen nur vorübergehend (about:debugging); dauerhaft braucht eine Signatur.
- Noch offen aus v0.3 Punkt 4.x: Notiz/Foto-Widget, Ansicht „Zentriert“, Toolbar-Popup, Sprachen DE/EN, Modulaufteilung von newtab.js; dazu v0.6.
- Die Leiste auf Webseiten schiebt die Seite um 30 px nach unten; Seiten mit eigenen fixierten Kopfzeilen können sich überlagern.
