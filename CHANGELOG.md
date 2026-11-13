# Änderungen

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
- Nicht enthalten: Board-Funktionen aus v0.3 Punkt 4.x, die über das Bestehende hinausgehen, sowie v0.6.
- Die Leiste auf Webseiten schiebt die Seite um 30 px nach unten; Seiten mit eigenen fixierten Kopfzeilen können sich überlagern.
