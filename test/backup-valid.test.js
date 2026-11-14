import test from 'node:test'
import assert from 'node:assert/strict'

const mem = {}
globalThis.chrome = {
  storage: { local: { get: async (k) => (k in mem ? { [k]: structuredClone(mem[k]) } : {}), set: async (o) => Object.assign(mem, structuredClone(o)) } },
  bookmarks: { getTree: async () => [{ id: '0', children: [{ id: '1', title: 'Leiste', children: [] }] }], search: async () => [], create: async () => ({}) },
}
const { isBackup, restore } = await import('../lib/backup.js')
const { load, update } = await import('../lib/store.js')
const { checkSize, BACKUP_MAX } = await import('../lib/backup-plan.js')

test('isBackup: gültig und ungültige Formen', () => {
  assert.ok(isBackup({ v: 1, state: {} }))
  assert.ok(isBackup({ v: 1, state: { workspaces: [{ widgets: [] }, {}] } }))
  assert.ok(!isBackup({ v: 1, state: 'text' }))
  assert.ok(!isBackup({ v: 1, state: [] }))
  assert.ok(!isBackup({ v: 1, state: { workspaces: {} } }))
  assert.ok(!isBackup({ v: 1, state: { workspaces: [{ widgets: 'x' }] } }))
  assert.ok(!isBackup({ v: 2, state: {} }) && !isBackup(null))
})

test('checkSize: über 20 MB wird abgelehnt', () => {
  checkSize(BACKUP_MAX)
  assert.throws(() => checkSize(BACKUP_MAX + 1), /zu groß/)
})

test('restore: ungültige Sicherung ändert nichts', async () => {
  await update((S) => { S.tags = { a: '#fff' } })
  await assert.rejects(restore({ v: 1, state: 'x' }))
  assert.deepEqual((await load()).tags, { a: '#fff' })
})

test('restore: vorhandener API-Schlüssel bleibt, Schlüssel aus der Sicherung gewinnt nur wenn nicht leer', async () => {
  await update((S) => { S.settings.ai.orKey = 'sk-alt' })
  const base = (key) => ({ v: 1, state: { settings: { theme: 'dark', ai: { orKey: key } } }, folders: [] })
  await restore(base(''))
  let s = await load()
  assert.equal(s.settings.ai.orKey, 'sk-alt'); assert.equal(s.settings.theme, 'dark')
  await restore({ v: 1, state: { tags: {} }, folders: [] }) // ohne settings
  assert.equal((await load()).settings.ai.orKey, 'sk-alt')
  await restore(base('sk-neu'))
  assert.equal((await load()).settings.ai.orKey, 'sk-neu')
})
