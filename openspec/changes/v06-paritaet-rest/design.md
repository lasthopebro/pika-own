# Design

## Context

Aufbauend auf v0.3 (Zustand v2, Module) bis v0.5. Quelle der Anforderungen: `docs/FUNKTIONSLISTE.md`. Siehe proposal.md für Motivation.

## Goals / Non-Goals

**Goals:**
- Jede Funktion als eigenes Modul, einzeln testbar, von getrennten Agenten bearbeitbar.
- Optionale Berechtigungen erst bei Nutzung anfragen.

**Non-Goals:**
- Kein Lizenzsystem, keine Konten, keine Analyse.
- Kein Code, Name oder Material des Vorbilds.

## Decisions

- **Ein Modul je Bereich** (Galerie, Werkzeugleiste, Zwischenablage-Formate, Benachrichtigungen, Sicherungsordner, Tour, i18n), Verdrahtung nur in `newtab.js`.
- **Sicherungsordner** über File System Access API nur auf Chromium; Firefox bleibt beim Download-Ordner aus v0.3.
- **Benachrichtigungen** über `alarms` und `notifications`, nur auf Browsern, die beides haben.
- **Texte** in einer Datei je Sprache; Deutsch und Englisch vollständig, weitere Sprachen optional.

## Risks / Trade-offs

- Umfang: v0.6 ist groß; bei Zeitnot zuerst Galerie, Zwischenablage-Formate und Sicherungsordner, Tour und weitere Sprachen zuletzt.
- Firefox-Unterschiede (Benachrichtigungen, Ordnerwahl): Funktion unsichtbar statt Fehlermeldung.
