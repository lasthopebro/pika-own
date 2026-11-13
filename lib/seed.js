import { B } from './api.js'
import { normUrl } from './logic.js'

export const barOf = (T) => T[0].children.find((n) => n.id === 'toolbar_____' || n.id === '1') || T[0].children[0]

// Lesezeichenbaum -> [{path:[Ordner...], items:[{t,u}]}]. Pfade relativ zur Lesezeichenleiste,
// andere Wurzeln liegen unter "Weitere/<Name>". Leere Ordner bleiben erhalten.
export function treeToFolders(T) {
  const bar = barOf(T)
  const out = []
  const walk = (n, path) => {
    out.push({ path, items: (n.children || []).filter((c) => c.url).map((c) => ({ t: c.title, u: c.url })) })
    for (const c of n.children || []) if (!c.url) walk(c, [...path, c.title || 'Ordner'])
  }
  for (const r of T[0].children) walk(r, r === bar ? [] : ['Weitere', r.title || r.id])
  return out.filter((f) => f.path.length || f.items.length)
}

// Legt Ordner an (gleichnamige werden wiederverwendet) und fügt nur noch nicht vorhandene URLs hinzu.
export async function importFolders(folders, onProgress) {
  const T = await B.bookmarks.getTree()
  const bar = barOf(T)
  const have = new Set()
  ;(function w(n) { if (n.url) have.add(normUrl(n.url)); n.children?.forEach(w) })(T[0])
  const cache = new Map()
  let made = 0, added = 0
  async function ensure(path) {
    let id = bar.id, key = ''
    for (const t of path) {
      key += '/' + t
      if (cache.has(key)) { id = cache.get(key); continue }
      let f = (await B.bookmarks.getChildren(id)).find((k) => !k.url && k.title === t)
      if (!f) { f = await B.bookmarks.create({ parentId: id, title: t }); made++ }
      cache.set(key, f.id); id = f.id
    }
    return id
  }
  for (const f of folders) {
    const pid = await ensure(f.path)
    for (const it of f.items) {
      const k = normUrl(it.u)
      if (have.has(k)) continue
      have.add(k)
      await B.bookmarks.create({ parentId: pid, title: it.t, url: it.u })
      if (++added % 200 === 0) onProgress?.(added)
    }
  }
  return { made, added }
}
