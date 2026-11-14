# Proposal

## Why

Neue Funktionen helfen nur, wenn man sie findet. Eine kurze, überspringbare Tour zeigt die wenigen Wege, die Klicks sparen (Suche F, Auswahl S, Menü, Einstellungen). Eine Berechtigungsseite macht sichtbar, was die Erweiterung darf und warum („lokal, ohne Konto“ prüfbar statt behauptet). „Leere Ordner“ räumt Ballast auf, der das Board unübersichtlich macht.

## What Changes

- **Erste-Schritte-Tour:** höchstens 5 Schritte (Kopf, Suche F, Auswahl S, Lesezeichen-Menü, Einstellungen), erscheint einmal beim ersten Start, Esc oder „Überspringen“ beendet sie sofort; wiederholbar über Palette („Tour“) und `?`-Übersicht.
- **Berechtigungsseite** (Einstellungen → Datenschutz): jede im Manifest stehende und optionale Berechtigung mit Klartext-Begründung (aus `docs/BERECHTIGUNGEN.md` abgeleitet), Status „erteilt/nicht erteilt“, optionale lassen sich mit einem Klick widerrufen.
- **Zusatzspalte „Leere Ordner“** (Einstellung, aus): zeigt Ordner ohne Lesezeichen; „Alle in den Papierkorb“ mit Rückgängig.
- **Gestrichen:** Sprachdateien. Weitere Sprachen (Ukrainisch, Spanisch, Französisch) nutzen einem einzelnen deutschsprachigen Nutzer nichts und vergrößern jede künftige Änderung; Deutsch/Englisch bleibt, falls gewünscht, in `v03-fundament-und-board` 4.14 (offen, nicht hier).

## Capabilities

### New Capabilities
- `onboarding-and-transparency`: Tour, Berechtigungsseite, Leere Ordner.

### Modified Capabilities
<!-- keine -->

## Impact

- Code: `lib/tour.js` (Schritte, reine Logik), `lib/perms-info.js` (Klartexte), `lib/folders.js` (`emptyFolders`), `newtab.js`, `style.css`.
- Berechtigungen: **keine neue**. Die Seite liest `runtime.getManifest()` und `permissions.getAll()/remove()`; `permissions` braucht für `getAll`/`remove` bereits erteilter oder optionaler Rechte keinen Manifest-Eintrag. `docs/BERECHTIGUNGEN.md` bleibt unverändert; ein Test prüft, dass `lib/perms-info.js` jede dort stehende Berechtigung kennt.
- Voraussetzung: v0.8.0 (`main`). Unabhängig von v09, v10, v12. Version 0.11.0.
