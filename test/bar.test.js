import test from 'node:test'
import assert from 'node:assert/strict'
globalThis.chrome = {}
await import('../lib/bar.js')
const { splitOverflow } = globalThis.PikaBar

test('splitOverflow: alles passt -> alle sichtbar', () => assert.equal(splitOverflow([50, 50, 50], 400), 3))
test('splitOverflow: Überlauf lässt Platz für »', () => {
  const n = splitOverflow([100, 100, 100, 100], 250) // 2 Einträge (204) + » (34) = 238 <= 250
  assert.equal(n, 2)
})
test('splitOverflow: 100 Einträge sind schnell', () => {
  const t = performance.now(); const n = splitOverflow(Array(100).fill(80), 1200)
  assert.ok(n > 0 && n < 100 && performance.now() - t < 20)
})