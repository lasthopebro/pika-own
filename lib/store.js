import { B } from './api.js'

export const DEFAULT = {
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
  },
  meta: {}, // [url | 'f:'+id] -> { tags, comment, remind, icon, fav, color }
  tags: {}, // name -> Farbe
  open: {}, // Ordner-ID -> aufgeklappt
  workspaces: [{ id: 'w1', name: 'Haupt', folders: [], pinned: [], colNames: {}, widgets: [] }],
  currentWs: 'w1',
  sessions: [],
  views: [],
}

export async function load() {
  const { pika = {} } = await B.storage.local.get('pika')
  const s = pika.settings || {}
  return { ...DEFAULT, ...pika, settings: { ...DEFAULT.settings, ...s, bg: { ...DEFAULT.settings.bg, ...s.bg }, ai: { ...DEFAULT.settings.ai, ...s.ai } } }
}
export const save = (s) => B.storage.local.set({ pika: s })
