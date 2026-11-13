import test from 'node:test'
import assert from 'node:assert/strict'
import { resumeCards } from '../lib/resume.js'
import { parseProgress } from '../lib/ollama.js'

const now = 1e12, m = 60e3
const it = (url, ago) => ({ url, title: url, lastVisitTime: now - ago * m })

test('resumeCards: Lücke trennt Sitzungen, zu kleine fallen weg, neueste zuerst', () => {
  const items = [it('https://a.com/1', 5), it('https://a.com/2', 15), it('https://b.com/x', 25), it('https://c.com/1', 300), it('https://c.com/2', 310), it('https://c.com/3', 320), it('https://z.com/', 600), it('ftp://x/', 6)]
  const c = resumeCards(items, { now })
  assert.equal(c.length, 2)
  assert.match(c[0].title, /a\.com/)
  assert.equal(c[0].items.length, 3)
  assert.equal(c[1].items.length, 3)
})
test('resumeCards: alte Einträge werden ignoriert', () => {
  assert.equal(resumeCards([it('https://a.com/1', 99999), it('https://a.com/2', 99999), it('https://a.com/3', 99999)], { now }).length, 0)
})
test('parseProgress', () => {
  assert.deepEqual(parseProgress({ status: 'pulling x', total: 200, completed: 50 }), { status: 'pulling x', pct: 25 })
  assert.equal(parseProgress({ status: 'success' }).pct, null)
})
