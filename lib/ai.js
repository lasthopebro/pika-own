// KI-Anbieter: Ollama (lokal) und OpenRouter. Sendet nur Tab-Titel und Domains.
import { domainOf } from './logic.js'

const OLLAMA_HINT = ' – Ollama lehnt fremde Herkunft ab: OLLAMA_ORIGINS="moz-extension://*,chrome-extension://*" setzen und Ollama neu starten.'
const base = (ai) => ai.ollamaUrl.replace(/\/$/, '')

async function check(r, ai) {
  if (r.ok) return r
  throw new Error(`${ai.provider} ${r.status}` + (ai.provider === 'ollama' && r.status === 403 ? OLLAMA_HINT : ''))
}

export async function listModels(ai) {
  if (ai.provider === 'ollama') {
    const r = await check(await fetch(base(ai) + '/api/tags'), ai)
    return (await r.json()).models.map((m) => m.name)
  }
  const r = await check(await fetch('https://openrouter.ai/api/v1/models'), ai)
  return (await r.json()).data.filter((m) => m.pricing?.prompt === '0').map((m) => m.id).sort() // nur kostenlose Modelle
}

// Schema für Themen-Sortierung (Ollama structured output); OpenRouter bekommt nur den Prompt + Parser (parseAiTopics).
export const TOPICS_SCHEMA = { type: 'object', properties: { topics: { type: 'object', additionalProperties: { type: 'array', items: { type: 'integer' } } } }, required: ['topics'] }

export async function chat(ai, messages, format = TOPICS_SCHEMA) {
  if (ai.provider === 'ollama') {
    if (!ai.ollamaModel) throw new Error('Kein Ollama-Modell gewählt')
    // think:false, damit Qwen3 nicht erst "nachdenkt" und das JSON stört (nicht an allen Modellen geprüft)
    const r = await check(await fetch(base(ai) + '/api/chat', { method: 'POST', body: JSON.stringify({ model: ai.ollamaModel, messages, stream: false, think: false, format, options: { temperature: 0 } }) }), ai)
    return (await r.json()).message.content
  }
  if (!ai.orKey || !ai.orModel) throw new Error('OpenRouter: Schlüssel und Modell fehlen')
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + ai.orKey, 'Content-Type': 'application/json', 'X-Title': 'pika-own' },
    body: JSON.stringify({ model: ai.orModel, messages, temperature: 0 }),
  })
  if (r.status === 429 && ai.ollamaModel) return chat({ ...ai, provider: 'ollama' }, messages, format) // Tageslimit der Gratis-Modelle: lokal weitermachen
  await check(r, ai)
  return (await r.json()).choices[0].message.content
}

export function topicsMessages(tabs) {
  const list = tabs.slice(0, 150).map((t, i) => `${i}. ${(t.title || '').slice(0, 80)} — ${domainOf(t.url)}`).join('\n')
  return [
    { role: 'system', content: 'Du sortierst Browser-Tabs in Themen. Antworte NUR mit JSON: {"topics":{"Themenname":[Index,...]}}. Jeder Index genau einmal, 3 bis 8 Themen, kurze Namen in der Sprache der Titel.' },
    { role: 'user', content: list },
  ]
}
