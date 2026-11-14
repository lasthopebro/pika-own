// Browser-Kontextmenü: ein Eintrag „pika-own“ mit Untermenü. Rein, damit ohne Browser testbar.
// lf = Live-Ordner; deren Untermenü wird bei jeder Änderung neu aufgebaut (IDs lf:<id>).
export const LF_PREFIX = 'lf:'
export function menuSpecs(lf = []) {
  const page = ['page', 'link']
  return [
    { id: 'pika', title: 'pika-own', contexts: page },
    { id: 'save-page', parentId: 'pika', title: 'Seite speichern', contexts: page },
    { id: 'lf-parent', parentId: 'pika', title: 'In Live-Ordner ▸', contexts: page },
    ...(lf.length
      ? lf.map((f) => ({ id: LF_PREFIX + f.id, parentId: 'lf-parent', title: `${f.icon} ${f.name}`.slice(0, 60), contexts: page }))
      : [{ id: 'lf-none', parentId: 'lf-parent', title: 'Noch kein Live-Ordner', enabled: false, contexts: page }]),
    { id: 'save-tabs-folder', parentId: 'pika', title: 'Alle Tabs als Ordner', contexts: ['page'] },
    { id: 'save-session', parentId: 'pika', title: 'Alle Tabs als Sitzung', contexts: ['page'] },
  ]
}
// Nur was das Menü zeigt (Reihenfolge, ID, Name, Symbol): vermeidet Neuaufbau bei jedem Speichern.
export const menuKey = (lf = []) => JSON.stringify(lf.map((f) => [f.id, f.name, f.icon]))
