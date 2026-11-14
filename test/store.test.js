import test from 'node:test'
import assert from 'node:assert/strict'

// Fake storage vor dem Import von store.js, weil api.js beim Laden wählt.
const mem = {}
let delay = 0
globalThis.chrome = { storage: { local: {
  get: async (k) => { await new Promise((r) => setTimeout(r, delay)); return k in mem ? { [k]: structuredClone(mem[k]) } : {} },
  set: async (o) => { await new Promise((r) => setTimeout(r, delay)); Object.assign(mem, structuredClone(o)) },
} } }
const { migrate, update, load, SCHEMA } = await import('../lib/store.js')

test('migrate: v1 -> v2, wiederholt unverändert', () => {
  const v1 = { settings: {}, meta: { a: 1 } }
  const v2 = migrate(v1)
  assert.equal(v2.schema, SCHEMA); assert.deepEqual(v2.lf, []); assert.deepEqual(v2.meta, { a: 1 })
  assert.deepEqual(migrate(v2), v2)
})

test('load: sichert v1 vor der Migration', async () => {
  mem.pika = { meta: { x: 1 } }
  const S = await load()
  assert.equal(S.schema, SCHEMA); assert.deepEqual(mem.pika_pre_v2, { meta: { x: 1 } })
})

test('update: zwei gleichzeitige Änderungen gehen nicht verloren', async () => {
  mem.pika = { schema: SCHEMA, tags: {} }
  delay = 5
  await Promise.all([update((S) => { S.tags.a = 1 }), update((S) => { S.tags.b = 2 }), update((S) => { S.tags.c = 3 })])
  delay = 0
  assert.deepEqual(mem.pika.tags, { a: 1, b: 2, c: 3 })
})

test('merge: alter Stand (v0.5.2) behält Werte, neue Optionen bekommen Standardwerte', async () => {
  const { merge, DEFAULT } = await import('../lib/store.js')
  const alt = { settings: { theme: 'dark', accent: '#ff0000', bg: { type: 'preset' }, pagebar: { on: true, exclude: 'bank.de' }, backup: { lastExport: 5, nagUntil: 9 } } }
  const s = merge(alt).settings
  assert.equal(s.theme, 'dark'); assert.equal(s.accent, '#ff0000'); assert.equal(s.bg.type, 'preset'); assert.equal(s.bg.intensity, DEFAULT.settings.bg.intensity)
  assert.equal(s.pagebar.on, true); assert.equal(s.pagebar.exclude, 'bank.de'); assert.equal(s.pagebar.quick, 8)
  assert.deepEqual(s.backup, { lastExport: 5, nagUntil: 9, nagDays: 14, folder: { on: false, device: '', keep: 5, lastWrite: 0 } })
  assert.equal(s.newtabBar, true); assert.equal(s.openInNewTab, false); assert.equal(s.confirmDelete, true); assert.deepEqual(s.pomo, { work: 25, brk: 5 })
  assert.deepEqual(merge({ settings: { pomo: { work: 50 } } }).settings.pomo, { work: 50, brk: 5 }) // verschachtelt ergänzt
})

test('patchWidget ändert nur das eine Widget und behält fremde Felder', async () => {
  const { patchWidget, addWidget, removeWidget } = await import('../lib/store.js')
  mem.pika = { schema: SCHEMA, workspaces: [{ id: 'w1', name: 'A', widgets: [{ id: 'a', type: 'counter', n: 1, fremd: 'bleibt' }, { id: 'b', type: 'snippets', items: ['x'] }] }] }
  delay = 5
  // zwei „Tabs“ schreiben gleichzeitig verschiedene Widgets; ein Hintergrund-Feld (until) kommt dazwischen
  const [wa, wb] = await Promise.all([patchWidget('a', (w) => { w.n += 1 }), patchWidget('b', (w) => { w.items = ['y'] }), patchWidget('a', (w) => { w.until = 5 })])
  delay = 0
  const ws = mem.pika.workspaces[0].widgets
  assert.deepEqual(ws.find((w) => w.id === 'a'), { id: 'a', type: 'counter', n: 2, fremd: 'bleibt', until: 5 })
  assert.deepEqual(ws.find((w) => w.id === 'b').items, ['y'])
  assert.equal(wa.n, 2); assert.deepEqual(wb.items, ['y'])
  assert.equal(await patchWidget('weg', () => assert.fail('darf nicht laufen')), null)
  let seen; await addWidget('w1', { id: 'c', type: 'counter', n: 0 }, (S) => { seen = S.workspaces[0].widgets.length })
  assert.equal(seen, 3); assert.equal(mem.pika.workspaces[0].widgets.length, 3)
  await removeWidget('c'); assert.deepEqual(mem.pika.workspaces[0].widgets.map((w) => w.id), ['a', 'b'])
})

test('addWidget/removeWidget: Workspace ohne widgets, null-Eintrag', async () => {
  const { addWidget, removeWidget, patchWidget } = await import('../lib/store.js')
  mem.pika = { schema: SCHEMA, workspaces: [{ id: 'w1', name: 'A' }] }
  await addWidget('w1', { id: 'n', type: 'counter', n: 0 })
  mem.pika.workspaces[0].widgets.unshift(null)
  assert.equal((await patchWidget('n', (w) => { w.n = 1 })).n, 1)
  await removeWidget('n'); assert.deepEqual(mem.pika.workspaces[0].widgets, [null])
})

test('galleryMode/galleryDensity: Standard bei alten Ständen, gültige Werte bleiben, ungültige fallen zurück', async () => {
  const { merge } = await import('../lib/store.js')
  const d = merge({ settings: { theme: 'dark' } }).settings
  assert.equal(d.galleryMode, 'grid'); assert.equal(d.galleryDensity, 'm')
  const l = merge({ settings: { galleryMode: 'list', galleryDensity: 's' } }).settings
  assert.equal(l.galleryMode, 'list'); assert.equal(l.galleryDensity, 's')
  const bad = merge({ settings: { galleryMode: 'x', galleryDensity: 'xl' } }).settings
  assert.equal(bad.galleryMode, 'grid'); assert.equal(bad.galleryDensity, 'm')
  assert.equal(merge(merge({ settings: { galleryMode: 'list' } })).settings.galleryMode, 'list') // wiederholbar
})

test('backup.folder: Standardwerte, alte Stände ohne das Feld, tiefes merge', async () => {
  const { merge } = await import('../lib/store.js')
  assert.deepEqual(merge({}).settings.backup.folder, { on: false, device: '', keep: 5, lastWrite: 0 })
  const alt = merge({ settings: { backup: { lastExport: 7, nagDays: 30 } } }).settings.backup
  assert.equal(alt.lastExport, 7); assert.deepEqual(alt.folder, { on: false, device: '', keep: 5, lastWrite: 0 })
  assert.deepEqual(merge({ settings: { backup: { folder: { on: true, device: 'pc' } } } }).settings.backup.folder, { on: true, device: 'pc', keep: 5, lastWrite: 0 })
})

test('tourDone/emptyCol: Standard bei alten Ständen, gesetzte Werte bleiben, merge ist wiederholbar', async () => {
  const { merge, DEFAULT } = await import('../lib/store.js')
  assert.equal(DEFAULT.settings.tourDone, false); assert.equal(DEFAULT.settings.emptyCol, false)
  const alt = merge({ settings: { theme: 'dark' } }).settings
  assert.equal(alt.tourDone, false); assert.equal(alt.emptyCol, false)
  const neu = merge(merge({ settings: { tourDone: true, emptyCol: true } })).settings
  assert.equal(neu.tourDone, true); assert.equal(neu.emptyCol, true)
})
