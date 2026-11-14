import test from 'node:test'
import assert from 'node:assert/strict'
import { fileName, toDelete, isFreshProfile, deviceSlug } from '../lib/backup-plan.js'

const ts = new Date(2026, 10, 5, 12).getTime()

test('fileName: Muster und Gerätename nur [a-z0-9-]', () => {
  assert.equal(fileName('Mein PC', ts), 'pika-mein-pc-20261105.json')
  assert.equal(fileName('../../etc/x', ts), 'pika-etc-x-20261105.json')
  assert.equal(fileName('', ts), 'pika-geraet-20261105.json')
  assert.match(deviceSlug('a/b\\c:d'), /^[a-z0-9-]+$/)
  assert.ok(!fileName('../x', ts).includes('/') && !fileName('..\\x', ts).includes('\\'))
})

test('toDelete: nur eigene Dateien, älteste zuerst, neueste bleiben', () => {
  const names = ['pika-pc-20260101.json', 'pika-pc-20260103.json', 'pika-pc-20260102.json', 'pika-pc-20260104.json', 'pika-pc-20260105.json', 'pika-pc-20260106.json', 'urlaub.jpg', 'pika-laptop-20250101.json', 'pika-pc-20260101.json.bak', 'pika-pc-x-20250101.json']
  assert.deepEqual(toDelete(names, 'pc', 5), ['pika-pc-20260101.json'])
  assert.deepEqual(toDelete(names, 'pc', 4), ['pika-pc-20260101.json', 'pika-pc-20260102.json'])
  assert.deepEqual(toDelete(['urlaub.jpg'], 'pc', 5), [])
  assert.deepEqual(toDelete(names, 'pc', 0).length, 5, 'keep 0 wird auf 1 angehoben')
})

test('isFreshProfile', () => {
  const st = { settings: { backup: { lastExport: 0 } }, workspaces: [{ widgets: [] }], tags: {} }
  assert.equal(isFreshProfile(3, st), true)
  assert.equal(isFreshProfile(4, st), false)
  assert.equal(isFreshProfile(0, { ...st, settings: { backup: { lastExport: 5 } } }), false)
  assert.equal(isFreshProfile(0, { ...st, workspaces: [{ widgets: [{}] }] }), false)
  assert.equal(isFreshProfile(0, { ...st, tags: { a: '#fff' } }), false)
})
