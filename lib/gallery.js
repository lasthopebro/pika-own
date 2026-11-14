// Galerie-Vollbild: reine Navigation, Filter und Ablageziele (ohne DOM, testbar). Pfad = Liste von Ordner-IDs, leer = Home.

const isFolder = (n) => !!n && !n.url

// Pfad bis vor den ersten Eintrag, der fehlt (gelöscht) oder kein Ordner ist.
export function cleanPath(path, byId) {
  const out = []
  for (const id of path) { if (!isFolder(byId.get(id))) break; out.push(id) }
  return out
}

export const crumbs = (path, byId) => cleanPath(path, byId).map((id) => ({ id, title: byId.get(id).title || 'Ordner' }))

// Ordner zuerst, dann Lesezeichen, jeweils in der Reihenfolge des Baums.
export const children = (node) => {
  const c = node?.children || []
  return [...c.filter(isFolder), ...c.filter((n) => !isFolder(n))]
}

// Teilstring in Titel oder Adresse, Groß/Klein egal; leeres Feld zeigt alles.
export function filterChildren(nodes, q = '') {
  const s = q.trim().toLowerCase()
  return s ? nodes.filter((n) => `${n.title || ''} ${n.url || ''}`.toLowerCase().includes(s)) : nodes
}

// Eine Ebene höher; null auf Home (dann verlässt Esc die Galerie).
export const up = (path) => (path.length ? path.slice(0, -1) : null)

// Pfad zu einem Ordner: die Eltern aufwärts bis zu einer Home-Spalte. Liegt der Ordner in keiner Spalte, nur er selbst.
export function pathTo(id, byId, homeIds) {
  const out = []
  for (let n = byId.get(id); n; n = byId.get(n.parentId)) {
    out.unshift(n.id)
    if (homeIds.includes(n.id)) return out
  }
  return [id]
}

// Ordner des Workspace als Ablageziele (mit Tiefe). Die virtuelle Spalte „Leiste“ legt auf die Lesezeichenleiste (barId), andere virtuelle Spalten entfallen.
export function folderList(cols, barId) {
  const out = []
  const walk = (n, depth) => { out.push({ id: n.id, title: n.title || 'Ordner', depth }); for (const c of n.children || []) if (isFolder(c)) walk(c, depth + 1) }
  for (const c of cols) {
    if (!c.virtual) walk(c, 0)
    else if (c.id === 'virtual' && barId) out.push({ id: barId, title: c.title, depth: 0 })
  }
  return out
}
