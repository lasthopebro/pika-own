# Design

## Entscheidungen

- **Keine neuen optionalen Berechtigungen:** `tabs` und `notifications` sind seit v0.1 Pflicht. Neu ist nur `tabGroups` für den Gruppennamen; `tabs.group` selbst braucht sie nicht. Fehlt die API, blendet die Leiste den Menüeintrag aus (`getBar` liefert `groups`).
- **Einfügen und Ablegen:** Das Board zeigt Browser-Lesezeichen, also legt Einfügen echte Lesezeichen an. Rückgängig löscht genau die angelegten Lesezeichen (kein Snapshot nötig). Die reine Funktion `urlsFromText` (lib/quick.js) lässt nur `http(s)` durch, auch aus `text/uri-list` mit `#`-Kommentaren.
- **Ziel beim Einfügen:** gezeigter Ordner (Fokus), sonst erste echte Spalte, sonst Lesezeichenleiste.
- **Tabs als Ordner:** eine Funktion im Hintergrund (`saveTabsFolder`), genutzt von Kopf-Knopf und Kontextmenü. Scheitert sie mittendrin, wird der halbe Ordner wieder entfernt.
- **Ziehen auf Live-Ordner:** Drop-Handler nur an eigenen Ordnern; `urlFromDrop` ist rein und getestet. Der Titel kommt aus `text/plain` oder aus bekannten Tabs/Lesezeichen.
- **Tab-Gruppe:** offene, nicht angeheftete Tabs des aktuellen Fensters werden per `normUrl` wiederverwendet, fehlende im Hintergrund geöffnet, IDs ohne Doppelte, dann `tabs.group` und Name über `tabGroups.update`.
- **Pomodoro:** Zustand `{ until | left, phase }` im Widget. Start/Pause setzt einen Alarm `timer|<id>`. Der Hintergrund schaltet bei Ablauf mit `timerNext` die Phase weiter, setzt den nächsten Alarm und meldet sich per Benachrichtigung. Beim Browserstart legt `syncTimers` fehlende Alarme neu an oder holt abgelaufene Phasen nach. Ein zu früh feuernder Alarm wird neu gesetzt.
- **Zustand im Neuen Tab:** `persist()` merkt sich jeden selbst geschriebenen Stand (Menge `own`). Fremde Änderungen laden `S` neu und zeichnen neu. Ist ein Dialog offen oder läuft ein Ziehen, übernimmt `absorb` nur die Felder, die Hintergrund und Leiste schreiben (Sitzungen, Live-Ordner, erledigte Erinnerungen, Timer-Stand, eingeklappte Leiste), damit die Änderungen des Dialogs erhalten bleiben.
- **Sicherungs-Hinweis:** `settings.backup { lastExport, nagUntil }`, `merge` ergänzt das Feld für alte Stände, keine Migration nötig.
- **Seitenleiste:** Ansicht `livefolders` bindet `PikaBar.mount(el, { vertical: true })` einmal ein; die Leiste lädt sich selbst neu.

## Offene Risiken

- Kommt eine fremde Änderung in den Millisekunden zwischen einer Änderung an `S` und dem Schreiben an, gewinnt der fremde Stand.
- Firefox: `tabs.group`/`tabGroups` erst ab Version 139 (Annahme, ungeprüft); ohne API fehlt nur der Menüeintrag.
- Alarme unter 30 Sekunden feuern in gepackten Chromium-Erweiterungen verzögert; für Minuten-Timer egal.
- Links aus der Leiste öffnen in der Seitenleiste in einem neuen Tab (kein `sender.tab`).

## Handprüfung (Firefox und Brave)

Siehe Abschnitt 7 in `tasks.md`. Alle Aussagen zu Firefox-APIs sind Annahmen bis zur Prüfung.
