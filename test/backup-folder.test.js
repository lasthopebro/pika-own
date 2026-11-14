import test from 'node:test'
import assert from 'node:assert/strict'
import { writeSnapshot, readSnapshot, listSnapshots, prune, access, saveHandle, loadHandle } from '../lib/backup-folder.js'
import { fileName, toDelete } from '../lib/backup-plan.js'

// Fake-Verzeichnis im Stil von FileSystemDirectoryHandle.
function fakeDir({ failWrite = false, perm = 'granted' } = {}) {
  const files = new Map()
  return {
    files,
    async getFileHandle(name, o = {}) {
      if (!files.has(name)) { if (!o.create) throw new Error('NotFound'); files.set(name, { text: '', ts: 0 }) }
      const f = files.get(name)
      return { kind: 'file', getFile: async () => ({ text: async () => f.text, lastModified: f.ts }),
        createWritable: async () => { let buf = ''; return { write: async (t) => { if (failWrite) throw new Error('Platte voll'); buf += t }, close: async () => { f.text = buf; f.ts = Date.now() }, abort: async () => {} } } }
    },
    async *entries() { for (const [n, f] of files) yield [n, { kind: 'file', getFile: async () => ({ lastModified: f.ts }) }] },
    async removeEntry(n) { files.delete(n) },
    queryPermission: async () => perm, requestPermission: async () => 'granted',
  }
}

test('6 Tage schreiben: 5 eigene bleiben, Fremddatei unberührt', async () => {
  const d = fakeDir(); d.files.set('urlaub.jpg', { text: 'x', ts: 1 })
  for (let i = 1; i <= 6; i++) {
    await writeSnapshot(d, fileName('pc', new Date(2026, 0, i, 12).getTime()), JSON.stringify({ i }))
    await prune(d, toDelete([...d.files.keys()], 'pc', 5))
  }
  assert.deepEqual([...d.files.keys()].sort(), ['pika-pc-20260102.json', 'pika-pc-20260103.json', 'pika-pc-20260104.json', 'pika-pc-20260105.json', 'pika-pc-20260106.json', 'urlaub.jpg'])
  assert.equal(d.files.get('urlaub.jpg').text, 'x')
  assert.deepEqual(await readSnapshot(d, 'pika-pc-20260106.json'), { i: 6 })
})

test('gleicher Tag zweimal: eine Datei, neuer Inhalt', async () => {
  const d = fakeDir(); const n = fileName('pc', Date.now())
  await writeSnapshot(d, n, '{"a":1}'); await writeSnapshot(d, n, '{"a":2}')
  assert.equal(d.files.size, 1); assert.deepEqual(await readSnapshot(d, n), { a: 2 })
})

test('listSnapshots: nur *.json, neueste zuerst', async () => {
  const d = fakeDir(); d.files.set('a.json', { text: '', ts: 5 }); d.files.set('b.json', { text: '', ts: 9 }); d.files.set('c.jpg', { text: '', ts: 99 })
  assert.deepEqual((await listSnapshots(d)).map((x) => x.name), ['b.json', 'a.json'])
})

test('Schreibfehler wirft', async () => {
  await assert.rejects(writeSnapshot(fakeDir({ failWrite: true }), 'x.json', '{}'), /Platte voll/)
})

test('access: granted/prompt/denied, ask erneuert', async () => {
  assert.equal(await access(fakeDir()), 'granted')
  assert.equal(await access(fakeDir({ perm: 'prompt' })), 'prompt')
  assert.equal(await access(fakeDir({ perm: 'prompt' }), true), 'granted')
  assert.equal(await access({ queryPermission: async () => { throw new Error('x') } }), 'denied')
})

test('Handle-Speicher mit Fake', async () => {
  const m = new Map(), store = { get: async (k) => m.get(k), set: async (k, v) => void m.set(k, v) }
  assert.equal(await loadHandle(store), null)
  const d = fakeDir(); await saveHandle(d, store)
  assert.equal(await loadHandle(store), d)
})
