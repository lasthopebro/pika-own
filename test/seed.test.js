import test from 'node:test'
import assert from 'node:assert/strict'

// Gefälschte bookmarks-API: Baum im Speicher, damit importFolders ohne Browser läuft.
let nid = 100
const root = { id: '0', children: [{ id: '1', title: 'Leiste', children: [{ id: '5', parentId: '1', title: 'Inbox', url: 'https://mail.example/#inbox' }] }, { id: '2', title: 'Weitere', children: [] }] }
const nodes = new Map()
;(function idx(n) { nodes.set(n.id, n); n.children?.forEach(idx) })(root)
globalThis.chrome = { bookmarks: {
  getTree: async () => [root],
  getChildren: async (id) => nodes.get(id).children,
  create: async ({ parentId, title, url }) => { const n = { id: String(nid++), parentId, title, ...(url ? { url } : { children: [] }) }; nodes.get(parentId).children.push(n); nodes.set(n.id, n); return n },
} }
const { importFolders } = await import('../lib/seed.js')

test('importFolders: Adressen, die sich nur durch #… oder Groß/Klein unterscheiden, gehen nicht verloren', async () => {
  const r = await importFolders([{ path: [], items: [
    { t: 'Sent', u: 'https://mail.example/#sent' }, { t: 'Inbox', u: 'https://mail.example/#inbox' },
    { t: 'Video A', u: 'https://v.example/?v=AbC' }, { t: 'Video a', u: 'https://v.example/?v=abc' },
  ] }])
  assert.equal(r.added, 3, 'nur die exakt vorhandene Inbox wird übersprungen')
})
test('importFolders: zweiter Lauf legt nichts doppelt an, Ordner werden wiederverwendet', async () => {
  const f = [{ path: ['Neu'], items: [{ t: 'x', u: 'https://x.example/' }] }]
  const a = await importFolders(f), b = await importFolders(f)
  assert.deepEqual([a.added, a.made, b.added, b.made], [1, 1, 0, 0])
})
