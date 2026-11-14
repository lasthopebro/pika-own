import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { INFO, entries } from '../lib/perms-info.js'
import { docPerms } from '../tools/check-permissions.mjs'

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))
const md = fs.readFileSync(new URL('../docs/BERECHTIGUNGEN.md', import.meta.url), 'utf8')
const names = entries(manifest).map((e) => e.name)

test('Berechtigungsseite: zu jeder Berechtigung des Manifests gibt es einen Klartext', () => {
  const fehlt = names.filter((n) => !INFO[n])
  assert.deepEqual(fehlt, [], 'Klartext fehlt in lib/perms-info.js für: ' + fehlt.join(', '))
})
test('Berechtigungsseite: jede Zeile aus docs/BERECHTIGUNGEN.md hat einen Klartext, kein Klartext ohne Berechtigung', () => {
  const doc = [...docPerms(md).keys()]
  assert.deepEqual(doc.filter((n) => !INFO[n]), [])
  assert.deepEqual(Object.keys(INFO).filter((n) => !names.includes(n)), [], 'Klartext ohne Berechtigung im Manifest')
})
test('entries: optional und Adressmuster werden unterschieden, jede Berechtigung einmal', () => {
  const e = entries({ permissions: ['a'], optional_permissions: ['b'], host_permissions: ['https://x/*'], optional_host_permissions: ['<all_urls>'] })
  assert.deepEqual(e, [{ name: 'a', optional: false, host: false }, { name: 'b', optional: true, host: false }, { name: 'https://x/*', optional: false, host: true }, { name: '<all_urls>', optional: true, host: true }])
  assert.deepEqual(entries({}), [])
  assert.equal(new Set(names).size, names.length)
})
