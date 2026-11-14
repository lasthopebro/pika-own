# Berechtigungen

Jede Berechtigung in `manifest.json` (`permissions`, `optional_permissions`, `host_permissions`, `optional_host_permissions`) steht hier mit Begründung. `tools/check-permissions.mjs` vergleicht beide Seiten; die CI scheitert bei jeder Abweichung. Eine neue Berechtigung braucht zuerst eine Spezifikation (OpenSpec-Change), dann eine Zeile hier.

| Berechtigung | Begründung |
|---|---|
| `bookmarks` | Lesezeichen lesen, anlegen, verschieben und löschen (Board, Einfügen, Ordner aus Tabs, Papierkorb). |
| `history` | Schnellwahl, „Zuletzt besucht“ und Weitermachen-Karten aus dem Verlauf; bleibt lokal. |
| `topSites` | Reserviert für die Schnellwahl „Meistbesucht“; der Code nutzt derzeit nur `history` (offen: entfernen oder einsetzen). |
| `storage` | Zustand, Einstellungen und Sicherungen in `storage.local` (Schlüssel `pika`). |
| `unlimitedStorage` | Sicherungen und Sitzungen können das Standard-Limit von `storage.local` überschreiten. |
| `tabs` | Offene Tabs lesen (Tab-Sitzungen, KI-Sortierung, Live-Ordner), Tabs öffnen und fokussieren. |
| `alarms` | Wecker für Timer/Pomodoro-Widgets, auch bei geschlossenem Neuem Tab. |
| `notifications` | Meldung, wenn ein Timer oder eine Pomodoro-Phase abläuft. |
| `contextMenus` | Rechtsklick-Einträge „Seite in pika-own speichern“. |
| `sidePanel` | Seitenleiste in Chromium (Firefox nutzt `sidebar_action`). |
| `scripting` | Leiste auf Webseiten einschalten: Content-Script nachträglich in offene Tabs einfügen. |
| `tabGroups` | Live-Ordner als Tab-Gruppe öffnen. |
| `<all_urls>` | Optional (`optional_host_permissions`): erst auf Nachfrage, damit die Leiste auf beliebigen Webseiten erscheinen kann. |
| `http://localhost:11434/*` | Lokale Ollama-Schnittstelle für die KI-Sortierung (nur Titel und Domains). |
| `http://127.0.0.1:11434/*` | Wie `localhost`, falls Ollama über die Adresse 127.0.0.1 erreicht wird. |
| `https://openrouter.ai/*` | Externer KI-Anbieter OpenRouter, nur kostenlose Modelle, nur Titel und Domains, Anbieter wird vorher angezeigt. |
