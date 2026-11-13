import { domainOf } from './logic.js'

// "Weitermachen"-Karten: Verlaufseinträge mit höchstens gapMs Abstand bilden eine Sitzung.
// shortcut: die history-API liefert pro URL nur den letzten Besuch, Sitzungen sind daher Näherungen; Titel = häufigste Domains, kein LLM.
export function resumeCards(items, { gapMs = 30 * 60e3, maxAgeMs = 3 * 864e5, min = 3, limit = 6, now = Date.now() } = {}) {
  const v = items.filter((i) => i.lastVisitTime && /^https?:/.test(i.url) && now - i.lastVisitTime < maxAgeMs).sort((a, b) => b.lastVisitTime - a.lastVisitTime)
  const groups = []
  let cur = null
  for (const i of v) {
    if (cur && cur.last - i.lastVisitTime <= gapMs) { cur.items.push(i); cur.last = i.lastVisitTime } else { cur = { items: [i], end: i.lastVisitTime, last: i.lastVisitTime }; groups.push(cur) }
  }
  return groups.filter((g) => g.items.length >= min).slice(0, limit).map((g) => {
    const c = {}
    for (const i of g.items) { const d = domainOf(i.url); c[d] = (c[d] || 0) + 1 }
    const title = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).map((e) => e[0]).join(' + ')
    return { title, end: g.end, items: g.items.slice(0, 10).map((i) => ({ title: i.title || i.url, url: i.url })) }
  })
}
