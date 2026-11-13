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