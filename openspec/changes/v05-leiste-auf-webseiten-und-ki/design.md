# Design

## Context

Nach v0.4 gibt es `lib/bar.js` (Rendern ohne `B.*`), Live-Tab-Ordner und den Bus. KI läuft über `lib/ai.js` (Ollama, OpenRouter). Chromium und Firefox unterscheiden sich bei Content-Script-Rechten und Tab-Gruppen. Siehe proposal.md für Motivation.

## Goals / Non-Goals

**Goals:**
- Dieselbe Leiste im Content-Script wie im Neuen Tab, ohne Zugriff auf Browser-Daten.
- Sichere Voreinstellung: aus, bis der Nutzer zustimmt.

**Non-Goals:**
- Kein Lesen von Seiteninhalten, keine Werbeblocker- oder Reader-Funktionen.
- Kein automatisches Sortieren.

## Decisions

- **Registrierung zur Laufzeit** mit `scripting.registerContentScripts` und optionaler Host-Berechtigung (`permissions.request` im Klick-Handler). Alternative (statisches `content_scripts` mit `<all_urls>`) verworfen: Warnung bei der Installation.
- **Shadow DOM `closed`**, nur oberster Frame, fest positioniert, schiebt die Seite nicht; Einklappen auf einen schmalen Griff.
- **Daten über Nachricht** `getBar`; der Hintergrund liefert einen schlanken Ausschnitt (`pika_bar`), nie den vollen Zustand.
- **Ausschlüsse:** Liste in den Einstellungen; Browser-Seiten werden vom Browser ohnehin ausgenommen, zusätzlich Schutz im Skript.
- **KI-Ablauf:** Vorschlag → Vorschau → Bestätigung → Snapshot der Ordner → anwenden; Rückgängig stellt den Snapshot wieder her. Tab-Gruppen nur mit Feature-Prüfung.

## Risks / Trade-offs

- Firefox verlangt die Zustimmung zu Host-Rechten ausdrücklich; Test mit einem sauberen Profil.
- Seiten mit sehr hohem `z-index` oder Vollbild-Elementen: dafür Tests mit Fixture-Seiten.
- Ein Content-Script auf jeder Seite kostet etwas Ladezeit: Skript klein halten, erst nach `document_idle`.
