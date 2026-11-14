import test from 'node:test'
import assert from 'node:assert/strict'

// Minimales DOM: genügt für createElementNS/setAttribute/append.
const mk = () => ({ attrs: {}, kids: [], setAttribute(k, v) { this.attrs[k] = String(v) }, append(c) { this.kids.push(c) } })
globalThis.document = { createElementNS: () => mk() }
await import('../lib/icons.js')
const { icon, names, EMOJI } = globalThis.PikaIcons

test('Symbole: Name -> svg mit Pfad, Textfarbe, ohne Label stumm', () => {
  for (const n of names) {
    const s = icon(n)
    assert.equal(s.attrs.stroke, 'currentColor'); assert.equal(s.attrs['aria-hidden'], 'true'); assert.ok(s.kids[0].attrs.d.length > 5, n)
  }
  assert.ok(names.length >= 20)
  assert.equal(icon('gibtsnicht'), null)
})
test('Symbole: mit Label für Screenreader', () => {
  const s = icon('settings', 'Einstellungen')
  assert.equal(s.attrs['aria-label'], 'Einstellungen'); assert.equal(s.attrs.role, 'img'); assert.equal(s.attrs['aria-hidden'], undefined)
})
test('Emoji-Raster: mindestens 24 verschiedene', () => assert.ok(new Set(EMOJI).size >= 24))
