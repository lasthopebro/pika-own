import test from 'node:test'
import assert from 'node:assert/strict'
import { menuSpecs, menuKey } from '../lib/ctxmenu.js'

test('Kontextmenü: ein Eintrag oberster Ebene „pika-own“, alles andere darunter', () => {
  const specs = menuSpecs([])
  assert.deepEqual(specs.filter((s) => !s.parentId).map((s) => s.title), ['pika-own'])
  assert.deepEqual(specs.filter((s) => s.parentId === 'pika').map((s) => s.title), ['Seite speichern', 'In Live-Ordner ▸', 'Alle Tabs als Ordner', 'Alle Tabs als Sitzung'])
  assert.equal(specs.find((s) => s.id === 'lf-none').enabled, false) // ohne Ordner: Hinweis statt leerem Untermenü
})
test('Kontextmenü: Live-Ordner erscheinen als lf:<id> im Untermenü', () => {
  const lf = [{ id: 'a', name: 'Projekt', icon: '📁' }, { id: 'b', name: 'Lesen', icon: '📚' }]
  const kids = menuSpecs(lf).filter((s) => s.parentId === 'lf-parent')
  assert.deepEqual(kids.map((s) => s.id), ['lf:a', 'lf:b']); assert.equal(kids[1].title, '📚 Lesen')
  assert.notEqual(menuKey(lf), menuKey([...lf, { id: 'c', name: 'Neu', icon: '🔥' }]))
  assert.equal(menuKey(lf), menuKey(lf.map((f) => ({ ...f, items: [1] })))) // Inhalt ändert das Menü nicht
})
test('Kontextmenü: Link-Speichern und Ordner-Zuordnung auch auf Links', () => {
  const specs = menuSpecs([{ id: 'a', name: 'P', icon: 'x' }])
  for (const id of ['save-page', 'lf:a']) assert.ok(specs.find((s) => s.id === id).contexts.includes('link'))
})
