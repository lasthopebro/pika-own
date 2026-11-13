# Spec Delta

## Purpose
Erinnerungen und Timer sollen auffallen, auch wenn kein Neuer Tab offen ist, und das Timer-Widget bietet einen Pomodoro-Ablauf.

## ADDED Requirements

### Requirement: Systembenachrichtigung
Fällige Erinnerungen und ablaufende Timer MÜSSEN als Systembenachrichtigung erscheinen, auch wenn kein Neuer Tab offen ist. Der Timer-Stand MUSS das Schließen des Tabs überleben.

#### Scenario: Timer läuft ab, Tab geschlossen
- **WHEN** ein Timer abläuft und kein Neuer Tab offen ist
- **THEN** erscheint eine Benachrichtigung, und beim nächsten Neuen Tab zeigt das Widget den richtigen Stand

### Requirement: Pomodoro
Das Timer-Widget MUSS einen Pomodoro-Ablauf mit Arbeitsphase und Pause anbieten. Die Längen MÜSSEN einstellbar sein, Standard 25 und 5 Minuten.

#### Scenario: Phasenwechsel
- **WHEN** die Arbeitsphase abläuft
- **THEN** beginnt die Pause und der Nutzer wird benachrichtigt
