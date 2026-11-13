import { B } from './api.js'

export const SCHEMA = 2

export const DEFAULT = {
  schema: SCHEMA,
  settings: {
    theme: 'system', accent: '#6366f1', pitch: false, view: 'board', favicons: false, hidden: [],
    bg: { type: 'none', preset: 'aurora', c1: '#1e1b4b', c2: '#0f766e', intensity: 60, grain: 15, parallax: true },
    bars: [
      { id: 'top', name: 'Meistbesucht', mode: 'top', filter: '', limit: 14 },
      { id: 'recent', name: 'Zuletzt besucht', mode: 'recent', filter: '', limit: 10 },
      { id: 'today', name: 'Heute', mode: 'today', filter: '', limit: 10 },
      { id: 'dev', name: 'Entwicklung', mode: 'top', filter: 'github|gitlab|stackoverflow|npmjs|mozilla|mdn|localhost|docs\\.', limit: 10 },
      { id: 'ai', name: 'KI-Tools', mode: 'top', filter: 'openai|anthropic|claude|openrouter|ollama|huggingface|perplexity|gemini|poe\\.com', limit: 10 },
    ],
    ai: { provider: 'ollama', ollamaUrl: 'http://localhost:11434', ollamaModel: '', orKey: '', orModel: '' },
    pagebar: { on: false, exclude: '', collapsed: false, quick: 8 },
    backup: { lastExport: 0, nagUntil: 0 }, // Datei-Export außerhalb des Profils (Hinweis nach 14 Tagen)
  },
  meta: {}, // [url | 'f:'+id] -> { tags, comment, remind, icon, fav, color }
  tags: {}, // name -> Farbe
  open: {}, // Ordner-ID -> aufgeklappt
  workspaces: [{ id: 'w1', name: 'Haupt', folders: [], pinned: [], colNames: {}, widgets: [] }],
  currentWs: 'w1',
  sessions: [],
  views: [],
  lf: [], // Live-Tab-Ordner: { id, name, icon, items: [{ u, t }] }
  snapshots: [], // Stand von lf vor einer KI-Sortierung (für Rückgängig)
}

// Rein und wiederholbar: v1 -> v2 ergänzt lf und snapshots, ändert sonst nichts.
export function migrate(p = {}) {
  if ((p.schema || 1) >= SCHEMA) return p
  return { ...p, schema: SCHEMA, lf: p.lf ?? [], snapshots: p.snapshots ?? [] }
}

export function merge(pika = {}) {
  const s = pika.settings || {}
  return { ...DEFAULT, ...pika, settings: { ...DEFAULT.settings, ...s, bg: { ...DEFAULT.settings.bg, ...s.bg }, ai: { ...DEFAULT.settings.ai, ...s.ai }, pagebar: { ...DEFAULT.settings.pagebar, ...s.pagebar }, backup: { ...DEFAULT.settings.backup, ...s.backup } } }
}

export async function load() {
  const { pika } = await B.storage.local.get('pika')
  if (pika && (pika.schema || 1) < SCHEMA) {
    await B.storage.local.set({ pika_pre_v2: pika }) // Sicherung vor der Migration
    const m = migrate(pika)
    await B.storage.local.set({ pika: m })
    return merge(m)
  }
  return merge(pika)
}
export const save = (s) => B.storage.local.set({ pika: s })

// Lesen-Ändern-Schreiben unter einer Sperre: serialisiert alle Schreiber (Hintergrund, Neuer Tab, Seitenleiste).
let q = Promise.resolve()
const locked = (fn) => (globalThis.navigator?.locks ? navigator.locks.request('pika-state', fn) : fn())
export function update(fn) {
  const run = q.then(() => locked(async () => { const S = await load(); const r = await fn(S); await save(S); return r }))
  q = run.catch(() => {})
  return run
}