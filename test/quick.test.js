import test from 'node:test'
import assert from 'node:assert/strict'
import { urlsFromText, timerLeft, timerNext, backupNagDue, NAG_MS, absorb } from '../lib/quick.js'

test('absorb: übernimmt fremde Sitzungen, Timer und erledigte Erinnerungen, behält lokale Änderungen', () => {
  const S = { sessions: [], lf: [], snapshots: [], settings: { theme: 'dark', pagebar: { collapsed: false } },
    meta: { 'https://a/': { remind: 5, comment: 'lokal' }, 'https://b/': { remind: 999 } },
    workspaces: [{ widgets: [{ id: 't', type: 'timer', minutes: 25, until: 1, phase: 'work' }] }] }
  const nv = { sessions: [{ id: 's' }], lf: [{ id: 'f' }], snapshots: [], settings: { theme: 'light', pagebar: { collapsed: true } },
    meta: { 'https://a/': {} }, workspaces: [{ widgets: [{ id: 't', type: 'timer', minutes: 25, until: 777, phase: 'break' }] }] }
  absorb(S, nv, 100)
  assert.equal(S.sessions[0].id, 's'); assert.equal(S.lf[0].id, 'f'); assert.equal(S.settings.pagebar.collapsed, true)
  assert.equal(S.settings.theme, 'dark', 'lokale Einstellung bleibt')
  assert.equal(S.meta['https://a/'].remind, undefined); assert.equal(S.meta['https://a/'].comment, 'lokal')
  assert.equal(S.meta['https://b/'].remind, 999, 'noch nicht fällige Erinnerung bleibt')
  assert.deepEqual([S.workspaces[0].widgets[0].until, S.workspaces[0].widgets[0].phase], [777, 'break'])
})

test('urlsFromText: Text mit Adressen, Dubletten einmal', () => {
  assert.deepEqual(urlsFromText('Schau https://a.de/x und http://b.org\nhttps://a.de/x'), ['https://a.de/x', 'http://b.org/'])
})
test('urlsFromText: uri-list-Kommentar, javascript und reiner Text werden ignoriert', () => {
  assert.deepEqual(urlsFromText('# Kommentar https://c.de\njavascript:alert(1)\nnur Text'), [])
  assert.deepEqual(urlsFromText('#x\r\nhttps://d.de/'), ['https://d.de/'])
})
test('timerLeft: läuft, pausiert, frisch', () => {
  assert.equal(timerLeft({ minutes: 25, until: 10_000 }, 4_000), 6)
  assert.equal(timerLeft({ minutes: 25, until: 1 }, 9e9), 0)
  assert.equal(timerLeft({ minutes: 25, left: 42 }, 0), 42)
  assert.equal(timerLeft({ minutes: 25, phase: 'break', brk: 5 }, 0), 300)
})
test('timerNext: einfacher Timer hält an', () => {
  const w = { minutes: 10, until: 5 }
  assert.match(timerNext(w, 100), /abgelaufen/)
  assert.equal(w.until, undefined)
})
test('timerNext: Pomodoro wechselt Arbeit -> Pause -> Arbeit', () => {
  const w = { minutes: 25, brk: 5, pomo: true, phase: 'work', until: 1 }
  assert.match(timerNext(w, 0), /Pause/)
  assert.equal(w.phase, 'break'); assert.equal(w.until, 5 * 60e3)
  timerNext(w, 1000)
  assert.equal(w.phase, 'work'); assert.equal(w.until, 1000 + 25 * 60e3)
})
test('backupNagDue: nie exportiert, kürzlich exportiert, geschlossen', () => {
  const now = 100 * 864e5
  assert.equal(backupNagDue({}, now), true)
  assert.equal(backupNagDue({ lastExport: now - 864e5 }, now), false)
  assert.equal(backupNagDue({ lastExport: 0, nagUntil: now + NAG_MS }, now), false)
})
