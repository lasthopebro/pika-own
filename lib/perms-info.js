// Klartext zu jeder Berechtigung des Manifests (ein Satz). test/perms-info.test.js scheitert, wenn eine fehlt oder überzählig ist.
export const INFO = {
  bookmarks: 'Lesezeichen lesen, anlegen, verschieben und löschen: Board, Einfügen, Ordner aus Tabs, Papierkorb.',
  history: 'Schnellwahl, „Zuletzt besucht“ und Weitermachen-Karten aus dem Verlauf; bleibt auf diesem Gerät.',
  storage: 'Zustand, Einstellungen und Sicherungen lokal im Browser speichern.',
  unlimitedStorage: 'Sicherungen und Sitzungen dürfen das Standard-Limit des lokalen Speichers überschreiten.',
  tabs: 'Offene Tabs lesen und öffnen: Tab-Sitzungen, KI-Sortierung, Live-Ordner.',
  alarms: 'Wecker für Timer und Pomodoro, auch bei geschlossenem Neuem Tab.',
  notifications: 'Meldung, wenn ein Timer oder eine Pomodoro-Phase abläuft.',
  contextMenus: 'Rechtsklick-Einträge wie „Seite in pika-own speichern“.',
  sidePanel: 'Seitenleiste in Chromium (Firefox nutzt eine eigene Seitenleiste).',
  scripting: 'Leiste auf Webseiten einschalten: Skript nachträglich in offene Tabs einfügen.',
  tabGroups: 'Live-Ordner als Tab-Gruppe öffnen.',
  '<all_urls>': 'Nur auf Nachfrage: Die Leiste darf auf beliebigen Webseiten erscheinen. Ohne sie bleibt sie auf dem Neuen Tab.',
  'http://localhost:11434/*': 'Lokale Ollama-Schnittstelle für die KI-Sortierung; gesendet werden nur Titel und Domains.',
  'http://127.0.0.1:11434/*': 'Wie localhost, falls Ollama über die Adresse 127.0.0.1 erreichbar ist.',
  'https://openrouter.ai/*': 'Externer KI-Anbieter OpenRouter, nur kostenlose Modelle, nur Titel und Domains; der Anbieter wird vorher angezeigt.',
}

const KEYS = [['permissions', false, false], ['optional_permissions', true, false], ['host_permissions', false, true], ['optional_host_permissions', true, true]]
// Alle Berechtigungen des Manifests: { name, optional, host }; host = Adressmuster statt Schnittstellenname.
export const entries = (m = {}) => KEYS.flatMap(([k, optional, host]) => (m[k] || []).map((name) => ({ name, optional, host })))
