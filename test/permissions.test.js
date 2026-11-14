import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { diff } from '../tools/check-permissions.mjs'

const md = fs.readFileSync(new URL('../docs/BERECHTIGUNGEN.md', import.meta.url), 'utf8')
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))

test('Berechtigungen: Manifest und Tabelle stimmen überein', () => assert.deepEqual(diff(manifest, md), []))
test('Berechtigungen: neue Berechtigung ohne Begründung wird mit Namen gemeldet', () => {
  const bad = diff({ ...manifest, permissions: [...manifest.permissions, 'geolocation'] }, md)
  assert.equal(bad.length, 1); assert.match(bad[0], /geolocation/)
})
test('Berechtigungen: veraltete Zeile und leere Begründung werden gemeldet', () => {
  assert.match(diff({ permissions: [] }, '| `alt` | x |').join(), /alt/)
  assert.match(diff({ permissions: ['a'] }, '| `a` |  |').join(), /Ohne Begründung: a/)
})
