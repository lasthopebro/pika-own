// Vertragstest: läuft über alle registrierten Widgets (widgets/index.js). Kein jsdom: ein minimaler DOM-Ersatz genügt,
// geprüft wird „wirft nicht“, nicht die Optik (die prüft der E2E-Ablauf „widgets“).
import test from 'node:test'
import assert from 'node:assert/strict'
import { h } from '../lib/ui.js'

const el = (tag) => {
  const e = { tag, nodeType: 1, children: [], attrs: {}, style: { setProperty() {} }, className: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } }
  Object.assign(e, { append: (...k) => e.children.push(...k), replaceChildren: (...k) => { e.children = k }, setAttribute: (k, v) => { e.attrs[k] = v }, addEventListener() {}, remove() {}, focus() {} })
  return e
}
globalThis.document = { createElement: el }
globalThis.PikaIcons = { icon: () => el('svg') }
const { WIDGETS } = await import('../widgets/index.js')

const REQUIRED = ['type', 'label', 'title', 'fields', 'defaults', 'render']
// Liefert die Verstöße eines Widgets (leer = in Ordnung).
function problems(key, d) {
  const bad = []
  for (const k of REQUIRED) if (d?.[k] == null || (k === 'type' || k === 'label' ? typeof d[k] !== 'string' || !d[k] : typeof d[k] !== 'function')) bad.push(`${key}: Pflichtfeld ${k} fehlt oder hat die falsche Art`)
  if (bad.length) return bad
  if (d.type !== key) bad.push(`${key}: type "${d.type}" passt nicht zum Eintrag`)
  try {
    const def = d.defaults()
    assert.deepEqual(JSON.parse(JSON.stringify(def)), def)
    const w = { id: 'test', type: d.type, ...def }
    const t = d.title(w)
    if (typeof t !== 'string' || !t.trim()) bad.push(`${key}: title() liefert keinen Text`)
    if (!Array.isArray(d.fields(def))) bad.push(`${key}: fields() liefert keine Liste`)
    for (const data of [w, { id: 'leer', type: d.type }]) {
      const ticks = []
      const box = el('div'), big = el('div'), sub = el('div')
      d.render(data, { big, sub, box, tick: (f) => ticks.push(f), h, toast() {}, ask: async () => null, icon: () => el('svg'), redraw() {}, patch: async (fn) => { fn(data); return data } })
      ticks.forEach((f) => f())
    }
  } catch (e) { bad.push(`${key}: ${e.message}`) }
  return bad
}

test('Widget-Vertrag: Selbsttest erkennt ein Widget ohne defaults', () => {
  const kaputt = { type: 'x', label: 'X', title: () => 'X', fields: () => [], render() {} }
  assert.match(problems('x', kaputt).join(), /x: Pflichtfeld defaults/)
})

for (const [key, d] of Object.entries(WIDGETS)) {
  test(`Widget-Vertrag: ${key}`, () => assert.deepEqual(problems(key, d), []))
}
