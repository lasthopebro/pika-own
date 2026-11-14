import test from 'node:test'
import assert from 'node:assert/strict'
import { nextIndex, filterSections } from '../lib/ui.js'

test('nextIndex: Pfeile mit Umlauf, Pos1/Ende, noch kein Fokus', () => {
  assert.equal(nextIndex(0, 3, 'ArrowDown'), 1)
  assert.equal(nextIndex(2, 3, 'ArrowDown'), 0)
  assert.equal(nextIndex(0, 3, 'ArrowUp'), 2)
  assert.equal(nextIndex(-1, 3, 'ArrowDown'), 0)
  assert.equal(nextIndex(-1, 3, 'ArrowUp'), 2)
  assert.equal(nextIndex(1, 5, 'Home'), 0)
  assert.equal(nextIndex(1, 5, 'End'), 4)
  assert.equal(nextIndex(1, 5, 'a'), 1)
  assert.equal(nextIndex(0, 0, 'ArrowDown'), -1)
})

test('filterSections: nur passende Zeilen und ihre Abschnitte', () => {
  const items = [{ section: true }, { hay: 'design theme' }, { section: true }, { hay: 'pomodoro: arbeit pomowork' }, { hay: 'pomodoro: pause pomobrk' }, { section: true }, { hay: 'seiten-icons favicons' }]
  assert.deepEqual(filterSections(items, ''), [true, true, true, true, true, true, true])
  assert.deepEqual(filterSections(items, 'pomo'), [false, false, true, true, true, false, false])
  assert.deepEqual(filterSections(items, 'POMO pause'), [false, false, true, false, true, false, false])
  assert.deepEqual(filterSections(items, 'gibtsnicht'), [false, false, false, false, false, false, false])
})
