import test from 'node:test'
import assert from 'node:assert/strict'
import { STEPS, next } from '../lib/tour.js'

const all = () => true
test('STEPS: höchstens 5 Schritte, jeder mit Selektor, Titel und Satz', () => {
  assert.ok(STEPS.length >= 1 && STEPS.length <= 5)
  for (const s of STEPS) assert.ok(s.sel && s.title && s.text, JSON.stringify(s))
})
test('next: nimmt den nächsten Schritt, bei fehlendem Ziel den übernächsten', () => {
  assert.equal(next(0, STEPS, all), 0)
  assert.equal(next(1, STEPS, all), 1)
  assert.equal(next(1, STEPS, (sel) => sel !== STEPS[1].sel), 2)
})
test('next: Ende liefert null, ebenso wenn alle übrigen Ziele fehlen', () => {
  assert.equal(next(STEPS.length, STEPS, all), null)
  assert.equal(next(2, STEPS, () => false), null)
  assert.equal(next(0, STEPS, (sel) => sel === STEPS[0].sel), 0)
  assert.equal(next(1, STEPS, (sel) => sel === STEPS[0].sel), null)
})
test('next: kein Schritt gibt sofort null', () => assert.equal(next(0, [], all), null))
