import test from 'node:test'
import assert from 'node:assert/strict'

// Fake-Browser vor dem Import (api.js wählt beim Laden): Speicher und ein leerer Lesezeichenbaum.
const mem = {}
globalThis.chrome = {
  storage: { local: { get: async (k) => (k in mem ? { [k]: structuredClone(mem[k]) } : {}), set: async (o) => Object.assign(mem, structuredClone(o)) } },
  bookmarks: { getTree: async () => [{ id: '0', children: [{ id: '1', title: 'Leiste', children: [] }] }] },
}
const { makeBackup } = await import('../lib/backup.js')
const { update } = await import('../lib/store.js')
const { parsePhotoUrls } = await import('../lib/photo.js')

test('Sicherung klein: Fotorahmen steht nur mit Adressen im Export, keine Bilddaten', async () => {
  const urls = ['https://a.example/1.jpg', 'https://b.example/2.png']
  const r = parsePhotoUrls(urls.join('\n') + '\ndata:image/png;base64,' + 'A'.repeat(50000))
  assert.ok(r.error, 'Bilddaten als Adresse werden schon beim Anlegen abgelehnt')
  const made = parsePhotoUrls(urls.join('\n'))
  await update((S) => { S.workspaces[0].widgets = [{ id: 'p', type: 'photo', ...made.urls && { urls: made.urls, sec: 30, fit: 'contain' } }] })
  const b = await makeBackup(), json = JSON.stringify(b)
  const p = b.state.workspaces[0].widgets.find((w) => w.type === 'photo')
  assert.deepEqual(Object.keys(p).sort(), ['fit', 'id', 'sec', 'type', 'urls'])
  assert.deepEqual(p.urls, urls)
  assert.ok(!json.includes('data:') && !json.includes('base64'), 'keine Bilddaten im Export')
  assert.ok(json.length < 20000, 'Export bleibt klein: ' + json.length)
})
