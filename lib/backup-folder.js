// Dateizugriff des Sicherungsordners (File System Access, nur Chromium). Alle Funktionen nehmen ein
// FileSystemDirectoryHandle-ähnliches Objekt, damit ein Fake im Node-Test genügt. Aufruf nur nach Nutzeraktion bzw. mit gespeichertem Handle.

export const supported = () => typeof globalThis.showDirectoryPicker === 'function'
export const pick = () => globalThis.showDirectoryPicker({ mode: 'readwrite' })

// Schreibt (ersetzt) eine Datei; createWritable tauscht erst beim Schließen, ein Fehler lässt die alte Datei heil.
export async function writeSnapshot(dir, name, json) {
  const w = await (await dir.getFileHandle(name, { create: true })).createWritable()
  try { await w.write(json); await w.close() } catch (e) { await w.abort?.().catch(() => {}); throw e }
}
export async function readSnapshot(dir, name) {
  return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text())
}
// Alle *.json im Ordner (auch von anderen Geräten), neueste zuerst.
export async function listSnapshots(dir) {
  const out = []
  for await (const [name, h] of dir.entries()) if (h.kind === 'file' && /\.json$/i.test(name)) out.push({ name, ts: (await h.getFile()).lastModified })
  return out.sort((a, b) => b.ts - a.ts || b.name.localeCompare(a.name))
}
export async function prune(dir, names) {
  for (const n of names) await dir.removeEntry(n)
}

// 'granted' | 'prompt' | 'denied'; mit ask=true (nur in einer Klick-Geste) wird der Zugriff erneut erfragt.
export async function access(dir, ask = false) {
  const o = { mode: 'readwrite' }
  try {
    let p = await dir.queryPermission(o)
    if (p === 'prompt' && ask) p = await dir.requestPermission(o)
    return p
  } catch { return 'denied' }
}

// Handle in IndexedDB (ein Handle ist kein JSON). store = { get, set } nur für den Test austauschbar.
const idb = (mode, fn) => new Promise((res, rej) => {
  const open = indexedDB.open('pika-folder', 1)
  open.onupgradeneeded = () => open.result.createObjectStore('h')
  open.onerror = () => rej(open.error)
  open.onsuccess = () => {
    const r = fn(open.result.transaction('h', mode).objectStore('h'))
    r.onsuccess = () => { open.result.close(); res(r.result) }
    r.onerror = () => rej(r.error)
  }
})
export const idbStore = { get: (k) => idb('readonly', (s) => s.get(k)), set: (k, v) => idb('readwrite', (s) => s.put(v, k)) }
export const saveHandle = (dir, store = idbStore) => store.set('pika-folder', dir)
export const loadHandle = async (store = idbStore) => (await store.get('pika-folder')) || null
