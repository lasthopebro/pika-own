import { B } from './api.js'
import { load, update, DEFAULT } from './store.js'
import { treeToFolders, importFolders } from './seed.js'

// Sicherung = pika-Zustand + Lesezeichenbaum. Lokal in storage.local, die letzten 7 bleiben.
export async function makeBackup() {
  return { v: 1, ts: Date.now(), state: await load(), folders: treeToFolders(await B.bookmarks.getTree()) }
}
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
  if (b?.v !== 1 || !b.state) throw new Error('Keine gültige pika-own-Sicherung')
  await update((cur) => { Object.assign(cur, DEFAULT, b.state) }) // unter der Sperre, wie alle Schreiber
  return importFolders(b.folders || [])
}
