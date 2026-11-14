// Erste-Schritte-Tour: Schritte als Daten, Weiterschalten als reine Funktion (Oberfläche: lib/tour-ui.js).
// Höchstens 5 Schritte; sel = CSS-Selektor des hervorgehobenen Elements.
export const STEPS = [
  { sel: '#top', title: 'Dein Board', text: 'Oben liegt alles Häufige: Suche, Auswahl, Galerie, KI und Einstellungen. Seltenes steckt hinter „Mehr“.' },
  { sel: '#top .search', title: 'Suchen mit F', text: 'Die Taste F öffnet die Suche über alle Lesezeichen. Mit „>“ führst du Aktionen aus, mit „/“ springst du in einen Ordner.' },
  { sel: '#top button[aria-label^="Auswahlmodus"]', title: 'Auswahl mit S', text: 'Die Taste S schaltet die Auswahl ein: mehrere Lesezeichen markieren, dann taggen, umbenennen oder löschen.' },
  { sel: '#board .item', title: 'Rechtsklick auf ein Lesezeichen', text: 'Das Menü bietet Tags, Kommentar, Erinnerung, Icon, Farbe, Umbenennen und Löschen mit Rückgängig.' },
  { sel: '#top button[aria-label="Einstellungen"]', title: 'Einstellungen', text: 'Hier stellst du Aussehen, Sicherung und KI ein und siehst, was die Erweiterung darf. Die Tour findest du in der Suche unter „> Tour“.' },
]

// Index des ersten Schritts ab i, dessen Ziel vorhanden ist (exists(sel) -> bool); null, wenn keiner mehr übrig ist.
export function next(i, steps, exists) {
  for (let k = Math.max(0, i); k < steps.length; k++) if (exists(steps[k].sel)) return k
  return null
}
