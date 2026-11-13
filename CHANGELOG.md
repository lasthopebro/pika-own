# Änderungen

## Unveröffentlicht
- Papierkorb (7 Tage, höchstens 20 Einträge) mit Wiederherstellen; Löschen geht immer zuerst dorthin.
- Dubletten-Finder mit „Je eines behalten“ (Tags und Favoriten bleiben, sie hängen an der URL).
- Optionale Spalten „Zuletzt hinzugefügt“ und „Meistbesucht“, Ansicht „Kompakte Zeilen“, Schriftart Sans/Mono/Serif.

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
