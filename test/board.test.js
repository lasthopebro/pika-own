import test from 'node:test'
import assert from 'node:assert/strict'
import { trashAdd, restoreParent, findDupes, discovery, toTree, TRASH_MAX } from '../lib/board.js'

const DAY = 864e5

test('trashAdd: Ordner als Baum, alte und überzählige Einträge fallen weg', () => {
  const f = { id: 'f', title: 'F', parentId: 'p', index: 2, children: [{ id: 'u', title: 'U', url: 'https://a.de' }] }
  assert.deepEqual(toTree(f), { title: 'F', children: [{ title: 'U', url: 'https://a.de' }] })
  let t = trashAdd([], f, 0)
  assert.equal(t[0].parentId, 'p')
  assert.equal(trashAdd(t, f, 8 * DAY).length, 1) // alter Eintrag weg, neuer da
  for (let i = 0; i < 30; i++) t = trashAdd(t, f, i)
  assert.equal(t.length, TRASH_MAX)
})

test('restoreParent: fehlender Elternordner -> Leiste', () => {
  const e = { parentId: 'x' }
  assert.equal(restoreParent(e, () => true, 'bar'), 'x')
  assert.equal(restoreParent(e, () => false, 'bar'), 'bar')
})

test('findDupes: gleiche URL trotz Slash/Hash, ältestes zuerst', () => {
  const g = findDupes([
    { id: 1, url: 'https://a.de/x/', dateAdded: 5 }, { id: 2, url: 'https://a.de/x#t', dateAdded: 1 }, { id: 3, url: 'https://b.de', dateAdded: 1 },
  ])
  assert.equal(g.length, 1)
  assert.deepEqual(g[0].map((n) => n.id), [2, 1])
})

test('discovery: zuletzt und meistbesucht', () => {
  const n = [{ id: 1, url: 'https://a.de', dateAdded: 1 }, { id: 2, url: 'https://b.de', dateAdded: 9 }, { id: 3, url: 'https://c.de', dateAdded: 5 }]
  assert.deepEqual(discovery('recent', n, [], 2).map((x) => x.id), [2, 3])
  const hist = [{ url: 'https://a.de', visitCount: 7 }, { url: 'https://c.de/', visitCount: 3 }]
  assert.deepEqual(discovery('top', n, hist).map((x) => x.id), [1, 3])
})
