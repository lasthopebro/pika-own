import test from 'node:test'
import assert from 'node:assert/strict'
import { groupHistory, renameName, parseAiTopics, score, normUrl, parseBars, barsToText, domainOf } from '../lib/logic.js'

const H = [
  { url: 'https://www.github.com/a', title: 'A', visitCount: 5, lastVisitTime: 100 },
  { url: 'https://github.com/b', title: 'B', visitCount: 9, lastVisitTime: 50 },
  { url: 'https://example.org/', title: 'E', visitCount: 3, lastVisitTime: 300 },
  { url: 'moz-extension://x/y', visitCount: 99 },
]

test('groupHistory: top gruppiert www/ohne-www, sortiert Unterseiten', () => {
  const g = groupHistory(H, { mode: 'top' })
  assert.equal(g[0].domain, 'github.com')
  assert.equal(g[0].visits, 14)
  assert.equal(g[0].subs[0].url, 'https://github.com/b')
  assert.equal(g.length, 2)
})
test('groupHistory: recent, filter, hidden, today', () => {
  assert.equal(groupHistory(H, { mode: 'recent' })[0].domain, 'example.org')
  assert.deepEqual(groupHistory(H, { filter: 'git' }).map((x) => x.domain), ['github.com'])
  assert.deepEqual(groupHistory(H, { hidden: ['github.com'] }).map((x) => x.domain), ['example.org'])
  assert.equal(groupHistory(H, { mode: 'today', now: 1e12 }).length, 0)
})
test('renameName', () => {
  assert.equal(renameName('foo bar', { find: 'o', replace: '0' }), 'f00 bar')
  assert.equal(renameName('a.b', { find: '.', replace: '-' }), 'a-b')
  assert.equal(renameName('a1b22', { find: '\\d+', replace: '#', regex: true }), 'a#b#')
  assert.equal(renameName('hallo welt', { caseMode: 'title' }), 'Hallo Welt')
  assert.equal(renameName('$x', { find: 'x', replace: '$&' }), '$$&')
  assert.throws(() => renameName('a', { find: '(', regex: true }))
})
test('parseAiTopics: Dubletten, Fremdindizes, Rest', () => {
  const r = parseAiTopics('Text {"topics":{"Dev":[0,1,1,9],"Kino":[2]}} Ende', 4)
  assert.deepEqual(r, { Dev: [0, 1], Kino: [2], Sonstiges: [3] })
  assert.throws(() => parseAiTopics('nix', 2))
})
test('score / normUrl / domainOf', () => {
  assert.ok(score('git', 'GitHub') > score('ghb', 'GitHub'))
  assert.equal(score('zzz', 'abc'), 0)
  assert.equal(normUrl('https://A.com/x/#h'), normUrl('https://a.com/x'))
  assert.equal(domainOf('kaputt'), '')
})
test('parseBars roundtrip', () => {
  const b = parseBars('Dev ; top ; github|mdn ; 5\nZ ; quatsch')
  assert.equal(b[0].limit, 5)
  assert.equal(b[0].filter, 'github|mdn')
  assert.equal(b[1].mode, 'top')
  assert.equal(parseBars(barsToText(b)).length, 2)
})
