import test from 'node:test'
import assert from 'node:assert/strict'
import { addFolder, assign, unassign, liveItems, applyTopics, undo, renameFolder, removeFolder } from '../lib/folders.js'

const S0 = () => ({ lf: [], snapshots: [] })

test('assign: eine URL liegt nur in einem Ordner, Duplikat durch #hash und Slash wird erkannt', () => {
  const S = S0(); const a = addFolder(S, 'A'), b = addFolder(S, 'B')
  assign(S, a.id, 'https://x.com/p', 'P'); assign(S, b.id, 'https://x.com/p/#top', 'P2')
  assert.equal(a.items.length, 0); assert.equal(b.items.length, 1)
  unassign(S, 'https://X.com/p'); assert.equal(b.items.length, 0)
})
test('assign: nur http(s), Umbenennen/Symbol/Löschen', () => {
  const S = S0(); const a = addFolder(S, '  '); assert.equal(a.name, 'Ordner')
  assign(S, a.id, 'chrome://settings'); assert.equal(a.items.length, 0)
  renameFolder(S, a.id, 'Neu', '🔥'); assert.deepEqual([a.name, a.icon], ['Neu', '🔥'])
  removeFolder(S, a.id); assert.equal(S.lf.length, 0)
})
test('liveItems: Neustart-Simulation, offen nach URL statt Tab-ID', () => {
  const S = S0(); const a = addFolder(S, 'A'); assign(S, a.id, 'https://a.com/1'); assign(S, a.id, 'https://b.com/')
  const saved = JSON.parse(JSON.stringify(S)) // „Neustart“: alle Tab-IDs weg, nur Speicher bleibt
  const l = liveItems(saved.lf[0], [{ id: 99, url: 'https://a.com/1#x' }])
  assert.deepEqual(l.map((i) => i.live), [true, false])
})
test('applyTopics + undo: Snapshot stellt den Stand davor wieder her', () => {
  const S = S0(); addFolder(S, 'Alt')
  applyTopics(S, { Alt: [0], Neu: [1] }, [{ url: 'https://a.com', title: 'a' }, { url: 'https://b.com', title: 'b' }])
  assert.deepEqual(S.lf.map((f) => f.name), ['Alt', 'Neu']); assert.equal(S.snapshots.length, 1)
  assert.equal(undo(S), true); assert.deepEqual(S.lf.map((f) => f.name), ['Alt']); assert.equal(S.lf[0].items.length, 0)
  assert.equal(undo(S), false)
})