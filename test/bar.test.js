import test from 'node:test'
import assert from 'node:assert/strict'
globalThis.chrome = {}
await import('../lib/bar.js')
const { splitOverflow, urlFromDrop } = globalThis.PikaBar
const dt = (m) => ({ getData: (t) => m[t] || '' })

test('urlFromDrop: uri-list mit Kommentar, Text-Fallback, nur http(s)', () => {
  assert.equal(urlFromDrop(dt({ 'text/uri-list': '# Titel\r\nhttps://a.de/x' })), 'https://a.de/x')
  assert.equal(urlFromDrop(dt({ 'text/plain': 'https://b.de' })), 'https://b.de')
  assert.equal(urlFromDrop(dt({ 'text/plain': 'javascript:alert(1)' })), '')
  assert.equal(urlFromDrop(dt({ 'text/plain': 'nur Text' })), '')
})

test('splitOverflow: alles passt -> alle sichtbar', () => assert.equal(splitOverflow([50, 50, 50], 400), 3))
test('splitOverflow: Überlauf lässt Platz für »', () => {
  const n = splitOverflow([100, 100, 100, 100], 250) // 2 Einträge (204) + » (34) = 238 <= 250
  assert.equal(n, 2)
})
test('splitOverflow: 100 Einträge sind schnell', () => {
  const t = performance.now(); const n = splitOverflow(Array(100).fill(80), 1200)
  assert.ok(n > 0 && n < 100 && performance.now() - t < 20)
})