# Design

## Entscheidungen

- **Jedes Widget = eine Datei** nach dem Vertrag aus `v07-widget-fundament` (`widgets/<typ>.js`), ein Eintrag in `widgets/index.js`. Der Vertragstest deckt Grundfälle automatisch ab.
- **Notiz** `{ text: '' }`: `<textarea>`, `input` → entprellt 500 ms → `patch((w) => { w.text = value })`. Kein Neuzeichnen beim eigenen Speichern (Fokus bleibt).
- **Todo** `{ items: [{ id, t, done, due? }] }`: reine Funktionen in `lib/todo.js`: `sortTodos(items, now)` (offen+fällig zuerst, dann offen nach Datum, dann ohne Datum, erledigt zuletzt) und `dueSoon(items, now)` für Benachrichtigungen. Hintergrund legt je offenem Punkt mit `due` einen Alarm `todo|<widgetId>|<itemId>` an (Abgleich wie `syncReminders`, nur bei Änderung der Todo-Daten); beim Auslösen Benachrichtigung und Merker `notified: true`, damit es genau eine bleibt.
- **Fotorahmen** `{ urls: [], sec: 30, fit: 'contain' }`: Eingabe nur `https:` (Prüfung mit `new URL`), höchstens 6; Wechsel per `tick`; `img.onerror` → nächstes Bild. Keine Daten-URLs, kein `storage.local`-Blob.
- **Gestrichen:** Wetter (Netzwerk und Standort, neue Host-Berechtigung), RSS (Host-Berechtigungen, Abfragen im Hintergrund), Kalender-Sync (OAuth, Konto). Passt nicht zu „lokal, ohne Konto“.

## Risiken

- Fotorahmen lädt fremde Bilder: Die Gegenstelle sieht IP und Zeitpunkt. Hinweis im Dialog.
- Viele Todos mit Datum erzeugen viele Alarme; Chromium erlaubt viele, Firefox ebenfalls; bei mehr als 100 nur die nächsten 100 planen (`shortcut`-Kommentar).
