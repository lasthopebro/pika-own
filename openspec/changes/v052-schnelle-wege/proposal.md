# Proposal

## Why

v0.5.1 ist draußen. Die häufigsten Vorgänge brauchen noch zu viele Schritte: Links ablegen, alle offenen Tabs sichern, Erinnerungen bemerken. Für einen Nutzer mit ADHS zählt jeder Klick, und eine Erinnerung, die erst beim Öffnen eines neuen Tabs sichtbar wird, kommt zu spät. Diese Welle holt die kleinen, schnellen Wege nach, ohne neue Oberflächen.

## What Changes

- Strg+V und Hineinziehen von Links legen sie im gezeigten Ordner ab (sonst erste Spalte), mit Meldung „gespeichert in …“ und „Rückgängig“.
- „Alle Tabs als Ordner speichern“ im Kopf und im Kontextmenü der Seite, mit Rückgängig.
- Speichern über das Kontextmenü meldet per Benachrichtigung, in welchem Ordner es liegt.
- Links auf einen Live-Ordner der Leiste ziehen ordnet sie zu.
- „Als Tab-Gruppe öffnen“ im Ordner-Menü der Leiste, wenn der Browser Tab-Gruppen kann.
- Timer-Widget mit Pomodoro (Arbeit/Pause im Wechsel). Der Stand ist ein Zeitstempel, der Wecker läuft im Hintergrund und meldet sich per Systembenachrichtigung, auch ohne offenen Neuen Tab und nach einem Browser-Neustart.
- Hinweis auf eine Sicherungsdatei außerhalb des Profils nach 14 Tagen ohne Export, für 14 Tage schließbar.
- Seitenleiste: neue Ansicht „Live-Ordner“ mit derselben Leiste, senkrecht.
- Fehlerbehebung: Ändert der Nutzer den Seitenzugriff im Add-on-Manager, wird die Leiste auf Webseiten sofort neu registriert (vorher erst nach Neustart).
- Fehlerbehebung: Der Neue Tab übernimmt Änderungen von Hintergrund und Leiste (Sitzungen, Erinnerungen, Timer), statt sie beim nächsten Speichern mit altem Stand zu überschreiben.

Bewusst nicht enthalten: ein eigenes Popup (der Symbol-Knopf öffnet weiter die Seitenleiste), „Verschieben“ und „8 neueste“ im Popup, Ziehen aus der Tab-Leiste des Browsers (liefert keine verlässlichen Daten).

## Capabilities

### New Capabilities
- `quick-capture`: Links per Einfügen/Ziehen und alle Tabs als Ordner ablegen, Ziehen auf Live-Ordner, Ordner als Tab-Gruppe.
- `reminder-notify`: Systembenachrichtigung für Erinnerungen und Timer, Pomodoro.
- `backup-reminder`: Hinweis auf eine Sicherung außerhalb des Profils.

### Modified Capabilities
<!-- keine: openspec/specs/ ist leer -->

## Impact

- Code: `newtab.js`, `newtab.html`, `background.js`, `lib/bar.js`, `lib/quick.js` (neu), `lib/store.js` (`settings.backup`), `lib/ui.js` (Toast mit Knopf), `sidebar.js`, `sidebar.html`, `style.css`.
- Berechtigungen: neu nur `tabGroups` (ohne Installationswarnung in Chromium). `tabs` und `notifications` waren schon vorhanden.
- Datenschutz: unverändert, nichts verlässt den Rechner.
- Hängt von v0.5.1 (`main`) ab. #20 (Papierkorb, Dubletten) ist unabhängig.
