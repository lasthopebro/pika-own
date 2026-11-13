import { B } from './api.js'

// Echter Verlauf (history-API) + optionale Seed-Daten aus data/seed-dials.json (Verlauf anderer Browser).
// Gleiche URL: höchster Besuchszähler gewinnt, nichts wird doppelt gezählt.
export async function loadItems() {
  const by = new Map()
  const add = (it) => { const o = by.get(it.url); if (!o || (it.visitCount || 0) > (o.visitCount || 0)) by.set(it.url, { ...o, ...it, lastVisitTime: Math.max(o?.lastVisitTime || 0, it.lastVisitTime || 0) }) }
  try { (await B.history.search({ text: '', startTime: 0, maxResults: 5000 })).forEach(add) } catch {}
  try {
    const r = await fetch(B.runtime.getURL('data/seed-dials.json'))
    if (r.ok) for (const d of await r.json()) for (const s of d.subs) add({ url: s.u, title: s.t, visitCount: s.v, lastVisitTime: 0 })
  } catch {}
  return [...by.values()]
}
