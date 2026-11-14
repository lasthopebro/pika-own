import { B } from './api.js'

export const SCHEMA = 2

export const DEFAULT = {
  schema: SCHEMA,
  settings: {
    theme: 'system', accent: '#6366f1', pitch: false, view: 'board', font: 'sans', discover: false, favicons: false, hidden: [], newtabBar: true, openInNewTab: false, confirmDelete: true, pomo: { work: 25, brk: 5 },
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
    backup: { lastExport: 0, nagUntil: 0, nagDays: 14 }, // Datei-Export außerhalb des Profils (Hinweis nach nagDays Tagen, 0 = nie)
  },
  meta: {}, // [url | 'f:'+id] -> { tags, comment, remind, icon, fav, color }
  tags: {}, // name -> Farbe
  open: {}, // Ordner-ID -> aufgeklappt
  workspaces: [{ id: 'w1', name: 'Haupt', folders: [], pinned: [], colNames: {}, widgets: [] }],
  currentWs: 'w1',
  sessions: [],
  views: [],
  lf: [], // Live-Tab-Ordner: { id, name, icon, items: [{ u, t }] }
  trash: [], // Papierkorb: { at, parentId, index, tree }, 7 Tage, höchstens 20
  snapshots: [], // Stand von lf vor einer KI-Sortierung (für Rückgängig)
}

// Rein und wiederholbar: v1 -> v2 ergänzt lf und snapshots, ändert sonst nichts.
export function migrate(p = {}) {
  if ((p.schema || 1) >= SCHEMA) return p
  return { ...p, schema: SCHEMA, lf: p.lf ?? [], snapshots: p.snapshots ?? [] }
}

export function merge(pika = {}) {
  const s = pika.settings || {}
  return { ...DEFAULT, ...pika, settings: { ...DEFAULT.settings, ...s, bg: { ...DEFAULT.settings.bg, ...s.bg }, ai: { ...DEFAULT.settings.ai, ...s.ai }, pagebar: { ...DEFAULT.settings.pagebar, ...s.pagebar }, backup: { ...DEFAULT.settings.backup, ...s.backup }, pomo: { ...DEFAULT.settings.pomo, ...s.pomo } } }
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
const save = (s) => B.storage.local.set({ pika: s }) // nur über update(), sonst überschreiben sich Schreiber

// Lesen-Ändern-Schreiben unter einer Sperre: serialisiert alle Schreiber (Hintergrund, Neuer Tab, Seitenleiste).
let q = Promise.resolve()
const locked = (fn) => (globalThis.navigator?.locks ? navigator.locks.request('pika-state', fn) : fn())
export function update(fn) {
  const run = q.then(() => locked(async () => { const S = await load(); const r = await fn(S); await save(S); return r }))
  q = run.catch(() => {})
  return run
}

// Widgets schreiben nie den ganzen Tab-Zustand, sondern ändern unter der Sperre genau ein Widget (Stand aus dem Speicher, nicht aus dem Tab).
// seen(S) läuft in der Sperre mit dem geschriebenen Gesamtstand (der Neue Tab merkt ihn sich, um sein eigenes Änderungsereignis zu erkennen).
const widgetsOf = (S) => S.workspaces.flatMap((x) => x.widgets || [])
// Liefert das gespeicherte Widget (oder null, wenn es nicht mehr existiert).
export const patchWidget = (id, fn, seen) => update((S) => { const w = widgetsOf(S).find((x) => x?.id === id); if (!w) return null; fn(w); seen?.(S); return w })
export const addWidget = (wsId, w, seen) => update((S) => { ((S.workspaces.find((x) => x.id === wsId) || S.workspaces[0]).widgets ||= []).push(w); seen?.(S) })
export const removeWidget = (id, seen) => update((S) => { for (const x of S.workspaces) x.widgets = (x.widgets || []).filter((w) => w?.id !== id); seen?.(S) })
