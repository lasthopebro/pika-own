import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanPath, crumbs, children, filterChildren, up, pathTo, folderList } from '../lib/gallery.js'

const tree = { id: 'r', children: [
  { id: 'bar', parentId: 'r', title: 'Leiste', children: [
    { id: 'dev', parentId: 'bar', title: 'Dev', children: [{ id: 'g', parentId: 'dev', title: 'GitHub', url: 'https://github.com/x' }, { id: 'sub', parentId: 'dev', title: 'Tools', children: [] }] },
    { id: 'a', parentId: 'bar', title: 'Alpha', url: 'https://a.example' },
  ] },
  { id: 'other', parentId: 'r', title: '', children: [{ id: 'deep', parentId: 'other', title: 'Tief', children: [] }] },
] }
const byId = new Map()
;(function w(n) { byId.set(n.id, n); n.children?.forEach(w) })(tree)

test('crumbs: Pfad mit gelöschtem Ordner bricht nicht, Lesezeichen sind keine Stufe', () => {
  assert.deepEqual(crumbs(['bar', 'dev'], byId), [{ id: 'bar', title: 'Leiste' }, { id: 'dev', title: 'Dev' }])
  assert.deepEqual(crumbs(['bar', 'weg', 'dev'], byId), [{ id: 'bar', title: 'Leiste' }])
  assert.deepEqual(cleanPath(['bar', 'a'], byId), ['bar'])
  assert.deepEqual(crumbs([], byId), [])
  assert.equal(crumbs(['other'], byId)[0].title, 'Ordner')
})

test('children: Ordner zuerst, dann Lesezeichen, Reihenfolge bleibt', () => {
  assert.deepEqual(children(byId.get('bar')).map((n) => n.id), ['dev', 'a'])
  assert.deepEqual(children(byId.get('dev')).map((n) => n.id), ['sub', 'g'])
  assert.deepEqual(children({}), [])
})

test('filterChildren: Titel und Adresse, Groß/Klein egal, leer zeigt alles', () => {
  const l = children(byId.get('dev'))
  assert.deepEqual(filterChildren(l, 'GIT').map((n) => n.id), ['g'])
  assert.deepEqual(filterChildren(l, 'github.com/x').map((n) => n.id), ['g'])
  assert.deepEqual(filterChildren(l, 'tool').map((n) => n.id), ['sub'])
  assert.equal(filterChildren(l, '  ').length, 2)
  assert.equal(filterChildren(l).length, 2)
  assert.equal(filterChildren(l, 'zzz').length, 0)
})

test('up: eine Ebene höher, auf Home null', () => {
  assert.equal(up([]), null)
  assert.deepEqual(up(['bar']), [])
  assert.deepEqual(up(['bar', 'dev']), ['bar'])
})

test('pathTo: aufwärts bis zur Home-Spalte, sonst nur der Ordner', () => {
  assert.deepEqual(pathTo('sub', byId, ['dev', 'other']), ['dev', 'sub'])
  assert.deepEqual(pathTo('dev', byId, ['dev']), ['dev'])
  assert.deepEqual(pathTo('deep', byId, ['bar']), ['deep'])
  assert.deepEqual(pathTo('weg', byId, ['bar']), ['weg'])
})

test('folderList: Ordner mit Tiefe, virtuelle Leiste auf die echte Leiste, andere virtuelle entfallen', () => {
  const cols = [{ id: 'virtual', title: 'Leiste', virtual: true, children: [] }, byId.get('dev'), { id: 'virtual-top', title: 'Meistbesucht', virtual: true, children: [] }]
  assert.deepEqual(folderList(cols, 'bar'), [{ id: 'bar', title: 'Leiste', depth: 0 }, { id: 'dev', title: 'Dev', depth: 0 }, { id: 'sub', title: 'Tools', depth: 1 }])
  assert.equal(folderList(cols, '').length, 2)
})
