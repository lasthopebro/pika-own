// Reine Board-Logik (Papierkorb, Dubletten, Entdeckung) ohne Browser-API.
import { normUrl } from './logic.js'

const DAY = 864e5
export const TRASH_DAYS = 7
export const TRASH_MAX = 20

// Knoten -> speicherbarer Baum (ohne IDs, damit Wiederherstellen neue anlegt).
export const toTree = (n) => (n.url ? { title: n.title, url: n.url } : { title: n.title, children: (n.children || []).map(toTree) })

// Neuer Eintrag vorn; Einträge über 7 Tage und über 20 Stück fallen weg.
export function trashAdd(trash, node, now) {
  const e = { at: now, parentId: node.parentId, index: node.index, tree: toTree(node) }
  return [e, ...(trash || [])].filter((x) => now - x.at < TRASH_DAYS * DAY).slice(0, TRASH_MAX)
}

// Elternordner weg -> Lesezeichenleiste (barId) als Ziel.
export const restoreParent = (e, exists, barId) => (exists(e.parentId) ? e.parentId : barId)

// Gruppen mit mehr als einer Lesezeichen-URL, je Gruppe zuerst das älteste.
export function findDupes(urlNodes) {
  const by = new Map()
  for (const n of urlNodes) { const k = normUrl(n.url); by.set(k, [...(by.get(k) || []), n]) }
  return [...by.values()].filter((g) => g.length > 1).map((g) => g.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0)))
}

// Entdeckungs-Spalten: zuletzt hinzugefügt / meistbesucht (Besuche aus dem Verlauf).
export function discovery(kind, urlNodes, hist = [], limit = 20) {
  if (kind === 'recent') return [...urlNodes].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0)).slice(0, limit)
  const v = new Map(hist.map((h) => [normUrl(h.url), h.visitCount || 0]))
  return urlNodes.map((n) => [n, v.get(normUrl(n.url)) || 0]).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n)
}
