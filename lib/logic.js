// Reine Logik ohne Browser-API, damit sie mit `node --test` prüfbar ist.

export const domainOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

export function normUrl(u) {
  try { const x = new URL(u); x.hash = ''; return (x.origin + x.pathname.replace(/\/$/, '') + x.search).toLowerCase() } catch { return u }
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const safeRe = (s) => { try { return new RegExp(s, 'i') } catch { return new RegExp(esc(s), 'i') } }

// Verlaufseinträge -> Schnellwahl-Kacheln je Domain. mode: top | recent | today
export function groupHistory(items, { mode = 'top', filter = '', now = 0, hidden = [], limit = 12 } = {}) {
  const day = new Date(now); day.setHours(0, 0, 0, 0)
  const re = filter ? safeRe(filter) : null
  const by = new Map()
  for (const it of items) {
    if (!/^https?:/.test(it.url)) continue
    const d = domainOf(it.url)
    if (!d || hidden.includes(d) || (re && !re.test(d))) continue
    const last = it.lastVisitTime || 0
    if (mode === 'today' && last < +day) continue
    let g = by.get(d)
    if (!g) by.set(d, (g = { domain: d, visits: 0, last: 0, subs: [] }))
    const v = it.visitCount || 1
    g.visits += v
    g.last = Math.max(g.last, last)
    g.subs.push({ url: it.url, title: it.title || it.url, visits: v })
  }
  const arr = [...by.values()]
  arr.sort(mode === 'top' ? (a, b) => b.visits - a.visits : (a, b) => b.last - a.last || b.visits - a.visits)
  for (const g of arr) g.subs.sort((a, b) => b.visits - a.visits)
  return arr.slice(0, limit)
}

// Sammelumbenennen: Suchen/Ersetzen (Text oder Regex) und Groß-/Kleinschreibung. Wirft bei ungültiger Regex.
export function renameName(name, { find = '', replace = '', regex = false, caseMode = 'none' } = {}) {
  let out = name
  if (find) out = regex ? out.replace(new RegExp(find, 'g'), replace) : out.replace(new RegExp(esc(find), 'g'), () => replace)
  if (caseMode === 'upper') out = out.toUpperCase()
  else if (caseMode === 'lower') out = out.toLowerCase()
  else if (caseMode === 'title') out = out.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase())
  return out
}

// KI-Antwort -> { Thema: [Tab-Indizes] }. Jeder Index höchstens einmal, Rest landet unter "Sonstiges".
export function parseAiTopics(text, n) {
  const m = String(text).match(/\{[\s\S]*\}/)
  if (!m) throw new Error('Keine JSON-Antwort von der KI')
  const obj = JSON.parse(m[0])
  const topics = obj.topics ?? obj
  const seen = new Set()
  const out = {}
  for (const [name, idx] of Object.entries(topics)) {
    if (!Array.isArray(idx)) continue
    const ok = []
    for (const i of idx) if (Number.isInteger(i) && i >= 0 && i < n && !seen.has(i)) { seen.add(i); ok.push(i) }
    if (ok.length) out[String(name).slice(0, 60)] = ok
  }
  const rest = [...Array(n).keys()].filter((i) => !seen.has(i))
  if (rest.length) out['Sonstiges'] = [...(out['Sonstiges'] || []), ...rest]
  return out
}

// Suchtreffer-Wertung für die Befehlspalette (0 = kein Treffer)
export function score(q, text) {
  q = q.toLowerCase(); text = text.toLowerCase()
  if (!q) return 1
  const i = text.indexOf(q)
  if (i >= 0) return 100 - Math.min(i, 50)
  let k = 0
  for (const c of text) { if (c === q[k]) k++; if (k === q.length) return 10 }
  return 0
}

// Zeilen "Name ; Modus ; Filter(Regex) ; Anzahl" <-> Leistenliste
export function parseBars(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const [name, mode = 'top', filter = '', limit = '12'] = l.split(';').map((s) => s.trim())
    return { id: 'b' + i, name, mode: ['top', 'recent', 'today'].includes(mode) ? mode : 'top', filter, limit: Math.min(40, Math.max(1, parseInt(limit) || 12)) }
  })
}
export const barsToText = (bars) => bars.map((b) => `${b.name} ; ${b.mode} ; ${b.filter} ; ${b.limit}`).join('\n')
