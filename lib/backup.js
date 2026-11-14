import { B } from './api.js'
import { load, update, DEFAULT } from './store.js'
import { treeToFolders, importFolders } from './seed.js'

// Sicherung = pika-Zustand + Lesezeichenbaum. Lokal in storage.local, die letzten 7 bleiben.
export async function makeBackup() {
  return { v: 1, ts: Date.now(), state: await load(), folders: treeToFolders(await B.bookmarks.getTree()) }
}
// Für alles, was den Browser verlässt (Datei, Ordner): ohne API-Schlüssel.
export async function makeExport() {
  const b = await makeBackup()
  b.state.settings.ai.orKey = ''
  return b
}
const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x)
// workspaces darf fehlen (dann gilt der Standard), muss sonst eine Liste von Arbeitsbereichen mit Widget-Listen sein.
export const isBackup = (b) => b?.v === 1 && isObj(b.state) && (b.state.workspaces === undefined || (Array.isArray(b.state.workspaces) && b.state.workspaces.every((w) => isObj(w) && (w.widgets === undefined || Array.isArray(w.widgets)))))
export async function saveBackup() {
  const { pika_backups: old = [] } = await B.storage.local.get('pika_backups')
  const list = [await makeBackup(), ...old].slice(0, 7)
  await B.storage.local.set({ pika_backups: list })
  return list
}
export async function listBackups() {
  return (await B.storage.local.get('pika_backups')).pika_backups || []
}
// Stellt den Zustand wieder her und legt fehlende Lesezeichen neu an (vorhandene werden nie gelöscht).
export async function restore(b) {
  if (!isBackup(b)) throw new Error('Keine gültige pika-own-Sicherung')
  await update((cur) => {  // unter der Sperre, wie alle Schreiber
    const key = cur.settings?.ai?.orKey
    Object.assign(cur, DEFAULT, b.state)
    if (key && !cur.settings?.ai?.orKey) cur.settings = { ...cur.settings, ai: { ...cur.settings?.ai, orKey: key } } // Sicherungen tragen keinen Schlüssel: den vorhandenen behalten
  })
  return importFolders(b.folders || [])
}
