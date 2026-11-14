import test from 'node:test'
import assert from 'node:assert/strict'
import { sortTodos, dueSoon, isOverdue, planTodoAlarms } from '../lib/todo.js'

const NOW = 1_000_000
const it = (id, extra = {}) => ({ id, t: id, done: false, ...extra })

test('sortTodos: überfällig oben, dann Datum, dann ohne Datum, erledigt unten', () => {
  const items = [it('ohne'), it('fertig', { done: true, due: NOW - 5 }), it('spaet', { due: NOW + 20 }), it('gestern', { due: NOW - 10 }), it('bald', { due: NOW + 5 }), it('vorgestern', { due: NOW - 20 })]
  assert.deepEqual(sortTodos(items, NOW).map((i) => i.id), ['vorgestern', 'gestern', 'bald', 'spaet', 'ohne', 'fertig'])
})
test('sortTodos: verändert die Eingabe nicht, Reihenfolge ohne Datum bleibt', () => {
  const items = [it('b'), it('a')]
  assert.deepEqual(sortTodos(items, NOW).map((i) => i.id), ['b', 'a'])
  assert.deepEqual(items.map((i) => i.id), ['b', 'a'])
})
test('isOverdue: erledigt und ohne Datum nie', () => {
  assert.equal(isOverdue(it('x', { due: NOW }), NOW), true)
  assert.equal(isOverdue(it('x', { due: NOW + 1 }), NOW), false)
  assert.equal(isOverdue(it('x', { due: NOW - 1, done: true }), NOW), false)
  assert.equal(isOverdue(it('x'), NOW), false)
})
test('dueSoon: nur fällige, offene, noch nicht gemeldete', () => {
  const items = [it('a', { due: NOW - 1 }), it('b', { due: NOW - 1, notified: true }), it('c', { due: NOW + 1 }), it('d', { due: NOW - 1, done: true }), it('e')]
  assert.deepEqual(dueSoon(items, NOW).map((i) => i.id), ['a'])
})
test('planTodoAlarms: Namen, Reihenfolge nach Datum, nur offene ungemeldete, höchstens max', () => {
  const ws = [{ widgets: [{ id: 'w1', type: 'todo', items: [it('a', { due: 30 }), it('b', { due: 10 }), it('c', { due: 20, notified: true }), it('d', { due: 5, done: true }), it('e')] }, { id: 'w2', type: 'counter', items: [it('z', { due: 1 })] }, null] }, { widgets: [{ id: 'w3', type: 'todo', items: [it('f', { due: 15 })] }] }, {}]
  const plan = planTodoAlarms(ws)
  assert.deepEqual(plan.map((p) => p.name), ['todo|w1|b', 'todo|w3|f', 'todo|w1|a'])
  assert.deepEqual(plan[0], { name: 'todo|w1|b', wid: 'w1', iid: 'b', when: 10 })
  assert.deepEqual(planTodoAlarms(ws, 2).map((p) => p.iid), ['b', 'f'])
  assert.deepEqual(planTodoAlarms(undefined), [])
})
