# Proposal

## Why

Der Neue Tab ist der Ort, an dem der Nutzer ohnehin mehrmals pro Stunde landet. Kleine lokale Werkzeuge dort (Notiz, Todo mit Fälligkeit, Bilder) ersparen das Öffnen weiterer Apps und passen zum ADHS-Ziel „nichts vergessen, wenig Klicks“. Mit dem Widget-Fundament aus v0.7 ist jedes neue Widget eine Datei mit einem Test, also auch für günstigere Modelle machbar.

## What Changes

- **Notiz:** ein Textfeld im Widget, speichert beim Tippen (verzögert, 500 ms) über `patch`, Zeichenzahl als Untertitel.
- **Todo:** Liste mit Hinzufügen per Enter, Abhaken, Löschen, optionalem Fälligkeitsdatum. Fällige und überfällige Punkte stehen oben und sind markiert; eine fällige Aufgabe löst einmal eine Systembenachrichtigung aus (ersetzt die geplante „Agenda“, ohne Kalender-Zugriff).
- **Fotorahmen:** bis zu 6 Bild-Adressen (`https://` oder eigene Lesezeichen), Wechselzeit, Einpassen/Füllen. Es werden nur Adressen gespeichert, keine Bilddaten; Laden aus dem Netz nur, wenn der Nutzer Adressen einträgt.
- Gestrichen (Begründung im Design): Wetter, RSS, Kalender-Synchronisation.

## Capabilities

### New Capabilities
- `widgets`: Notiz, Todo mit Fälligkeit, Fotorahmen.

### Modified Capabilities
<!-- keine -->

## Impact

- Code: `widgets/notes.js`, `widgets/todo.js`, `widgets/photo.js`, Einträge in `widgets/index.js`; reine Logik in `lib/todo.js` (Sortierung, Fälligkeit) mit Test; Hintergrund: Alarm für fällige Todos in `background.js` (Muster wie Erinnerungen).
- Berechtigungen: keine neuen. Bilder laden über `<img>` von Adressen, die der Nutzer einträgt; `docs/BERECHTIGUNGEN.md` bleibt gleich.
- Datenschutz: Text und Todos bleiben lokal; Fotorahmen lädt nur die eingetragenen Adressen.
- Voraussetzung: `v07-widget-fundament` gemergt. Version 0.8.0.
