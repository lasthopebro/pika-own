import { B } from './api.js'

export async function openTabs() {
  return (await B.tabs.query({ currentWindow: true })).filter((t) => /^https?:/.test(t.url || ''))
}
export async function saveSession(S, name, tabs) {
  tabs ??= await openTabs()
  S.sessions.unshift({ id: crypto.randomUUID(), name: name || 'Sitzung', ts: Date.now(), tabs: tabs.map((t) => ({ title: t.title || t.url, url: t.url })) })
}
export const openSession = (s) => B.windows.create({ url: s.tabs.map((t) => t.url) })
