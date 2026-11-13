// Ollama-REST: Erreichbarkeit, Modellliste, Download mit Fortschritt, Löschen. Größen sind Richtwerte (Ollama-Katalog).
export const RECOMMENDED = [['qwen3:4b', '≈2,5 GB · Standard, gut für Deutsch'], ['qwen3:1.7b', '≈1,4 GB · für schwache Rechner'], ['gemma3:4b', '≈3,3 GB · Alternative']]
const u = (base, p) => base.replace(/\/$/, '') + p
const bad = (r) => new Error('Ollama ' + r.status)
export const parseProgress = (j) => ({ status: j.status || '', pct: j.total ? Math.round((100 * (j.completed || 0)) / j.total) : null })

export async function ping(base) {
  try { return (await fetch(u(base, '/api/version'), { signal: AbortSignal.timeout(2000) })).ok } catch { return false }
}
export async function tags(base) {
  const r = await fetch(u(base, '/api/tags')); if (!r.ok) throw bad(r)
  return (await r.json()).models.map((m) => ({ name: m.name, size: m.size }))
}
export async function remove(base, model) {
  const r = await fetch(u(base, '/api/delete'), { method: 'DELETE', body: JSON.stringify({ model }) }); if (!r.ok) throw bad(r)
}
// Streaming-NDJSON; Abbruch per AbortSignal, ein späterer Pull setzt fort.
export async function pull(base, model, onProgress, signal) {
  const r = await fetch(u(base, '/api/pull'), { method: 'POST', body: JSON.stringify({ model, stream: true }), signal }); if (!r.ok) throw bad(r)
  const rd = r.body.getReader(), dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await rd.read(); if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n'); buf = lines.pop()
    for (const l of lines) if (l.trim()) { const j = JSON.parse(l); if (j.error) throw new Error(j.error); onProgress(parseProgress(j)) }
  }
}
