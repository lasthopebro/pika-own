// Live-Tab-Ordner: benannte Ordner mit Symbol, Zuordnung nach URL (nicht nach Tab-ID), damit sie Neustarts überleben.
// Alle Funktionen ändern nur das übergebene S (im Hintergrund unter update() aufgerufen) und sind ohne Browser testbar.
import { normUrl } from './logic.js'

const find = (S, id) => S.lf.find((f) => f.id === id)

export function addFolder(S, name, icon = '📁') {
  const f = { id: crypto.randomUUID(), name: (name || '').trim() || 'Ordner', icon: icon || '📁', items: [] }
  S.lf.push(f)
  return f
}
export function renameFolder(S, id, name, icon) {
  const f = find(S, id); if (!f) return
  if (name?.trim()) f.name = name.trim()
  if (icon) f.icon = icon
}
export const removeFolder = (S, id) => { S.lf = S.lf.filter((f) => f.id !== id) }
export function unassign(S, url) {
  const n = normUrl(url)
  for (const f of S.lf) f.items = f.items.filter((i) => normUrl(i.u) !== n)
}
// Eine URL liegt in höchstens einem Ordner (wie ein Lesezeichen in einem Ordner).
export function assign(S, id, url, title = '') {
  const f = find(S, id); if (!f || !/^https?:/.test(url)) return
  unassign(S, url)
  f.items.push({ u: url, t: title || url })
}
// live: Einträge, deren URL gerade in einem Tab offen ist
export function liveItems(f, tabs) {
  const open = new Set(tabs.map((t) => normUrl(t.url || '')))
  return f.items.map((i) => ({ ...i, live: open.has(normUrl(i.u)) }))
}
export function snapshot(S) {
  S.snapshots.unshift({ ts: Date.now(), lf: structuredClone(S.lf) })
  S.snapshots.length = Math.min(S.snapshots.length, 5)
}
export function undo(S) {
  const s = S.snapshots.shift()
  if (!s) return false
  S.lf = s.lf
  return true
}
// KI-Vorschlag { Thema: [Index] } in Live-Ordner übernehmen; vorher Snapshot für „Rückgängig“.
export function applyTopics(S, topics, tabs) {
  snapshot(S)
  for (const [name, idx] of Object.entries(topics)) {
    const f = S.lf.find((x) => x.name === name) || addFolder(S, name, '🗂')
    for (const i of idx) if (tabs[i]) assign(S, f.id, tabs[i].url, tabs[i].title)
  }
}
export const OPS = { add: addFolder, rename: renameFolder, remove: removeFolder, assign, unassign }