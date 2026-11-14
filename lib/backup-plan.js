// Reine Namens- und Aufbewahrungslogik des Sicherungsordners (kein Dateizugriff).

// Gerätename -> nur [a-z0-9-]; alles andere (auch "../") wird zu "-", nie leer.
export const deviceSlug = (device) => String(device ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'geraet'
export const devicePrefix = (device) => `pika-${deviceSlug(device)}-`
const pad = (n) => String(n).padStart(2, '0')
// Ein Tag = ein lokaler Kalendertag.
export const dayKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` }
export const fileName = (device, ts) => `${devicePrefix(device)}${dayKey(ts)}.json`

// Nur eigene Muster-Dateien (pika-<gerät>-JJJJMMTT.json) zählen; die neuesten `keep` bleiben, der Rest wird älteste zuerst geliefert.
export function toDelete(names, device, keep) {
  const p = devicePrefix(device)
  const own = names.filter((n) => n.startsWith(p) && /^\d{8}\.json$/.test(n.slice(p.length))).sort((a, b) => a.slice(p.length).localeCompare(b.slice(p.length)))
  return own.slice(0, Math.max(0, own.length - Math.max(1, Math.floor(keep) || 1)))
}

// Frisch = kaum Lesezeichen, nie exportiert, keine Widgets und keine Tags.
export const isFreshProfile = (urlCount, state = {}) =>
  urlCount <= 3 && !(state.settings?.backup?.lastExport) && !(state.workspaces || []).some((w) => (w.widgets || []).length) && !Object.keys(state.tags || {}).length
